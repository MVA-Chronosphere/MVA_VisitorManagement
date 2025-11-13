import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import visitorRoutes from "./routes/visitor.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // handle Base64 photo uploads
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visitor_management")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Serve uploaded ID cards (PDFs)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Routes
app.use("/api/visitors", visitorRoutes);

// ✅ Default Route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Visitor Management Backend Running Successfully");
});

// ✅ Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
