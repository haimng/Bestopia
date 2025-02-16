import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/db';
import slugify from 'slugify';
import { authenticateAndAuthorizeAdmin } from '../../utils_server/auth';
import { crawlProduct } from '../../utils_server/crawler';

const womanReviewerIds = [1, 2, 3, 6, 7, 8];
const manReviewerIds = [4, 5, 9, 10];

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        let client;
        try {
            const authResult = await authenticateAndAuthorizeAdmin(req, res);
            if (!authResult) return; // Response already sent in case of error
            client = authResult.client;
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
            return res.status(500).json({ error: 'Internal server error', details: errorMessage });
        }

        const { title, subtitle, introduction, coverPhoto, productDetails, productReviews, gender } = req.body;

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
            const finalCoverPhoto = coverPhoto.trim() || firstProductImageUrl || '';

            const slug = slugify(title.trim(), { lower: true });

            const reviewResult = await client.query(
                'INSERT INTO reviews (title, subtitle, introduction, cover_photo, slug) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [title.trim(), subtitle.trim(), introduction.trim(), finalCoverPhoto, slug]
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
                    [reviewId, product.name, product.description, product.image_url || '', product.product_page || '']
                );

                const productId = productResult.rows[0].id;
                const productReview = productReviewsArray[i];

                if (productReview) {
                    let userId;
                    if (gender === 'woman') {
                        userId = womanReviewerIds[Math.floor(Math.random() * womanReviewerIds.length)];
                    } else if (gender === 'man') {
                        userId = manReviewerIds[Math.floor(Math.random() * manReviewerIds.length)];
                    } else {
                        const allReviewerIds = [...womanReviewerIds, ...manReviewerIds];
                        userId = allReviewerIds[Math.floor(Math.random() * allReviewerIds.length)];
                    }

                    const rating = i < 2 ? '5.0' : (baseRating - Math.random() * 0.1).toFixed(1); // First two ratings are 5.0, then decrement slightly
                    if (i >= 2) baseRating -= 0.1; // Ensure next rating is lower
                    await client.query(
                        'INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4)',
                        [productId, userId, parseFloat(rating), productReview.review_text]
                    );
                }

                // Update product with crawled data
                try {
                    const crawledData = await crawlProduct(product);
                    await client.query(
                        'UPDATE products SET image_url = $1, product_page = $2 WHERE id = $3',
                        [crawledData.image_url, crawledData.product_page, productId]
                    );

                    // Update review cover photo if it is empty
                    if (!coverPhoto.trim() && i === 0) {
                        await client.query(
                            'UPDATE reviews SET cover_photo = $1 WHERE id = $2',
                            [crawledData.image_url, reviewId]
                        );
                    }
                } catch (error) {
                    console.error(`Error crawling product ${product.name}:`, error);
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
