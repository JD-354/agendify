import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}


export const authenticateToken = (req: Request, res: Response, next: NextFunction):void => {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    
    if (!token) {
         res.status(403).json({ message: "Acceso denegado. No se proporcionó un token." });
         return;
    }

    // Verifica el token
    jwt.verify(token, process.env.JWT_SECRETO || " ", (err, decoded) => {
        if (err) {
            res.status(401).json({ message: "Token no válido." });
            return;
        }

        (req as any).user = (decoded as JwtPayload).id;
    

        next();
    });
};
