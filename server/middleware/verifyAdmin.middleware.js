import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js";

const verifyAdmin = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.ASTID; // admin Session Token
            if (!token) {
                return res.status(401).json({ message: "No token found. Admin access denied." })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            const admin = await Admin.findById(decoded.id).select("-password")
            if (!admin) {
                return res.status(403).json({ message: "Not authorized as admin" })
            }

            if (allowedRoles.length && !allowedRoles.includes(admin.role)) {
                return res.status(403).json({ message: "Insufficient permissions" })
            }

            req.admin = admin
            next()
        } catch (err) {
            console.error("Admin auth error:", err.message)
            return res.status(401).json({ message: "Invalid or expired token" })
        }
    }
}

export default verifyAdmin;
