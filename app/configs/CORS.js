import Logger from '../helpers/Logger.js';

const logger = new Logger('Access');

const allowedOrigins = [
    'localhost:*',
    '*.development.uk',
    '*.staging.uk',
    '*.brightcloud.uk.com',
    '*.cloud.com',
];

function isOriginAllowed(origin) {
    if (!origin) {
        return false;
    }

    // Check if the origin matches any of the allowed patterns
    return allowedOrigins.some((allowedPattern) => {
        const regexPattern = new RegExp(
            '^' +
            allowedPattern
                .replace('.', '\\.') // Escape dots in the domain
                .replace('*', '.*') // Convert wildcard * to match any characters
                .replace(':*', '(:\\d+)?') + // Match any port
            '$'
        );

        return regexPattern.test(origin);
    });
}

export const corsOptions = {
    origin: function (origin, callback) {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        } else {
            logger.log(`Blocked by CORS, origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};