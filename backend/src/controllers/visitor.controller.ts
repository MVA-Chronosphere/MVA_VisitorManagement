import { Request, Response } from "express";
import { spawn ,  exec  } from "child_process";
import path from "path";
import Visitor from "../models/visitor.model";
import { generateIdCard } from "../utils/generateIdCard";

// ✅ Your registered Signal number
const SIGNAL_NUMBER = "+917661841091";

// ✅ Path to your signal-cli.bat (absolute path)
const SIGNAL_CLI_PATH = path.resolve(
  __dirname,
  "../../signal-cli/bin/signal-cli.bat"
);

// ✅ Default fallback host number
const DEFAULT_HOST_NUMBER = "+919944774474";

// ✅ Department-specific host numbers (User can update these)
const DEPARTMENT_HOST_NUMBERS: { [key: string]: string } = {
  "Front Office & Vision Paradise": DEFAULT_HOST_NUMBER,
  "Vision Petals": DEFAULT_HOST_NUMBER,
  "Vision Mantra": DEFAULT_HOST_NUMBER,
  "Barakat Office": DEFAULT_HOST_NUMBER,
  "Whitehouse": DEFAULT_HOST_NUMBER,
  "Mini Tajmahal": DEFAULT_HOST_NUMBER,
  "Vision Udaan": DEFAULT_HOST_NUMBER,
  "Vision Divine": DEFAULT_HOST_NUMBER,
  "Chronosphere": DEFAULT_HOST_NUMBER,
  "Nacl": DEFAULT_HOST_NUMBER,
  "All is well Hospital": DEFAULT_HOST_NUMBER,
  "Vision Vista": DEFAULT_HOST_NUMBER,
  "Josh Club": DEFAULT_HOST_NUMBER,
  // User can update these numbers as needed
};

/**
 * ✅ Utility: Send Signal message safely on Windows
 */


function sendSignalMessage(phone, message) {
  return new Promise((resolve, reject) => {
    const cmd = `"D:\\visitor-management\\backend\\signal-cli\\bin\\signal-cli.bat" -u +917661841091 send --message-from-stdin ${phone}`;

    const child = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error);
      } else {
        resolve(stdout);
      }
    });

    if (child.stdin) {
      child.stdin.write(message);
      child.stdin.end();
    } else {
      reject(new Error("Failed to get stdin stream for child process."));
    }
  });
}

/**
 * ✅ Add a new visitor
 */
export const addVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, reason, department, description, hostEmail, photo } = req.body;

    // Basic validation
    if (!name || !reason || !photo) {
      res.status(400).json({ success: false, message: "Name, Reason, and Photo are required." });
      return;
    }

    // Create new visitor entry
    const newVisitor = new Visitor({
      name,
      reason,
      department,
      description,
      hostEmail,
      photo,
    });

    await newVisitor.save();

    // Generate ID Card
    const cardPath = await generateIdCard(newVisitor.toObject() as any);
    const cardUrl = `${req.protocol}://${req.get("host")}/${cardPath.replace(/\\/g, "/")}`;

    res.status(200).json({
      success: true,
      message: "Visitor added successfully",
      cardUrl,
      visitorId: newVisitor._id,
    });
  } catch (error: any) {
    console.error("❌ Error adding visitor:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * ✅ Notify host via Signal
 * Triggered when “Notify Host” is clicked on frontend
 */
export const notifyHost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body; // phoneNumber is no longer directly used from req.body

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }

    // Determine the target phone number based on the visitor's department
    // If department is not found in mapping, fallback to DEFAULT_HOST_NUMBER
    const target = (visitor.department && DEPARTMENT_HOST_NUMBERS[visitor.department])
      ? DEPARTMENT_HOST_NUMBERS[visitor.department].trim()
      : DEFAULT_HOST_NUMBER.trim();

    if (!target.startsWith("+91")) {
      console.error("❌ Invalid or missing recipient phone number:", target);
      res.status(400).json({ success: false, message: "Invalid or missing recipient phone number." });
      return;
    }

    const cardPath = path.join("uploads", "idcards", `${visitor._id}.pdf`);
    const cardUrl = `${req.protocol}://${req.get("host")}/${cardPath.replace(/\\/g, "/")}`;

    const message = `🚪 Visitor Alert
👤 ${visitor.name}
🏢 ${visitor.department || "-"}
🎯 ${visitor.reason}
📅 ${new Date().toLocaleString()}

ID: ${cardUrl}`;

    console.log("📨 Sending to:", target);

    await sendSignalMessage(target, message);

    res.status(200).json({ success: true, message: "Host notified successfully via Signal." });
  } catch (error: any) {
    console.error("❌ Error notifying host:", error);
    res.status(500).json({ success: false, message: "Failed to send notification.", error: error.message });
  }
};

/**
 * ✅ Get all visitors
 */
export const getVisitors = async (req: Request, res: Response): Promise<void> => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: visitors });
  } catch (error: any) {
    console.error("❌ Error fetching visitors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch visitors" });
  }
};

/**
 * ✅ Get visitor by ID
 */
export const getVisitorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }

    res.status(200).json({ success: true, data: visitor });
  } catch (error: any) {
    console.error("❌ Error fetching visitor:", error);
    res.status(500).json({ success: false, message: "Error retrieving visitor" });
  }
};

/**
 * ✅ Delete visitor
 */
export const deleteVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findByIdAndDelete(id);

    if (!visitor) {
      res.status(404).json({ success: false, message: "Visitor not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Visitor deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting visitor:", error);
    res.status(500).json({ success: false, message: "Error deleting visitor" });
  }
};
