const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    avgRating: {
        type: Number, default: 0
    },
    totalRatings: {
        type: Number, default: 0
    }
  });



module.exports = mongoose.model('Product', productSchema);
  