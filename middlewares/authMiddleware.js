import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !decoded.userId || !Types.ObjectId.isValid(decoded.userId)){
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        req.user = { id: decoded.userId }
        next();
        //  req.user = { id: decoded.userId, email: decoded.email };

    }catch(err){
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

export default authMiddleware;