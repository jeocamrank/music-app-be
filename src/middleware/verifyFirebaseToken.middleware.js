import admin from "../firebase/firebaseAdmin.js";


export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    next(error);
  }
};
