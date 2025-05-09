const mongoose = require('mongoose');
const Review = require("../models/Review");
const Product = require("../models/Product");

const updateProductRating = async (productId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const productObjectId = mongoose.Types.ObjectId.createFromHexString(productId);

    const stats = await Review.aggregate([
      { $match: { product: productObjectId } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const avgRating = stats[0]?.avgRating ? Number(stats[0].avgRating.toFixed(2)) : 0;
    const totalRatings = stats[0]?.totalRatings || 0;

    const product = await Product.findByIdAndUpdate(
      productId,
      { avgRating, totalRatings },
      { new: true, runValidators: true } 
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  } catch (err) {
    console.error('Error updating product rating:', err.message);
    throw err;
  }
};

module.exports = updateProductRating;