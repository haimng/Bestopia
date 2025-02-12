import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { authenticateAndAuthorizeAdmin } from '../../../utils_server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        let client;
        try {
            const authResult = await authenticateAndAuthorizeAdmin(req, res);
            if (!authResult) return; // Response already sent in case of error
            client = authResult.client;
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
            return res.status(500).json({ error: 'Internal server error', details: errorMessage });
        }

        const { id } = req.query;
        const { title, subtitle, introduction, cover_photo } = req.body;

        try {
            await client.query('BEGIN');

            const updateReviewQuery = `
                UPDATE reviews
                SET title = $1, subtitle = $2, introduction = $3, cover_photo = $4, updated_at = NOW()
                WHERE id = $5
                RETURNING *
            `;
            const updateReviewValues = [title, subtitle, introduction, cover_photo, id];
            const reviewResult = await client.query(updateReviewQuery, updateReviewValues);

            await client.query('COMMIT');
            res.status(200).json(reviewResult.rows[0]);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error updating review:', error);
            res.status(500).json({ error: 'Failed to update review', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
