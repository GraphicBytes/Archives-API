import { StatusCodes } from 'http-status-codes';
import SubmissionService from '../services/SubmissionService.js';
import Validator from '../middlewares/Validator.js';
import Sanitizer from '../middlewares/Sanitizer.js';

/*  GET METHODS  */
export const getSubmissionsByFormId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const sortBy = await req.query.sortBy || 'createdAt';
    const sortValue = await req.query.value || 'desc';

    const { retrieved, data, statusCode } = await SubmissionService.getSubmissionsByFormId(platform, decrypted, formId, sortBy, sortValue);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getSubmissionBySubmissionId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const submissionId = await req.params.submissionId;

    const { retrieved, data, statusCode } = await SubmissionService.getSubmissionBySubmissionId(platform, decrypted, formId, submissionId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getSubmissionsActivity = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const { retrieved, data, statusCode } = await SubmissionService.getSubmissionsActivity(platform, decrypted);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getSubmissionsCountByFormId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;

    const { retrieved, data, statusCode } = await SubmissionService.getSubmissionsCountByFormId(platform, decrypted, formId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // GET METHODS // */

/*  POST METHODS  */
export const createSubmissionByFormIdPublic = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const submissionData = await req.body;

    const { created, data, statusCode } = await SubmissionService.createSubmissionByFormIdPublic(platform, decrypted, formId, submissionData);

    if (created) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const createSubmissionNoteBySubmissionId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const submissionId = await req.params.submissionId;
    const submissionNote = await req.body;

    const { created, data, statusCode } = await SubmissionService.createSubmissionNoteBySubmissionId(platform, decrypted, submissionId, submissionNote);

    if (created) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // POST METHODS // */

/*  UPDATE METHODS  */
export const updateSubmissionBySubmissionId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const submissionId = await req.params.submissionId;
    const submissionData = await req.body;

    const { updated, data, statusCode } = await SubmissionService.updateSubmissionBySubmissionId(platform, decrypted, formId, submissionId, submissionData);

    if (updated) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const updateSubmissionsBulk = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const submissionsData = await req.body;

    const { updated, data, statusCode } = await SubmissionService.updateSubmissionsBulk(platform, decrypted, submissionsData);

    if (updated) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // UPDATE METHODS // */

/*  DELETE METHODS  */
export const deleteSubmissionBySubmissionId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const submissionId = await req.params.submissionId;

    const { deleted, data, statusCode } = await SubmissionService.deleteSubmissionBySubmissionId(platform, decrypted, formId, submissionId);

    if (deleted) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // DELETE METHODS // */