const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    comment: {
        type: String
    },
  }, { timestamps: true });
  
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // يمنع التكرار
  module.exports = mongoose.model('Review', reviewSchema);
  