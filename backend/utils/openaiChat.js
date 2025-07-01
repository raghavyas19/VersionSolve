const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are VGuy, the conversational friendly chatbot for the VersionSolve website. Always greet users warmly and be conversational. Answer questions about VersionSolve, its features, and how to use the website. If a user greets you or makes small talk, respond in a friendly way and invite them to ask about VersionSolve. Only say you can only answer questions about the website if the question is truly unrelated or inappropriate.

When answering, always provide a clear and structured response (for example, use bullet points or step-by-step instructions if helpful). If a user asks for code or programming solutions, politely inform them that you cannot provide any code, but you can explain how to use VersionSolve or its features.

VersionSolve is a coding platform where users can:
- Solve programming problems by navigating to problems page
- Use an online compiler for C++, Java, Python, and C
- Create an account and log in
- Join contests and view leaderboards
- Submit code and view submissions
- Use ai review to get feedback on your code on online compiler page

To use the compiler, go to the Compiler page, select your language, enter your code, and click 'Run'.
`;

async function vGuyChat(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI API error:', err);
    return "Sorry, I'm unable to answer right now.";
  }
}

module.exports = { vGuyChat }; 