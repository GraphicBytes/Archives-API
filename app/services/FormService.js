import { StatusCodes } from 'http-status-codes';
import { ErrorMessageFilter } from '../filters/ErrorFilter.js';
import { getModel } from '../helpers/Model.js';
import FormFilter from '../filters/FormFilter.js';
import FormHelpers from '../helpers/Form.js';
import Logger from '../helpers/Logger.js';

const logger = new Logger('FormService');

class FormService {
    static DEBUG = true;

    /*  GET METHODS  */
    static async getAllForms(platform, decrypted, superUser, userGroupsIDs, latest) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const queryFilter = {
                isTheme: false,
                isRemoved: false
            };

            if (!superUser) {
                queryFilter.userGroupId = { $in: userGroupsIDs };
            }

            const Query = FormModel.find(queryFilter);

            if (latest) {
                Query.sort('-updatedAt').limit(parseInt(latest));
            }

            const forms = await Query.select('formTitle formId thumbnailId createdAt updatedAt userId themeId isTemplate expiration');

            return {
                retrieved: true,
                data: forms
            };
        } catch (error) {
            logger.log(`Error while getting forms for platform ${platform}: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting forms: ${!this.DEBUG ? error._message : error}`,
                    message: 'No forms were found'
                }
            };
        }
    }

    static async getAllTemplates(platform, decrypted) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const templates = await FormModel.aggregate([
                {
                    $match: {
                        isTemplate: true,
                        isRemoved: false
                    }
                },
                {
                    $project: {
                        formTitle: 1,
                        formId: 1,
                        thumbnailId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        userId: 1,
                        themeId: 1,
                        themeDescription: 1,
                        isTemplate: 1,
                        expiration: 1,
                        colors: '$adminData.data.colors',
                        image: '$adminData.data.image',
                        fonts: '$embedData.data.fonts',
                    }
                }
            ]);

            return {
                retrieved: true,
                data: templates
            };
        } catch (error) {
            logger.log(`Error while getting templates for platform ${platform}: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting templates: ${!this.DEBUG ? error._message : error}`,
                    message: 'No templates were found'
                }
            };
        }
    }

    static async getAllThemes(platform) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const themes = await FormModel.aggregate([
                {
                    $match: {
                        isTheme: true,
                        isRemoved: false
                    }
                },
                {
                    $project: {
                        formTitle: 1,
                        formId: 1,
                        thumbnailId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        userId: 1,
                        themeId: 1,
                        themeDescription: 1,
                        isTemplate: 1,
                        expiration: 1,
                        colors: '$adminData.data.colors',
                        image: '$adminData.data.image',
                        fonts: '$embedData.data.fonts',
                    }
                }
            ]);

            return {
                retrieved: true,
                data: themes
            };
        } catch (error) {
            logger.log(`Error while getting themes for platform ${platform}: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting themes: ${!this.DEBUG ? error._message : error}`,
                    message: 'No themes were found'
                }
            };
        }
    }

    static async getAllFormsByUserId(platform, decrypted, userId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const userForms = await FormModel.find({ userId: userId });

            return {
                retrieved: true,
                data: userForms
            };
        } catch (error) {
            logger.log(`Error while getting forms for user id: ${userId} for platform ${platform}: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting user forms: ${!this.DEBUG ? error._message : error}`,
                    message: 'No forms were found for this user'
                }
            };
        }
    }

    static async getFormByIdPrivate(platform, decrypted, formId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            return {
                retrieved: true,
                data: existingForm
            };
        } catch (error) {
            logger.log(`Error while getting form for platform ${platform}: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting form: ${!this.DEBUG ? error._message : error}`,
                    message: 'No form was found with this id'
                }
            };
        }
    }

    static async getFormByIdPublic(platform, formId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId }).select('formId createdAt updatedAt embedData');

            return {
                retrieved: true,
                data: existingForm
            };
        } catch (error) {
            logger.log(`Error while getting form: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting form: ${!this.DEBUG ? error._message : error}`,
                    message: 'No form was found with this id'
                }
            };
        }
    }

    static async getFormActivityByFormId(platform, formId) {
        try {
            const FormActivityModel = await getModel(platform, 'FormActivity');

            const existingFormActivity = await FormActivityModel.findOne({ formId });

            return {
                retrieved: true,
                data: existingFormActivity
            };
        } catch (error) {
            logger.log(`Error while getting form activity: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting form activity: ${!this.DEBUG ? error._message : error}`,
                    message: 'No form was found with this id'
                }
            };
        }
    }
    /* // GET METHODS // */

    /*  POST METHODS  */
    static async createForm(platform, decrypted, formData) {
        try {
            const FormModel = await getModel(platform, 'Form');
            const FormActivityModel = await getModel(platform, 'FormActivity');

            const embedData = formData?.embedData;
            if (embedData) {
                await FormFilter.createInputsSlots(embedData);
            }

            const newForm = new FormModel(formData);
            const savedForm = await newForm.save();

            if (savedForm) {
                FormHelpers.processFormFiles(savedForm, platform);

                const activity = FormHelpers.createFormActivity(decrypted.user_id);
                const newFormActivity = new FormActivityModel({ formId: savedForm.formId, activity: activity });
                await newFormActivity.save();
            }

            return {
                created: true,
                data: savedForm
            };
        } catch (error) {
            logger.log(`Error while creating form: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                created: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while creating form: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }

    static async duplicateFormById(platform, decrypted, formId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const existingFormObject = existingForm.toObject();

            let newTitle = `${existingFormObject.formTitle} Copy`;
            let counter = 1;

            while (await FormModel.findOne({ formTitle: newTitle })) {
                newTitle = `${existingFormObject.formTitle} Copy (${counter})`;
                counter++;
            }

            existingFormObject.formTitle = newTitle;

            delete existingFormObject.createdAt;
            delete existingFormObject.updatedAt;
            delete existingFormObject.formId;
            delete existingFormObject.__v;
            delete existingFormObject._id;

            const newForm = new FormModel(existingFormObject);
            const duplicatedForm = await newForm.save();

            return {
                created: true,
                data: duplicatedForm
            };
        } catch (error) {
            logger.log(`Error while duplicating form: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                created: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while duplicating form: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }
    /* // POST METHODS // */

    /*  UPDATE METHODS  */
    static async updateFormById(platform, decrypted, formId, formData) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId: formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const updates = {
                $set:
                {
                    'embedData.data': formData?.embedData?.data,
                    'adminData': formData?.adminData,
                    'expiration': formData?.expiration,
                    'formTitle': formData?.formTitle,
                    'isPreview': formData?.isPreview,
                    'isRemoved': formData?.isRemoved,
                    'isTheme': formData?.isTheme,
                    'themeDescription': formData?.themeDescription,
                    'themeId': formData?.themeId,
                    'userGroupId': formData?.userGroupId,
                    'userId': formData?.userId,
                }
            }

            const submittedEmbedInputs = formData?.embedData?.data?.inputs;
            const existingMirroredInputs = existingForm?.embedData?.mirrored;

            if (submittedEmbedInputs) {
                const updatedMirrored = await FormFilter.updateInputsSlots(submittedEmbedInputs, existingMirroredInputs);

                if (updatedMirrored.length > 0) {
                    for (const path of updatedMirrored) {
                        updates["$set"][path] = { slots: 0 };
                    }
                }
            }

            const updatedForm = await FormModel.findOneAndUpdate({ formId: formId }, updates, { new: true, runValidators: true, context: 'query' });

            if (updatedForm) {
                FormHelpers.processFormFiles(updatedForm, platform);

                const updatedFormActivity = await FormHelpers.checkForActivityUpdates(existingForm, updatedForm, decrypted.user_id);

                if (updatedFormActivity && Object.keys(updatedFormActivity.updatedData).length > 0) {
                    const FormActivityModel = await getModel(platform, 'FormActivity');

                    await FormActivityModel.findOneAndUpdate(
                        { formId: updatedForm.formId },
                        {
                            $push: {
                                activity: {
                                    $each: [updatedFormActivity],
                                    $position: 0
                                }
                            }
                        }
                    );
                }
            }

            return {
                updated: true,
                data: updatedForm
            };
        } catch (error) {
            logger.log(`Error while updating form: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                updated: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while updating form: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }
    /* // UPDATE METHODS // */

    /*  DELETE METHODS  */
    static async deleteFormById(platform, decrypted, formId, isPreview = false) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId: formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            let deletedForm;

            if (isPreview) {
                deletedForm = await FormModel.deleteOne({ formId: formId });
            }

            if (!isPreview) {
                deletedForm = await FormModel.findOneAndUpdate(
                    { formId: formId },
                    [
                        {
                            $set: {
                                formTitle: { $concat: ["$formTitle", " REMOVED"] },
                                isRemoved: true
                            }
                        }
                    ],
                    { new: true, runValidators: true }
                );

                if (!deletedForm || !deletedForm?.isRemoved) {
                    throw new Error(`Error removing form with id: ${formId}`);
                }

                const FormActivityModel = await getModel(platform, 'FormActivity');

                await FormActivityModel.findOneAndUpdate(
                    { formId: deletedForm.formId },
                    {
                        $push: {
                            activity: {
                                $each: [{
                                    operation: 'remove',
                                    userId: decrypted.user_id
                                }],
                                $position: 0
                            }
                        }
                    }
                );
            }

            return {
                deleted: true,
                data: deletedForm
            };
        } catch (error) {
            logger.log(`Error while deleting form: ${error}`);

            return {
                deleted: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while deleting form: ${!this.DEBUG ? error._message : error}`,
                    message: 'Error deleting form'
                }
            };
        }
    }
    /* // DELETE METHODS // */
}

export default FormService;