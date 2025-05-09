const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// إعداد CSRF مع استخدام الكوكيز
const csrfProtection = csrf({ cookie: true });

module.exports = (req, res, next) => {
    // استخدام Helmet لتأمين الرؤوس HTTP
    helmet()(req, res, () => {
        // تطهير البيانات من MongoDB Operator Injection
        mongoSanitize()(req, res, () => {
            // منع هجمات HTTP Parameter Pollution
            hpp()(req, res, () => {
                // تفعيل cookieParser للوصول للكوكيز
                cookieParser()(req, res, () => {
                    // تفعيل CSRF protection
                    csrfProtection(req, res, () => {
                        // تحديد معدل الطلبات لمنع هجمات brute-force
                        rateLimit({
                            windowMs: 15 * 60 * 1000, // 15 دقيقة
                            max: 100,
                            message: 'تم حظر المحاولات الكثيرة، حاول لاحقًا'
                        })(req, res, () => {
                            // تمرير توكن CSRF للعميل (لا تجعلها httpOnly ليتمكن العميل من قراءتها وإرسالها مع الطلبات)
                            res.cookie('user', req.csrfToken(), { httpOnly: true });
                            next();
                        });
                    });
                });
            });
        });
    });
};

// npm install helmet express-mongo-sanitize express-rate-limit hpp csurf cookie-parser
