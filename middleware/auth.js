const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SICKRET_KEY_LOL, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is invalid or expired" });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;