const errorHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

module.exports = errorHandler;
