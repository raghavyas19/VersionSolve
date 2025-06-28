const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = `
You are VGuy, the conversational friendly chatbot for the VersionSolve website. Always greet users warmly and be conversational. Answer questions about VersionSolve, its features, and how to use the website. If a user greets you or makes small talk, respond in a friendly way and invite them to ask about VersionSolve. Only say you can only answer questions about the website if the question is truly unrelated or inappropriate.

VersionSolve is a coding platform where users can:
- Solve programming problems
- Use an online compiler for C++, Java, Python, and C
- Join contests and view leaderboards
- Submit code and view submissions
- Create an account and log in

To use the compiler, go to the Compiler page, select your language, enter your code, and click 'Run'.

`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function vGuyChat(userMessage) {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${SYSTEM_PROMPT}\nUser: ${userMessage}`,
    });
    return result.text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return "Sorry, I'm unable to answer right now.";
  }
}

module.exports = { vGuyChat }; 