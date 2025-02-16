import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { JSDOM } from 'jsdom';
import sizeOf from 'image-size';

const CRAWLER_API_TOKEN = process.env.CRAWLER_API_TOKEN;

export async function getImageUrlFromSrcset(srcset: string) {
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

export async function crawlProduct(product: any) {
    const { name } = product;
    const params = new URLSearchParams({ k: name });
    const url = `https://www.amazon.com/s?${params.toString()}`;
    const crawlerApiUrl = `https://api.crawlbase.com/?token=${CRAWLER_API_TOKEN}&url=${encodeURIComponent(url)}`;

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
