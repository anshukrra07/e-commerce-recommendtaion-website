/**
 * Middleware to check if user has admin role
 * Must be used after the protect middleware
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
};

/**
 * Middleware to check if user has customer role
 * Must be used after the protect middleware
 */
export const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Customer privileges required."
    });
  }
};

/**
 * Middleware to check if user has seller role
 * Must be used after the protect middleware
 */
export const isSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Seller privileges required."
    });
  }
};
