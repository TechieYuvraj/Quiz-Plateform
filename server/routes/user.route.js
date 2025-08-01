import express from 'express';
import { sendOtp, verifyAndRegister, sendLoginOtp, verifyLoginOtp, getUserProfile, logoutUser } from '../controllers/User.controller.js';
import { verifyToken } from '../middleware/verifyToken.middleware.js';
import { getTodayQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', verifyAndRegister);
router.post('/send-login-otp', sendLoginOtp);
router.post('/login', verifyLoginOtp);
router.post('/logout', logoutUser);

router.get('/profile', verifyToken, getUserProfile);
router.get('/quiz/today', verifyToken, getTodayQuiz);
// router.get('/quiz/today', getTodayQuiz);

export default router;
