import { check, validationResult } from 'express-validator';

class Validator {
    static async validateId(req) {
        if (req.params.id) {
            await check('id', 'Invalid ID').isMongoId().run(req);
        }

        if (req.params.submissionId) {
            await check('submissionId', 'Invalid submission ID').isMongoId().run(req);
        }

        return validationResult(req);
    }
}

export default Validator;