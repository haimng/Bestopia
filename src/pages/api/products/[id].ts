import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { authenticateAndAuthorizeAdmin } from '../../../utils_server/auth';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { JSDOM } from 'jsdom';
import sizeOf from 'image-size';

async function getImageUrlFromSrcset(srcset: string) {
    const srcsetParts = srcset.split(',').map(part => part.trim());
    let selectedImageUrl = null;
    let selectedWidth = 0;
    let default3xImageUrl = null;

    for (const part of srcsetParts) {
        const [url, descriptor] = part.split(' ');
        const response = await fetch(url);
        const buffer = await response.buffer();
        const dimensions = sizeOf(buffer);
        const width = dimensions.width;
        const multiplier = parseFloat(descriptor.replace('x', ''));        

        if (multiplier === 3) {
            default3xImageUrl = url;
        }

        if (width !== undefined && ((width >= 500 && width <= 700) || (multiplier === 3 && width < 500) || (!selectedImageUrl && width > 500))) {
            selectedImageUrl = url;
            selectedWidth = width;
        }
    }

    return selectedImageUrl || default3xImageUrl;
}

async function crawlProduct(product: any) {
    const { name } = product;
    const params = new URLSearchParams({ k: name });
    const url = `https://www.amazon.com/s?${params.toString()}`;
    const crawlerApiUrl = `https://api.crawlbase.com/?token=ALhEGfr3FUD0gwwN-9m3QQ&url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(crawlerApiUrl);
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
            image_url = await getImageUrlFromSrcset(srcset);
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

export const maxDuration = 20;

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
