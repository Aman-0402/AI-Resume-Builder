const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token using our JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user id to request so controllers can use it
    req.userId = decoded.id;

    next(); // pass control to the next function (the controller)
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
