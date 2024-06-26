import { StatusCodes } from 'http-status-codes';
import FormService from '../services/FormService.js';
import Validator from '../middlewares/Validator.js';
import Sanitizer from '../middlewares/Sanitizer.js';

/*  GET METHODS  */
export const getAllForms = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const latest = await req.query.latest;
    const superUser = req.superUser;
    const userGroupsIDs = req?.userGroupsIDs && req.userGroupsIDs;

    const { retrieved, data, statusCode } = await FormService.getAllForms(platform, decrypted, superUser, userGroupsIDs, latest);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getAllTemplates = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const { retrieved, data, statusCode } = await FormService.getAllTemplates(platform, decrypted);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getAllThemes = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const { retrieved, data, statusCode } = await FormService.getAllThemes(platform);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getAllFormsByUserId = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const userId = await req.params.id;

    const { retrieved, data, statusCode } = await FormService.getAllFormsByUserId(platform, decrypted, userId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getFormByIdPrivate = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;

    const { retrieved, data, statusCode } = await FormService.getFormByIdPrivate(platform, decrypted, formId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getFormByIdPublic = async (req, res) => {
    const platform = req.platform;

    const formId = await req.params.id;

    const { retrieved, data, statusCode } = await FormService.getFormByIdPublic(platform, formId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}

export const getFormActivityByFormId = async (req, res) => {
    const platform = req.platform;

    const formId = await req.params.id;

    const { retrieved, data, statusCode } = await FormService.getFormActivityByFormId(platform, formId);

    if (retrieved) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // GET METHODS // */

/*  POST METHODS  */
export const createForm = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formData = await req.body;

    const { created, data, statusCode } = await FormService.createForm(platform, decrypted, formData);

    if (created) {
        res.status(StatusCodes.CREATED).json(data);

        if (data?.isPreview) {
            await FormService.deleteFormById(platform, decrypted, data?.formId, data.isPreview);
        }

        return;
    }

    return res.status(statusCode).json(data);
}

export const duplicateFormById = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;

    const { created, data, statusCode } = await FormService.duplicateFormById(platform, decrypted, formId);

    if (created) {
        return res.status(StatusCodes.CREATED).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // POST METHODS // */

/*  UPDATE METHODS  */
export const updateFormById = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;
    const formData = await req.body;

    const { updated, data, statusCode } = await FormService.updateFormById(platform, decrypted, formId, formData);

    if (updated) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // UPDATE METHODS // */

/*  DELETE METHODS  */
export const deleteFormById = async (req, res) => {
    const platform = req.platform;
    const decrypted = req?.decryptedToken ? req.decryptedToken : null;

    const formId = await req.params.id;

    const { deleted, data, statusCode } = await FormService.deleteFormById(platform, decrypted, formId);

    if (deleted) {
        return res.status(StatusCodes.OK).json(data);
    }

    return res.status(statusCode).json(data);
}
/* // DELETE METHODS // */