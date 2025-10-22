const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // get token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request, exclude password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // allow next middleware/route
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
