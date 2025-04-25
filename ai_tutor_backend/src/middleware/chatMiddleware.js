const chatMiddleware = (req, res, next) => {
    console.log('Chat middleware executed');
    next();
};

module.exports = chatMiddleware;