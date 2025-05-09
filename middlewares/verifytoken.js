const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;

const decryptToken = (encryptedToken) => {
    try {
      const [ivHex, saltHex, encryptedHex] = encryptedToken.split(':');
      const iv        = Buffer.from(ivHex, 'hex');
      const salt      = saltHex;                         // هنا نستخدم الـ salt الذي أرسلناه
      const key       = crypto.scryptSync(CRYPTO_SECRET, salt, 32);
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher  = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted   = decipher.update(encrypted);
      decrypted       = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (err) {
      console.error('❌ Failed to decrypt token:', err.message);
      return null;
    }
  };

const verifyToken = async (req, res, next) => {
    const encryptedToken = req.headers['auth-token'];

    if (!encryptedToken) {
        return res.status(403).json({ message: 'Token is required' });
    }

    const decryptedToken = decryptToken(encryptedToken);
    if (!decryptedToken) {
        return res.status(401).json({ message: 'Invalid or corrupted token' });
    }

    try {
        const decoded = jwt.verify(decryptedToken, JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token structure' });
        }

        verift = await User.findById(decoded.id).select('-password ');
        if (!verift) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (verift.role !== decoded.role  &&verift.email !== decoded.email ) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if(verift.documentation === false){
            return res.status(401).json({ message: 'You have an account but it is not verified. Complete the remaining steps.' });
        }
        req.user = verift;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id) {
            next();
        } else {
            res.status(403).json('You are not allowed to do that!');
        }
    });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json('You are not allowed to do that!');
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
};
