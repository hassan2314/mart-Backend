import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ allow token headers
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());



//import rotuers
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);



app.use(errorHandler);
export { app };
