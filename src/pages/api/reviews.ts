import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(503).json({ error: 'Service Unavailable' });

    // if (req.method !== 'POST') {
    //     res.setHeader('Allow', ['POST']);
    //     return res.status(405).end(`Method ${req.method} Not Allowed`);
    // }

    // const { prompt } = req.body;

    // let prompt = 'find best 5 tvs from Amazon. give me their name, description, photo url and link to produt page';

    // try {
    //     const chatCompletion = await client.chat.completions.create({
    //         messages: [{ role: 'user', content: prompt }],
    //         model: 'gpt-4o',
    //     });

    //     res.status(200).json(chatCompletion.choices[0].message);
    // } catch (error: any) {
    //     res.status(500).json({ error: error.message || 'An error occurred' });
    // }
}
