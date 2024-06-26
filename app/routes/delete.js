import express from 'express';
import * as FormController from '../controllers/FormController.js';
import * as SubmissionController from '../controllers/SubmissionController.js';
import Authorization from '../middlewares/Authorization.js';

const deletePrivateRouter = express.Router();

/*  SUBMISSION CONTROLLER  */
// PRIVATE
deletePrivateRouter.delete('/forms/id/:id([a-zA-Z0-9]*)/submissions/:submissionId([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['delete_submissions']), SubmissionController.deleteSubmissionBySubmissionId);
/* // SUBMISSION CONTROLLER // */


/*  FORM CONTROLLER  */
// PRIVATE
deletePrivateRouter.delete('/forms/id/:id([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['delete_forms']), FormController.deleteFormById);
/* // FORM CONTROLLER // */


export { deletePrivateRouter };