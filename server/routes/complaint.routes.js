import express from "express";
 
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
} from "../controllers/complaint.controller.js";
 
import verifyToken from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
 
const router = express.Router();
 
// CREATE
router.post(
  "/",
//   verifyToken,
//   checkRole(["resident", "admin"]),
  createComplaint
);
 
// GET ALL
router.get(
  "/",
  verifyToken,
  checkRole(["resident", "admin"]),
  getComplaints
);
 
// GET ONE
router.get(
  "/:id",
  verifyToken,
  checkRole(["resident", "admin"]),
  getComplaint
);
 
// UPDATE
router.patch(
  "/:id",
  verifyToken,
  checkRole(["resident", "admin"]),
  updateComplaint
);
 
// DELETE
router.delete(
  "/:id",
  verifyToken,
  checkRole(["resident", "admin"]),
  deleteComplaint
);
 
export default router;