import { check } from 'express-validator';

class Sanitizer {
    static async sanitizeTitle(req) {
        return await check('title').trim().escape().run(req);
    }
}

export default Sanitizer;