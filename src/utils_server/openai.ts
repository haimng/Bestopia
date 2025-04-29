import OpenAI from "openai";

export async function askGPT(model: string, prompt: string): Promise<string | undefined> {
    const max_tokens = model == "gpt-4o" ? 3000 : 1500; // max: gpt-4o-search-preview 1530, gpt-4o 4000
    console.log({ model, max_tokens, prompt });

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const response = await openai.chat.completions.create({
        model: model, // gpt-4o-search-preview, gpt-4o
        messages: [
          // { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: max_tokens,
        response_format: {"type": "text"},
        store: false
      });      
      console.log(JSON.stringify(response, null, 2));

      const message = response.choices[0].message;
      const text = message.content || '';            
      const textResponse = text.replace(/<[^>]+>/g, ''); // Remove HTML tags
      return textResponse;
    } 
    catch (error) {
      console.error('askGPT error:', error);
      return '';
    }
}
