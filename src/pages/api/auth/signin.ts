import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../../utils/db';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const client = await pool.connect();
    try {
      const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '1y' });

      res.status(200).json({ token, role: user.role });
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message || 'Unknown error' });
    } finally {
      client.release();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
