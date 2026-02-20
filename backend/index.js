import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/connectDB.js";
import apiRoutes from "./routes/index.js"; 

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ICI tu montes toutes tes routes sous /api
app.use("/api", apiRoutes);

const Port = process.env.Port || 5000;
app.listen(Port, () => {
  connectDB();
  console.log(`server is running on port ${Port}`);
});
