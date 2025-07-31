import express from "express"
import verifyAdmin from "../middleware/verifyAdmin.middleware.js";
import { loginAdmin, registerAdmin, addQuestion } from "../controllers/admin.controller.js";

const router = express.Router();

router.post('/add-question', verifyAdmin, addQuestion);
router.post('/loginAdmin', loginAdmin);
router.post('/registerAdmin', registerAdmin);


export default router;