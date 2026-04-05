import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.JWT_SICKRET_KEY_LOL as string, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: "Token is invalid or expired" });
      return;
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;