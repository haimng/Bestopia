import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { title, subtitle, introduction, coverPhoto } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO reviews (title, subtitle, introduction, cover_photo) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, subtitle, introduction, coverPhoto]
            );
            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            console.error('Error posting review:', error);
            res.status(500).json({ error: 'Failed to post review', details: error.message || 'Unknown error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
