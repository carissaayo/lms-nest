import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    // Verify the token using your secret key
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token." });
      }

      // Attach the decoded user information to the request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to authenticate token." });
  }
};
