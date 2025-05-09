var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const { createProduct, getAllProducts,getAllProductsByUser, getProductById, updateProduct, deleteProduct } = require('../controllers/ProductController');


router.post('/', verifyToken, createProduct);
router.get('/', verifyToken, getAllProducts);
router.get('/user', verifyToken, getAllProductsByUser);
router.get('/:id', verifyToken, getProductById);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
