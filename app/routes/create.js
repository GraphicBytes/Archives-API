import express from 'express';
import { submissionRateLimiter } from '../helpers/Limiter.js';
import Authorization from '../middlewares/Authorization.js';
import * as FormController from '../controllers/FormController.js';
import * as SubmissionController from '../controllers/SubmissionController.js';

const postPrivateRouter = express.Router();
const postPublicRouter = express.Router();

/*  FORM CONTROLLER  */
// PRIVATE
postPrivateRouter.post('/forms/duplicate/id/:id([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['create_forms']), FormController.duplicateFormById);
postPrivateRouter.post('/forms', Authorization.authorizeEndpointAccess(['create_forms']), FormController.createForm);
/* // FORM CONTROLLER // */


/*  SUBMISSION CONTROLLER  */
// PRIVATE
postPrivateRouter.post('/submissions/note/:submissionId([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['create_forms']), SubmissionController.createSubmissionNoteBySubmissionId);

// PUBLIC
postPublicRouter.post('/forms/id/:id([a-zA-Z0-9]*)/submissions', submissionRateLimiter, SubmissionController.createSubmissionByFormIdPublic);
/* // SUBMISSION CONTROLLER // */

export { postPrivateRouter, postPublicRouter };