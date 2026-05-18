const authMiddleware = (req, res, next) => {
  const user = req.session?.user;
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  req.userId = user.id;
  req.userRole = user.role;
  req.userName = user.name;
  
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
