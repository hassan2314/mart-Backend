import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { seedDemoUsers } from "./seeds/demoUsers.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(async () => {
    try {
      await seedDemoUsers();
    } catch (err) {
      console.error("Demo account seed failed:", err?.message || err);
    }
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
