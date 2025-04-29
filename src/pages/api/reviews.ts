import { NextApiRequest, NextApiResponse } from 'next';
import slugify from 'slugify';
import { authenticateAndAuthorizeAdmin } from '../../utils_server/auth';
import { crawlProduct } from '../../utils_server/crawler';
import { askGPT } from '../../utils_server/openai';

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

        const { product_name, title, subtitle, introduction, coverPhoto, productDetails, productReviews, gender } = req.body;

        if (product_name && product_name.trim()) {
          try {
            const productsResponse = await askGPT("gpt-4o-search-preview", bestProductsPrompt(product_name.trim())) || '';
            const parsedResults = parseTSV(productsResponse);
            
            const reviewsResponse = await askGPT("gpt-4o", productReviewsPrompt(parsedResults.task2.map((item: any) => item.name + '\t' + item.description).join('\n'))) || '';
            const parsedReviews = parseTSV(reviewsResponse);

            parsedResults.task3 = parsedReviews.task1;
            parsedResults.gptResponse = `${productsResponse}\n----------\n${reviewsResponse}`;

            res.status(200).json(parsedResults);
          } 
          catch (error: any) {
            console.error('Error calling askGPT:', error);
            res.status(500).json({ error: 'Failed to ask GPT', details: error.message || 'Unknown error' });
          }
          return;
        }

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

                // Update product with crawled data for the first 4 products only
                if (i < 4) {
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

function bestProductsPrompt(product_name: string): string {
  return `
    You’re creating a review page for the best ${product_name} of 2025.
    Do all the following tasks and provide their results in TSV-formatted text. 

    * Task 1: Write a title, subtitle, and introduction for my review page. 
      Title should be in this format: "The Best {product_name} of 2025" or "Top {product_name} of 2025".
      Introduction should be 500 to 700 characters long.
      Don’t mention about Amazon. Don’t mention about only top 5 because I may add more later.  
      Provide the result in TSV-formatted text with the following field names in the first line: "title subtitle  introduction". 
      Make sure there is no line-break between subtitle and introduction.

    * Task 2: Find top 5 of those product pages on https://www.amazon.com and provide their name, description in TSV-formatted text with the following field names in the first line: "name	description".
      Each product description should be about 200 characters long.
    
    Make sure to provide the results in TSV-formatted text (each tsv per task) so users can copy it easily.
    Don’t include any extra text or explanation. Just provide the results in TSV-formatted text.
    Each task's result should be separated by a line with 10 dashes (----------).
  `;
};

function productReviewsPrompt(products: string): string {
  return `
    I have a list of products with their names and descriptions as follows:
    ${products}

    Write an in-depth, honest and very long review (at least 1,500 characters, this is important) for each product in TSV-formatted text with the field name "review_text" in the first line.
    Don’t mention about a specific price. Don’t include source. 
    Repeat the product name only once in the review.
    In the tsv, each review one line, no extra line-break, don't wrap the review in double quotations.
    Don’t include any extra text or explanation. Just provide the results in TSV-formatted text. Don't wrap the text in any characters.
  `;
};

function parseTSV(gptResponse: string) {    
  const tasks = gptResponse.replace(/```/g, '').split('----------').map(task => task.trim()).filter(task => task);
  const parsedResults: any = {};

  tasks.forEach((task, index) => {
    const lines = task.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length > 0) {
      const headers = lines[0].split('\t').map(header => header.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split('\t').map(value => value.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });
      parsedResults[`task${index + 1}`] = data;
    }
  });

  return parsedResults;
}