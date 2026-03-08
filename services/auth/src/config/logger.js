const serviceName = 'auth-service';

const log = (level, message, req) => {
    const timestamp = new Date().toISOString();
    const reqStr = req?.headers?.['x-request-id'] ? ` req=${req.headers['x-request-id']}` : '';
    console.log(`${timestamp} ${serviceName} ${level} ${message}${reqStr}`);
};

module.exports = {
    info: (msg, req) => log('INFO', msg, req),
    warn: (msg, req) => log('WARN', msg, req),
    error: (msg, req) => log('ERROR', msg, req)
};
