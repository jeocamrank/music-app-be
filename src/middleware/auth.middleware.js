import admin from "../firebase/firebaseAdmin.js";

// Middleware: bắt buộc đăng nhập
export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - you must be logged in" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Gắn user info vào req
    req.auth = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      //   role: decodedToken.role || "user", // role custom claim
    };
    
    next();
  } catch (error) {
    console.error("protectRoute error:", error);
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};

// Middleware: bắt buộc là admin
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.auth?.uid) {
      return res.status(401).json({ message: "Unauthorized - not logged in" });
    }

    // Cách 1: check email trùng với ADMIN_EMAIL trong .env
    const isAdmin = process.env.ADMIN_EMAIL === req.auth.email;

    // Cách 2 (khuyến nghị): dùng custom claim role === 'admin'
    // const isAdmin = req.auth.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized - must be admin" });
    }

    next();
  } catch (error) {
    console.error("requireAdmin error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
