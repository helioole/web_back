import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123');

      req.userId = decoded._id;
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(403).json({
        message: 'No Access',
      });
    }
  } else {
    return res.status(403).json({
      message: 'No Access',
    });
  }
};
