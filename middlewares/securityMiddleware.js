// npm install helmet express-mongo-sanitize express-rate-limit hpp xss-clean compression express-useragent morgan csurf cookie-parser

const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const compression = require('compression');
const useragent = require('express-useragent');
const morgan = require('morgan');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

module.exports = (app) => {
  app.disable('x-powered-by');

  // Logging
    app.use(morgan('combined'));
    app.use(morgan('dev'));
    

  // Parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Content-Type Filter
  app.use((req, res, next) => {
    const allowedTypes = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'];
    const contentType = req.headers['content-type']?.split(';')[0];
    if (req.method !== 'GET' && contentType && !allowedTypes.includes(contentType)) {
      return res.status(415).json({ message: 'نوع المحتوى مرفوض' });
    }
    next();
  });

  // Helmet
  app.use(helmet());
  app.use(helmet.crossOriginEmbedderPolicy());
  app.use(helmet.crossOriginOpenerPolicy());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        'script-src': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': [],
      },
    })
  );
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.noSniff());

  // XSS + NoSQL + HPP
  app.use(xssClean());
  app.use(mongoSanitize());
  app.use(hpp());



  // Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'تم حظر الطلبات المفرطة مؤقتًا، حاول لاحقًا',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'محاولات تسجيل دخول كثيرة جدًا',
  });

  app.use('/api/auth', authLimiter);
  app.use(generalLimiter); // لكل المسارات الأخرى

  // CSRF Protection
  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);
  app.use((req, res, next) => {
    res.cookie('csrf_token', req.csrfToken(), {
      httpOnly: false,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
    });
    next();
  });



  // Compression
  app.use(compression());

  // User Agent Detection
  app.use(useragent.express());

  // مشبوه: Host غير مسموح
  app.use((req, res, next) => {
    const allowedHosts = ['example.com', 'localhost'];
    if (!allowedHosts.includes(req.hostname)) {
      console.warn(`🚨 محاولة غير مصرح بها من ${req.hostname} (${req.ip})`);
      return res.status(403).json({ message: 'طلب غير مصرح به' });
    }
    next();
  });

  // حماية من المسارات المشبوهة
  app.use((req, res, next) => {
    if (req.path.includes('..')) {
      return res.status(400).json({ message: 'مسار غير صالح' });
    }
    next();
  });

  // حماية من Method Override
  app.use((req, res, next) => {
    if (req.headers['x-http-method-override']) {
      return res.status(405).json({ message: 'Method Override غير مسموح' });
    }
    next();
  });

  // الحماية من query string الضخم
  app.use((req, res, next) => {
    if (Object.keys(req.query).length > 20) {
      return res.status(400).json({ message: 'طلبات URL زائدة' });
    }
    next();
  });

  // منع التخزين المؤقت
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error('🔥 خطأ:', err.stack);
    res.status(500).json({ message: 'حدث خطأ بالسيرفر' });
  });
};
