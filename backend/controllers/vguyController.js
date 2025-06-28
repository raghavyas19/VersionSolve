const { vGuyChat } = require('../utils/openaiChat');

exports.chatWithVGuy = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }
  try {
    const reply = await vGuyChat(message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ success: false, error: 'VGuy failed to respond.' });
  }
}; 