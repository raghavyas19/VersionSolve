const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiCodeReview = async (code) => {
    // Prompt Gemini to return a JSON object matching the AIReview type
    const prompt = `Analyze the following code and return a JSON object with the following fields:
{
  "codeQuality": number (1-10),
  "readabilityScore": number (1-10),
  "complexityAnalysis": { "time": string, "space": string },
  "optimizationSuggestions": string[],
  "bestPractices": string[],
  "styleIssues": string[]
}
Only return the JSON object, no explanation.\nCode:\n${code}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    // Try to parse the response as JSON
    try {
        const jsonStart = response.text.indexOf('{');
        const jsonEnd = response.text.lastIndexOf('}');
        const jsonString = response.text.substring(jsonStart, jsonEnd + 1);
        const review = JSON.parse(jsonString);
        return review;
    } catch (e) {
        // Fallback: return a default object if parsing fails
        return {
            codeQuality: 5,
            readabilityScore: 5,
            complexityAnalysis: { time: "O(n)", space: "O(1)" },
            optimizationSuggestions: ["Could not parse AI response"],
            bestPractices: [],
            styleIssues: ["Could not parse AI response"]
        };
    }
};

module.exports = { aiCodeReview }; 