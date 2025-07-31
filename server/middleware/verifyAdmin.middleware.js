import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js"; // ✅ Correct model

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.ASTID; // Admin Session Token ID
        if (!token) {
            return res.status(401).json({ message: "No token found. Admin access denied." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id); // ✅ Admin, not User
        if (!admin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }
        req.admin = admin; // Attach admin to request
        next();
    } catch (err) {
        console.error("Admin auth error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default verifyAdmin;
