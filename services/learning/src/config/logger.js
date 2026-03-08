const serviceName = 'learning-service';

const log = (level, message, req) => {
    const logData = {
        timestamp: new Date().toISOString(),
        service: serviceName,
        level: level.toLowerCase(),
        message: message,
    };
    if (req?.method) logData.method = req.method;
    if (req?.url) logData.path = req.url;
    if (req?.headers?.['x-request-id']) logData.requestId = req.headers['x-request-id'];

    console.log(JSON.stringify(logData));
};

module.exports = {
    info: (msg, req) => log('INFO', msg, req),
    warn: (msg, req) => log('WARN', msg, req),
    error: (msg, req) => log('ERROR', msg, req)
};
