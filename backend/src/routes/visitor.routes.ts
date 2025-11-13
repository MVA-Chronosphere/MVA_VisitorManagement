import express from "express";
import { addVisitor, notifyHost  } from "../controllers/visitor.controller";

const router = express.Router();

router.post("/add", addVisitor);
router.post("/notify", notifyHost);

export default router;
