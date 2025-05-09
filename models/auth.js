const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordCode: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
        number: { 
            type: Number, 
            required: true,
            unique: true,
        },
        isVerified: { 
            type: Boolean,
            default: false,
        }
    
}, { timestamps: true }
);

module.exports = mongoose.model('Auth', authSchema);