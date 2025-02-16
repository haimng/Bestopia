import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { authenticateAndAuthorizeAdmin } from '../../../utils_server/auth';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { JSDOM } from 'jsdom';

async function crawlProduct(product: any) {
    const { name } = product;
    const params = new URLSearchParams({ k: name });
    const url = `https://www.amazon.com/s?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "device-memory": "8",
                "downlink": "10",
                "dpr": "1",
                "ect": "4g",
                "pragma": "no-cache",
                "priority": "u=0, i",
                "rtt": "100",
                "sec-ch-device-memory": "8",
                "sec-ch-dpr": "1",
                "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-ch-viewport-width": "1700",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "viewport-width": "1700"
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch data from Amazon: ${response.statusText}`);
        }
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const firstProduct = document.querySelector('[data-component-type="s-search-result"]');
        if (!firstProduct) {
            throw new Error('No products found');
        }

        const imageElement = firstProduct.querySelector('.s-image');
        const linkElement = firstProduct.querySelector('.a-link-normal');

        let image_url = imageElement ? imageElement.getAttribute('src') : null;
        const srcset = imageElement ? imageElement.getAttribute('srcset') : null;

        if (srcset) {
            const srcsetParts = srcset.split(',').map(part => part.trim());
            const srcset2_5x = srcsetParts.find(part => part.endsWith('2.5x'));
            if (srcset2_5x) {
                image_url = srcset2_5x.split(' ')[0];
            }
        }

        let product_page = linkElement ? `https://www.amazon.com${linkElement.getAttribute('href')}` : null;

        if (product_page) {
            const refIndex = product_page.indexOf('/ref=');
            if (refIndex !== -1) {
                product_page = product_page.substring(0, refIndex);
            }
        }

        if (!image_url || !product_page) {
            throw new Error('Failed to extract product details');
        }

        return { image_url, product_page };
    } catch (error) {
        console.error('Error crawling product:', error);
        throw error;
    }
}

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
        const { name, description, image_url, product_page, crawl_product } = req.body;

        try {
            await client.query('BEGIN');

            let newImageUrl = image_url;
            let newProductPage = product_page;

            // Call crawlProduct if crawl_product exists and is not empty
            if (crawl_product) {
                const crawledData = await crawlProduct({ name, description, image_url, product_page });
                newImageUrl = crawledData.image_url;
                newProductPage = crawledData.product_page;
            }

            const updateProductQuery = `
                UPDATE products
                SET name = $1, description = $2, image_url = $3, product_page = $4, updated_at = NOW()
                WHERE id = $5
                RETURNING *
            `;
            const updateProductValues = [name, description, newImageUrl, newProductPage, id];
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
