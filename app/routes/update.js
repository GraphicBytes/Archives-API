import express from 'express';
import * as FormController from '../controllers/FormController.js';
import * as SubmissionController from '../controllers/SubmissionController.js';
import Authorization from '../middlewares/Authorization.js';

const updatePrivateRouter = express.Router();
const updatePublicRouter = express.Router();

/*  SUBMISSION CONTROLLER  */
// PRIVATE
updatePrivateRouter.put('/forms/id/:id([a-zA-Z0-9]*)/submissions/:submissionId([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['edit_submissions']), SubmissionController.updateSubmissionBySubmissionId);
updatePrivateRouter.put('/bulk/submissions', Authorization.authorizeEndpointAccess(['edit_submissions']), SubmissionController.updateSubmissionsBulk);
/* // SUBMISSION CONTROLLER // */


/*  FORM CONTROLLER  */
// PRIVATE
updatePrivateRouter.put('/forms/id/:id([a-zA-Z0-9]*)/', Authorization.authorizeEndpointAccess(['edit_forms']), FormController.updateFormById);
/* // FORM CONTROLLER // */

export { updatePrivateRouter, updatePublicRouter };