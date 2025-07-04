import jwt from 'jsonwebtoken';

export const authRequired= (req, res, next) => {
     try {
        const token = req.cookies.token; // Obtener el token de las cookies
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            req.user = decoded;
        });
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};