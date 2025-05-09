const Product = require("../models/Product");
const Review = require("../models/Review");
const asyncHandler = require('express-async-handler');
const xss = require('xss');
const Joi = require('joi');

exports.createProduct = asyncHandler(async (req, res) => {
    const data = {
        name: xss(req.body.name),
        description: xss(req.body.description),
    };
    const { error } = validateProduct(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const newProduct = new Product({
        user: req.user._id,
        name: data.name,
        description: data.description,
    });
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
}
);

exports.getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({ user: { $ne: req.user._id } }).skip(skip).limit(limit);
    res.status(200).json({ products, totalProducts });
});
exports.getAllProductsByUser = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments({ user: req.user._id });
    const products = await Product.find({ user: req.user._id }).skip(skip).limit(limit);
    res.status(200).json({ products, totalProducts });
});


exports.getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }
    const reviews = await Review.find({ product: req.params.id }).populate('user');
    if (!reviews) {
        res.status(404).json({ error: "Reviews not found" });
        return;
    }
    res.status(200).json({ product, reviews });
});


exports.updateProduct = asyncHandler(async (req, res) => {
    const data = {
        name: xss(req.body.name),
        description: xss(req.body.description),
    };
    const { error } = validateProduct(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }
    res.status(200).json({ message: "Product updated successfully", product });
});
function validateProduct(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
    });
    return schema.validate(data);
}


exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }
    res.status(200).json({ message: "Product deleted successfully" });
});
