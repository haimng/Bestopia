import { NextApiRequest, NextApiResponse } from 'next';
import { insertSupportRequest } from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const email = req.body.email?.trim();
        const message = req.body.message?.trim();

        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required.' });
        }

        try {
            const result = await insertSupportRequest(email, message);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error handling support request:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Internal server error', details: errorMessage });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}