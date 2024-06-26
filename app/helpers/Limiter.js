import { rateLimit } from 'express-rate-limit'

export const submissionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});