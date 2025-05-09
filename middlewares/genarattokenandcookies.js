const jwt = require('jsonwebtoken');
const crypto = require('crypto');
if (!process.env.JWT_SECRET || !process.env.CRYPTO_SECRET) {
    throw new Error('  المتغيرات غير موجوده في البيئية');
}
 

const JWT_SECRET = process.env.JWT_SECRET;
const CRYPTO_SECRET = process.env.CRYPTO_SECRET;
function generateEncryptedToken(user) {
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const iv   = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16).toString('hex');
    const key  = crypto.scryptSync(CRYPTO_SECRET, salt, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);
    // نرجّع الآن iv:salt:encrypted
    return [iv.toString('hex'), salt, encrypted.toString('hex')].join(':');
  }

exports.generateTokenAndSend = (user, res) => {
    const encryptedToken = generateEncryptedToken(user);

    // 👇 Send token in a custom response header (e.g., x-auth-token)
    res.setHeader('auth-token', encryptedToken);
};
