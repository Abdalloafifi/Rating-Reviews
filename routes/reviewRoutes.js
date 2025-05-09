const express = require('express');
const router = express.Router();
const { addComment, updateComment, deleteComment } = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/verifytoken');

router.post('/add', verifyToken, addComment);

router.put('/update/:id', verifyToken, updateComment);

router.delete('/delete/:id', verifyToken, deleteComment);

module.exports = router;
