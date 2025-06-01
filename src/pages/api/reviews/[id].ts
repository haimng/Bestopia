import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateAndAuthorizeAdmin } from '../../../utils_server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === 'PUT') {
        const { title, subtitle, introduction, cover_photo, tags } = req.body;

        try {
            await client.query('BEGIN');

            const updateReviewQuery = `
                UPDATE reviews
                SET title = $1, subtitle = $2, introduction = $3, cover_photo = $4, tags = $5, updated_at = NOW()
                WHERE id = $6
                RETURNING *
            `;
            const updateReviewValues = [title, subtitle, introduction, cover_photo, tags, id];
            const reviewResult = await client.query(updateReviewQuery, updateReviewValues);

            await client.query('COMMIT');
            
            await res.revalidate(`/reviews/${reviewResult.rows[0].slug}`);
            res.status(200).json(reviewResult.rows[0]);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error updating review:', error);
            res.status(500).json({ error: 'Failed to update review', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else if (req.method === 'DELETE') {
        try {            
            const reviewResult = await client.query('SELECT slug FROM reviews WHERE id = $1', [id]);
            if (reviewResult.rows.length === 0) {
                return res.status(404).json({ error: 'Review not found' });
            }
            const slug = reviewResult.rows[0].slug;

            await client.query('BEGIN');

            const deleteProductComparisonsQuery = 'DELETE FROM product_comparisons WHERE product_id IN (SELECT id FROM products WHERE review_id = $1)';
            await client.query(deleteProductComparisonsQuery, [id]);

            const deleteProductReviewsQuery = 'DELETE FROM product_reviews WHERE product_id IN (SELECT id FROM products WHERE review_id = $1)';
            await client.query(deleteProductReviewsQuery, [id]);

            const deleteProductsQuery = 'DELETE FROM products WHERE review_id = $1';
            await client.query(deleteProductsQuery, [id]);

            const deleteReviewQuery = 'DELETE FROM reviews WHERE id = $1';
            await client.query(deleteReviewQuery, [id]);

            await client.query('COMMIT');

            await res.revalidate(`/reviews/${slug}`);
            res.status(200).json({ message: 'Review and associated data deleted successfully' });
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error deleting review and associated data:', error);
            res.status(500).json({ error: 'Failed to delete review and associated data', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
