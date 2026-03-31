const { URL } = require('url');

const DEFAULT_HOST = 'redis';
const DEFAULT_PORT = 6379;

function buildRedisConnection() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        try {
            const parsed = new URL(redisUrl);
            const port = Number(parsed.port || DEFAULT_PORT);
            const connection = {
                host: parsed.hostname || DEFAULT_HOST,
                port: Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT,
            };

            if (parsed.username) {
                connection.username = decodeURIComponent(parsed.username);
            }
            if (parsed.password) {
                connection.password = decodeURIComponent(parsed.password);
            }
            if (parsed.protocol === 'rediss:') {
                connection.tls = {};
            }

            return connection;
        } catch (error) {
            console.warn(`⚠️ Invalid REDIS_URL, fallback to REDIS_HOST/REDIS_PORT: ${error.message}`);
        }
    }

    const rawPort = Number(process.env.REDIS_PORT);
    const port = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : DEFAULT_PORT;

    return {
        host: process.env.REDIS_HOST || DEFAULT_HOST,
        port,
    };
}

module.exports = { buildRedisConnection };
