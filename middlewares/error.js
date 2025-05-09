const createError = require('http-errors');

const errorNotFound = (req, res, next) => {
    next(createError(404));
};

const errorHandler = (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === process.env.development ? err : {};
    const statusCode = err.statusCode || 500;

    // render the error page
    res.format({

        json: () => {
            res.status(err.status || 500).json({ error: err.message });
        },
        html: () => { // تم تصحيح الخطأ هنا (text/html => html)
            res.send(`
                <h1>${statusCode} Error</h1>
                <pre>${err.message}</pre>
                ${process.env.NODE_ENV === 'production' ? '' : `<pre>${err.stack}</pre>`}
            `);

        },
        default: () => {
            res.status(400).json({ message: "Unsupported Media Type" });
        }
    })
}
module.exports = { errorNotFound, errorHandler };
