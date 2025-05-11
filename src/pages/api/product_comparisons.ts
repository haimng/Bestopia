import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateAndAuthorizeAdmin } from '../../utils_server/auth';
import db from '../../utils/db';

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

        const { productIds, productComparisons } = req.body;

        if (!productIds || !productComparisons) {
            return res.status(400).json({ error: 'Missing required fields: productIds or productComparisons' });
        }

        try {
            await client.query('BEGIN');

            const comparisons = parseTSV(productIds, productComparisons);

            /** 
             Insert or update the product comparisons into the `product_comparisons` table
             Sample input:
              const comparisons = [{
                  aspect: 'aspect1',
                  'productId1': 'comparison_point1',
                  'productId2': 'comparison_point2',
                  'productId3': 'comparison_point3',
                  'productId4': 'comparison_point4',
                  'productId5': 'comparison_point5',
                }]
            */    
            const insertQuery = `
                INSERT INTO product_comparisons (product_id, aspect, comparison_point)
                VALUES ($1, $2, $3)
                ON CONFLICT (product_id, aspect) DO UPDATE
                SET comparison_point = EXCLUDED.comparison_point
                RETURNING id
            `;
            for (const comparison of comparisons) {
                const { aspect, ...productComparisons } = comparison;
                for (const [productId, comparisonPoint] of Object.entries(productComparisons)) {
                    const productIdNum = parseInt(productId, 10);
                    const comparisonPointStr = typeof comparisonPoint === 'string' || typeof comparisonPoint === 'number' 
                        ? comparisonPoint.toString() 
                        : '';
                    await client.query(insertQuery, [productIdNum, aspect, comparisonPointStr]);
                }
            }            

            await client.query('COMMIT');
            res.status(201).json({ message: 'Product comparisons saved successfully' });
        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error('Error saving product comparisons:', error);
            res.status(500).json({ error: 'Failed to save product comparisons', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

/***
  Parse the TSV and replace productIds with the actual product IDs
  === Sample inputs:
    const productIds = [26,444,578,6789,7787];
    const gptResponse =
      `aspect	product1	product2	product3	product4	product5
      Display	6.8" QHD+ AMOLED, 120Hz	6.7" OLED, 90Hz	6.9" LTPO AMOLED, 144Hz	6.5" LCD, 60Hz	7.1" Foldable AMOLED, 120Hz
      Processor	Snapdragon 8 Gen 3	Apple A18 Pro	Google Tensor G4	MediaTek Dimensity 9200	Snapdragon 8s Gen 3
      Camera	200MP + 50MP UW + 10x zoom	48MP + 12MP UW	50MP + 50MP UW + 5x zoom	64MP single lens	108MP + 13MP UW + Macro`;
  === Sample output:
    [
      {
        aspect: 'Display',
        '26': '6.8" QHD+ AMOLED, 120Hz',
        '444': '6.7" OLED, 90Hz',
        '578': '6.9" LTPO AMOLED, 144Hz',
        '6789': '6.5" LCD, 60Hz',
        '7787': '7.1" Foldable AMOLED, 120Hz'        
      },
      {
        aspect: 'Processor',
        '26': 'Snapdragon 8 Gen 3',
        '444': 'Apple A18 Pro',
        '578': 'Google Tensor G4',
        '6789': 'MediaTek Dimensity 9200',
        '7787': 'Snapdragon 8s Gen 3'        
      },
      {
        aspect: 'Camera',
        '26': '200MP + 50MP UW + 10x zoom',
        '444': '48MP + 12MP UW',
        '578': '50MP + 50MP UW + 5x zoom',
        '6789': '64MP single lens',
        '7787': '108MP + 13MP UW + Macro'        
      }
    ]
  */
function parseTSV(productIds: Array<number>, gptResponse: string) {
    const lines = gptResponse.trim().split('\n');

    const headers = lines[0].split('\t').map((header: string, index: number) => {
      return index > 0 ? `${productIds[index-1]}` : header.trim();
    });

    const data = lines.slice(1).map((line: string) => {
        const values = line.split('\t').map((value: string) => value.trim());
        const comparison: any = {};
        headers.forEach((header: string, index: number) => {
            comparison[header] = values[index];
        });
        return comparison;
    });

    return data;
}
