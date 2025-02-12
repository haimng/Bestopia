import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import pool from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, display_name, email, password } = req.body;

    const client = await pool.connect();
    try {
      const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserResult = await client.query(
        'INSERT INTO users (username, display_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, display_name, email, hashedPassword]
      );

      res.status(201).json(newUserResult.rows[0]);
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message || 'Unknown error' });
    } finally {
      client.release();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
