import Logger from '../helpers/Logger.js';
import { StatusCodes } from 'http-status-codes';

export const customHeaders = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    next();
}

export const excludeFavicon = (req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
        return;
    }

    next();
};

export const contentType = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({ error: 'Content-Type must be application/json' });
        }
    }

    next();
}

export const validateHeaders = (req, res, next) => {
    const platforms = ['#####', '#####'];

    if (!req.headers.hasOwnProperty('platform')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Unauthorized platform." });
    }

    if (!platforms.includes(req.headers['platform'])) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Unauthorized platform." });
    }

    req.platform = req.headers['platform'];

    next();
}

export const validateBody = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.hasOwnProperty('body')) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "No body." });
        }
    }

    next();
}

export const noRouteFound = (req, res) => {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "No route found." });
};