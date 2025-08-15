import express from "express";
import verifyAdmin from "../middleware/verifyAdmin.middleware.js";
import { loginAdmin, registerAdmin, addQuestion, getAdminProfile, getDashboardStats, getAllQuestions, deleteQuestion, editQuestion } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/add-question", verifyAdmin(["superadmin", "moderator"]), addQuestion)
router.post("/loginAdmin", loginAdmin)
router.post("/registerAdmin", (req, res, next) => {
    if (req.body.role === "moderator") {
        // Moderator creation requires superadmin login
        return verifyAdmin(["superadmin"])(req, res, next);
    }
    next();
}, registerAdmin)
router.get('/profile', verifyAdmin(), getAdminProfile);
router.get('/dashboard-stats', verifyAdmin(["superadmin", "moderator"]), getDashboardStats);
router.get("/all-questions", verifyAdmin(["superadmin", "moderator"]), getAllQuestions);
// router.delete("/questions/:id", verifyAdmin(["superadmin", "moderator"]), deleteQuestion);
// router.post("/edit-question", verifyAdmin(["superadmin", "moderator"]), editQuestion);
router.delete("/delete-question/:id", verifyAdmin(["superadmin", "moderator"]), deleteQuestion);
router.put("/edit-question/:id", verifyAdmin(["superadmin", "moderator"]), editQuestion);

export default router