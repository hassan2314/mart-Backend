import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();

// Trust proxy (required behind Render, Nginx, etc.) so express-rate-limit can read X-Forwarded-For
app.set("trust proxy", 1);

app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, origin || corsOrigins[0]);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());



//import rotuers



import userRouter from "./routes/user.routes.js";



import productRouter from "./routes/product.routes.js";



import orderRouter from "./routes/order.routes.js";



import blogRouter from "./routes/blog.routes.js";



import adminRouter from "./routes/admin.routes.js"; // Import adminRouter







app.use("/api/v1/products", productRouter);



app.use("/api/v1/users", userRouter);



app.use("/api/v1/orders", orderRouter);



app.use("/api/v1/blogs", blogRouter);



app.use("/api/v1/admin", adminRouter); // Use adminRouter







app.use(errorHandler);



export { app };
