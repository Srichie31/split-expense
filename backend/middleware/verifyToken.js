// Middleware to verify JWT token
const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "INVALID_TOKEN" });
    }

    req.userId = decoded.userId;
    next();
  });
};
