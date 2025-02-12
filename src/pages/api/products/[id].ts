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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: 'Internal server error', details: errorMessage });
        }

        const { id } = req.query;
        const { name, description, image_url, product_page } = req.body;

        try {
            await client.query('BEGIN');

            const updateProductQuery = `
                UPDATE products
                SET name = $1, description = $2, image_url = $3, product_page = $4, updated_at = NOW()
                WHERE id = $5
                RETURNING *
            `;
            const updateProductValues = [name, description, image_url, product_page, id];
            const productResult = await client.query(updateProductQuery, updateProductValues);

            await client.query('COMMIT');
            res.status(200).json(productResult.rows[0]);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
