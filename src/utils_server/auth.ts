import jwt from 'jsonwebtoken';
import pool from '../utils/db';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export const authenticateAndAuthorizeAdmin = async (req: any, res: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let userId;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET_KEY);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await pool.connect();
    try {
        const userResult = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        return { userId, client };
    } catch (error) {
        client.release();
        throw error;
    }
};
