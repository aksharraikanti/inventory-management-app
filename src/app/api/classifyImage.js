import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    const { imageSrc } = req.body;

    if (!imageSrc) {
        return res.status(400).json({ error: 'Image source is required' });
    }

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Classify this image: ${imageSrc}`,
            max_tokens: 100,
        });
        
        const result = response.data.choices[0].text.trim();
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error classifying image:', error);
        res.status(500).json({ error: 'Failed to classify image' });
    }
}
