import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
console.log(req.cookies)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_STRING);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token.',
      });
    }

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);

    let statusCode = 401;
    let message = 'Authentication failed.';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please log in again.';
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: error.message,
    });
  }
};

export default verifyToken;
