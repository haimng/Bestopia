import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { title, subtitle, introduction, coverPhoto, productDetails, productReviews } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const lines = productDetails.trim().split('\n');
            const headers = lines[0].split('\t').map((header: string) => header.trim());
            const products = lines.slice(1).map((line: string) => {
                const values = line.split('\t').map((value: string) => value.trim());
                const product: any = {};
                headers.forEach((header: string, index: number) => {
                    product[header] = values[index];
                });
                return product;
            });

            const firstProductImageUrl = products.length > 0 ? products[0].image_url : null;
            const finalCoverPhoto = coverPhoto.trim() || firstProductImageUrl;

            const reviewResult = await client.query(
                'INSERT INTO reviews (title, subtitle, introduction, cover_photo) VALUES ($1, $2, $3, $4) RETURNING *',
                [title.trim(), subtitle.trim(), introduction.trim(), finalCoverPhoto]
            );

            const reviewId = reviewResult.rows[0].id;

            const productReviewLines = productReviews.trim().split('\n');
            const productReviewHeaders = productReviewLines[0].split('\t').map((header: string) => header.trim());
            const productReviewsArray = productReviewLines.slice(1).map((line: string) => {
                const values = line.split('\t').map((value: string) => value.trim());
                const productReview: any = {};
                productReviewHeaders.forEach((header: string, index: number) => {
                    productReview[header] = values[index];
                });
                return productReview;
            });

            let baseRating = 5.0;

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const productResult = await client.query(
                    'INSERT INTO products (review_id, name, description, image_url, product_page) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [reviewId, product.name, product.description, product.image_url, product.product_page]
                );

                const productId = productResult.rows[0].id;
                const productReview = productReviewsArray[i];

                if (productReview) {
                    const userId = Math.floor(Math.random() * 5) + 1; // Random integer from 1 to 5
                    const rating = i < 2 ? '5.0' : (baseRating - Math.random() * 0.1).toFixed(1); // First two ratings are 5.0, then decrement slightly
                    if (i >= 2) baseRating -= 0.1; // Ensure next rating is lower
                    await client.query(
                        'INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4)',
                        [productId, userId, parseFloat(rating), productReview.review_text]
                    );
                }
            }

            await client.query('COMMIT');
            res.status(201).json(reviewResult.rows[0]);
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error posting review:', error);
            res.status(500).json({ error: 'Failed to post review', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
