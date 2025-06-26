const { aiCodeReview } = require('../utils/aiCodeReview');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAIReview = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }
    const review = await aiCodeReview(code);
    res.json({ review });
}); 