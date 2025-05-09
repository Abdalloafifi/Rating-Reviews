const Review = require("../models/Review");
const updateProductRating = require("../middlewares/updateProductRating");



exports.addComment = async (req, res) => {
  try {
    const { productId, comment ,rating } = req.body;
    const userId = req.user.id;

    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "you rell to send a review for this product" });
    }

    const newReview = new Review({
      user: userId,
      product: productId,
      rating: rating, 
      comment: comment,
    });
    await newReview.save();

    await updateProductRating(productId);

    res.status(200).json({ message: "Comment added"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user.id;
    const reviewId = req.params.id;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    await updateProductRating(review.product);

    res.status(200).json({ message: "Comment updated", review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

    if (!review) return res.status(404).json({ message: "Review not found" });

      await updateProductRating(review.product);
      

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
