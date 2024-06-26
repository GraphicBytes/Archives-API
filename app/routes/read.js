import express from 'express';
import Authorization from '../middlewares/Authorization.js';
import * as FormController from '../controllers/FormController.js';
import * as SubmissionController from '../controllers/SubmissionController.js';

const getPrivateRouter = express.Router();
const getPublicRouter = express.Router();

/*  SUBMISSION CONTROLLER  */
// PRIVATE
getPrivateRouter.get('/forms/id/:id([a-zA-Z0-9]*)/submissions/count', Authorization.authorizeEndpointAccess(['view_submissions']), SubmissionController.getSubmissionsCountByFormId);
getPrivateRouter.get('/forms/id/:id([a-zA-Z0-9]*)/submissions/:submissionId([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['view_submissions']), SubmissionController.getSubmissionBySubmissionId);
getPrivateRouter.get('/forms/id/:id([a-zA-Z0-9]*)/submissions', Authorization.authorizeEndpointAccess(['view_submissions']), SubmissionController.getSubmissionsByFormId);
getPrivateRouter.get('/submissions/activity', Authorization.authorizeEndpointAccess(['view_submissions']), SubmissionController.getSubmissionsActivity);
/* // SUBMISSION CONTROLLER // */


/*  FORM CONTROLLER  */
// PRIVATE
getPrivateRouter.get('/forms/activity/id/:id([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getFormActivityByFormId);
getPrivateRouter.get('/forms/users/id/:id([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getAllFormsByUserId);
getPrivateRouter.get('/forms/id/:id([a-zA-Z0-9]*)', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getFormByIdPrivate);
getPrivateRouter.get('/templates', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getAllTemplates);
getPrivateRouter.get('/themes', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getAllThemes);
getPrivateRouter.get('/forms', Authorization.authorizeEndpointAccess(['view_forms']), FormController.getAllForms);

// PUBLIC
getPublicRouter.get('/forms/id/:id([a-zA-Z0-9]*)', FormController.getFormByIdPublic);
/* // FORM CONTROLLER // */

export { getPrivateRouter, getPublicRouter };