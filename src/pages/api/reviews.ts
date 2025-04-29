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
      Introduction should be 900 to 1000 characters long.
      Don’t mention about Amazon. Don’t mention about only top 5 because I may add more later.  
      Provide the result in TSV-formatted text with the following field names in the first line: "title subtitle introduction". 

    * Task 2: Find top 5 of those product pages on https://www.amazon.com and provide their name, description in TSV-formatted text with the following field names in the first line: "name	description".
    
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

/***
 * Parse a string to separate each tsv result and parse each tsv to json.
 * Sample input:
 * {
  gptResponse: 'title\tsubtitle\tintroduction\n' +
    'The Best Smartphones of 2025\tDiscover the Top Smartphones Redefining Technology in 2025\tAs technology continues to evolve, 2025 has brought forth a new generation of smartphones that push the boundaries of innovation, design, and performance. In this comprehensive review, we explore the standout devices that are setting new standards in the mobile industry.\n' +
    '----------\n' +
    'name\tdescription\n' +
    'Apple iPhone 17 Pro Max\tThe Apple iPhone 17 Pro Max sets the standard for high-end smartphones in 2025. With its A18 Bionic chip, stunning Super Retina XDR display, and advanced camera system, it offers exceptional performance and versatility. The iPhone 17 Pro Max is perfect for users who demand the best in performance, design, and features.\n' +
    'Samsung Galaxy S25 Ultra\tThe Samsung Galaxy S25 Ultra is a flagship device featuring cutting-edge technology. With its powerful Exynos 2400 chipset, vibrant Dynamic AMOLED display, and versatile camera system, it is ideal for users who want top performance and display quality.\n' +
    'Google Pixel 10 Pro\tThe Google Pixel 10 Pro combines the best of Google’s software with top hardware. Featuring the Tensor G3 chip, a stunning OLED display, and an exceptional camera system with advanced AI features, it’s a great choice for those who value software optimization and photography.\n' +
    'OnePlus 12T Pro\tThe OnePlus 12T Pro offers high performance with a focus on speed and efficiency. With the Snapdragon 8 Gen 3 processor, a Fluid AMOLED display, and a high-quality camera setup, it caters to users who need a powerful and responsive device.\n' +
    'Sony Xperia 1 VI\tThe Sony Xperia 1 VI is designed for multimedia enthusiasts with its 4K OLED display and professional-grade camera features. It’s perfect for users who need a top-quality display and advanced video and photography capabilities.\n' +
    '----------\n' +
    'review_text\n' +
    "The Apple iPhone 17 Pro Max is a testament to Apple's commitment to innovation and excellence. Powered by the A18 Bionic chip, this device delivers unparalleled performance, handling intensive tasks and multitasking with ease. The 6.9-inch Super Retina XDR display offers vibrant colors and sharp details, making it a delight for media consumption and gaming. The triple 48MP rear camera system introduces significant improvements in low-light photography and computational photography, ensuring that every shot is of professional quality. With storage options up to 1TB, users have ample space for their apps, photos, and videos. The device also boasts impressive battery life, lasting up to 24 hours on a single charge, and supports 5G connectivity for faster data speeds. The iPhone 17 Pro Max is a premium device that justifies its price with top-tier features and performance.\n" +
    "Samsung's Galaxy S25 Ultra is a powerhouse that combines cutting-edge technology with a sleek design. Equipped with the Exynos 2400 processor and 16GB of RAM, it offers smooth and responsive performance across all applications. The 6.8-inch Dynamic AMOLED 2X display with a 120Hz refresh rate provides an immersive viewing experience, whether you're watching videos or playing games. The quad 108MP rear camera setup delivers stunning photos with exceptional detail and color accuracy, and the 40MP front camera ensures high-quality selfies. With storage options up to 1TB, users have plenty of space for their digital content. The device also features S Pen support, adding versatility for note-taking and creative tasks. Battery life is robust, offering up to 20 hours of usage, and the device supports fast charging for quick power-ups. The Galaxy S25 Ultra is a top choice for users seeking a feature-rich and high-performing smartphone.\n" +
    "The Google Pixel 10 Pro stands out with its seamless integration of hardware and software, delivering a user experience that is both intuitive and powerful. Powered by the Tensor G3 chip, the device excels in AI-driven tasks and offers efficient performance. The 6.7-inch OLED display provides crisp visuals with vibrant colors, enhancing the experience of browsing, streaming, and gaming. The triple 50MP rear camera system is a highlight, offering exceptional photography capabilities with advanced AI features that enhance image quality and provide creative options. With storage options up to 512GB, users have sufficient space for their needs. The device offers up to 22 hours of battery life and supports 5G connectivity for faster internet speeds. Running on a clean version of Android, the Pixel 10 Pro ensures timely updates and a clutter-free interface. It's an excellent choice for users who prioritize software optimization and photography.\n" +
    "The OnePlus 12T Pro is designed for users who demand speed and efficiency. Powered by the Snapdragon 8 Gen 3 processor and equipped with 16GB of RAM, it handles demanding applications and multitasking effortlessly. The 6.7-inch Fluid AMOLED display with a 120Hz refresh rate offers smooth scrolling and an immersive viewing experience. The triple 50MP rear camera setup delivers high-quality photos with accurate colors and good dynamic range, while the 32MP front camera ensures clear and detailed selfies. With storage options up to 512GB, users have ample space for their digital content. The device offers up to 18 hours of battery life and supports fast charging, allowing for quick recharging. Running on OxygenOS, the OnePlus 12T Pro provides a clean and customizable user interface. It's a compelling option for users seeking a high-performance smartphone at a competitive price point.\n" +
    "The Sony Xperia 1 VI is tailored for multimedia enthusiasts who demand the best in display and camera technology. Featuring a 6.5-inch 4K OLED display, it offers unparalleled visual clarity and color accuracy, making it ideal for watching high-resolution content and gaming. Powered by the Snapdragon 8 Gen 3 processor and equipped with 12GB of RAM, it delivers smooth performance across all applications. The triple 48MP rear camera system is designed for professional-grade photography and videography, offering advanced settings and features that cater to creative users. With storage options up to 512GB, users have plenty of space for their media files. The device offers up to 20 hours of battery life and supports fast charging for quick power-ups. Running on a near-stock version of Android, the Xperia 1 VI provides a clean and responsive user experience. It's the perfect choice for users who prioritize display quality and advanced camera capabilities.\n" +
    '---------- '
}
*/
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