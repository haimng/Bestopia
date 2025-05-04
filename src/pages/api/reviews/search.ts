import { NextApiRequest, NextApiResponse } from 'next';
import { searchReviewsByKeyword } from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { keyword, page = '1' } = req.query;

        if (!keyword || typeof keyword !== 'string') {
            return res.status(400).json({ error: 'Keyword parameter is required and must be a string' });
        }

        const pageNumber = parseInt(page as string, 10);

        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ error: 'Invalid page parameter' });
        }

        try {
            const { reviews, totalPages } = await searchReviewsByKeyword(keyword, pageNumber);
            res.status(200).json({ reviews, totalPages });
        } catch (error) {
            console.error('Error searching reviews:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}