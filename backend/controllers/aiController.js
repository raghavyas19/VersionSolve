const { aiCodeReview } = require('../utils/aiCodeReview');

exports.getAIReview = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ review });
    } catch (error) {
        res.status(500).json({ error: "Error in AI review, error: " + error.message });
    }
}; 