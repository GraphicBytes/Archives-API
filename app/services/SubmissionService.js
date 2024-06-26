import { StatusCodes } from 'http-status-codes';
import { getModel } from '../helpers/Model.js';
import { sendToSwitchBoard } from '../helpers/External.js';
import { ErrorMessageFilter } from '../filters/ErrorFilter.js';
import SubmissionHelpers from '../helpers/Submission.js';
import SubmissionFilter from '../filters/SubmissionFilter.js';
import Logger from '../helpers/Logger.js';

const logger = new Logger('SubmissionService');

class SubmissionService {
    static DEBUG = true;

    /*  GET METHODS  */
    static async getSubmissionsByFormId(platform, decrypted, formId, sortBy, sortValue) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');

            const formModActions = existingForm?.adminData?.data?.modActions;
            const formAdminInputs = existingForm?.adminData?.data?.adminInputs;
            const formEmbedInputs = existingForm?.embedData?.data?.inputs;

            const Query = await SubmissionModel.find({ formId: formId, removed: false }).sort({ [sortBy]: sortValue === 'desc' ? -1 : 1 });

            const data = {
                formId: existingForm.formId,
                formTitle: existingForm.formTitle,
                submissions: Query,
                headers: {},
                modActions: formModActions,
                createdAt: existingForm.createdAt
            };

            if (formAdminInputs && Object.keys(formModActions)?.length > 0) {
                data.headers = await SubmissionFilter.addSubmissionsHeaders(formAdminInputs, formModActions);

                if (data?.submissions.length > 0) {
                    data.submissions = data.submissions.map(submission => {
                        return SubmissionFilter.addSubmissionsData(submission, formEmbedInputs, formAdminInputs, submission?.modActions?.length > 0 ? submission.modActions : formModActions);
                    });
                }
            }

            return {
                retrieved: true,
                data: data
            };
        } catch (error) {
            logger.log(`Error while getting submissions: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting submissions: ${!this.DEBUG ? error._message : error}`,
                    message: 'No submissions were found for this form'
                }
            };
        }
    }

    static async getSubmissionBySubmissionId(platform, decrypted, formId, submissionId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');

            const formModActions = existingForm?.adminData?.data?.modActions;
            const formAdminInputs = existingForm?.adminData?.data?.adminInputs;
            const formEmbedInputs = existingForm?.embedData?.data?.inputs;

            const existingSubmission = await SubmissionModel.findOne({
                _id: submissionId,
                formId: formId,
            });

            SubmissionFilter.addSubmissionsData(existingSubmission, formEmbedInputs, formAdminInputs, existingSubmission?.modActions?.length > 0 ? existingSubmission.modActions : formModActions);

            return {
                retrieved: true,
                data: existingSubmission
            };
        } catch (error) {
            logger.log(`Error while getting submission: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting submission: ${!this.DEBUG ? error._message : error}`,
                    message: 'Submission not found'
                }
            };
        }
    }

    static async getSubmissionsActivity(platform, decrypted) {
        try {
            const SubmissionModel = await getModel(platform, 'Submission');

            const Query = await SubmissionModel.aggregate([
                {
                    $unwind: "$activity"
                },
                {
                    $sort: { "activity.timestamp": -1 }
                },
                {
                    $project: {
                        _id: 0,
                        formId: 1,
                        activity: 1,
                        submissionId: "$_id",
                    }
                }
            ]);

            return {
                retrieved: true,
                data: Query
            };
        } catch (error) {
            logger.log(`Error while getting submissions: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting submissions activity: ${!this.DEBUG ? error._message : error}`,
                    message: 'No submissions activity found'
                }
            };
        }
    }

    static async getSubmissionsCountByFormId(platform, decrypted, formId) {
        try {
            const SubmissionModel = await getModel(platform, 'Submission');

            const pipeline = [
                { $match: { formId: formId } },
                { $unwind: "$status" }, // Deconstruct the status array
                {
                    $group: {
                        _id: null, // Group all documents together
                        total: { $sum: 1 }, // Count the total number of submissions
                        moderated: {
                            $sum: { $cond: [{ $eq: ["$status", "moderated"] }, 1, 0] }
                        },
                        rejected: {
                            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                        },
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field from the output
                        moderated: "$moderated",
                        rejected: "$rejected",
                        pending: "$pending",
                        total: "$total",
                    }
                }
            ];

            const Query = await SubmissionModel.aggregate(pipeline);
            const count = Query.length > 0 ? Query[0] : { moderated: 0, rejected: 0, pending: 0, total: 0 };

            return {
                retrieved: true,
                data: count
            };
        } catch (error) {
            logger.log(`Error while getting submissions count: ${error}`);

            return {
                retrieved: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while getting submissions count: ${!this.DEBUG ? error._message : error}`,
                    message: 'No submissions were found for this form'
                }
            };
        }
    }
    /* // GET METHODS // */

    /*  POST METHODS  */
    static async createSubmissionByFormIdPublic(platform, decrypted, formId, submissionData) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');

            const activity = {
                operation: "create"
            }

            const newSubmission = new SubmissionModel({ formId: formId, submissionData: submissionData, activity: activity });
            const savedSubmission = await newSubmission.save();

            if (savedSubmission) {
                const mirroredInputs = existingForm?.embedData?.mirrored?.inputs;

                if (mirroredInputs) {
                    const embedInputs = existingForm?.embedData?.data?.inputs;
                    const updatedMirroredInputs = SubmissionFilter.increaseSlots(submissionData, mirroredInputs, embedInputs);

                    if (updatedMirroredInputs) {
                        await FormModel.findOneAndUpdate({ formId: formId }, { $set: { 'embedData.mirrored.inputs': updatedMirroredInputs } });
                    }
                }

                await SubmissionHelpers.checkSubmissionForUploadField(platform, savedSubmission.submissionData);

                const formAdminData = await FormModel.findOne({ formId: formId }, { 'adminData.data': 1 });
                sendToSwitchBoard(platform, formAdminData, savedSubmission.submissionId, savedSubmission.submissionData);
            }

            return {
                created: true,
                data: { success: "Successfully created submission" }
            };
        } catch (error) {
            logger.log(`Error while creating submission: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                created: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while creating submission: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }

    static async createSubmissionNoteBySubmissionId(platform, decrypted, submissionId, submissionNote) {
        try {
            if (!submissionNote?.note || !submissionNote.note || submissionNote.note === '<p></p>') {
                const error = new Error(`Submission note empty`);
                error.status = StatusCodes.BAD_REQUEST;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');

            await SubmissionModel.findById(submissionId);

            const submissionActivity = {
                userId: decrypted?.user_id,
                updatedData: {
                    note: submissionNote.note
                }
            }

            const updatedActivity = await SubmissionModel.findByIdAndUpdate(
                submissionId,
                {
                    $push: {
                        activity: {
                            $each: [submissionActivity],
                            $position: 0
                        }
                    },
                    $addToSet: { moderators: decrypted?.user_id }
                },
                { new: true }
            );

            return {
                created: true,
                data: updatedActivity
            };
        } catch (error) {
            logger.log(`Error while creating submission note: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                created: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while creating submission note: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }
    /* // POST METHODS // */

    /*  UPDATE METHODS  */
    static async updateSubmissionBySubmissionId(platform, decrypted, formId, submissionId, submissionData) {
        try {
            if (!submissionData || Object.keys(submissionData).length === 0) {
                const error = new Error(`No data to update`);
                error.status = StatusCodes.BAD_REQUEST;
                throw error;
            }

            await SubmissionHelpers.deleteSubmissionProperties(submissionData, ['public', 'status', 'submissionData', 'modActions']);

            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');
            const existingSubmission = await SubmissionModel.findById(submissionId);
            const updatedSubmission = await SubmissionHelpers.updateSubmissionData(decrypted?.user_id, SubmissionModel, submissionData, existingSubmission);

            return {
                updated: true,
                data: updatedSubmission
            };
        } catch (error) {
            logger.log(`Error while updating submission data: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                updated: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while updating submission data: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }

    static async updateSubmissionsBulk(platform, decrypted, submissionsData) {
        try {
            const updatedSubmissions = [];

            for (const submissionData of submissionsData) {
                const formId = submissionData?.formId;
                const submissionId = submissionData?._id;

                const updatedSubmission = await this.updateSubmissionBySubmissionId(platform, decrypted, formId, submissionId, submissionData);

                if (updatedSubmission.updated) {
                    updatedSubmissions.push(updatedSubmission.data);
                }

                if (!updatedSubmission.updated) {
                    updatedSubmissions.push({
                        _id: submissionId,
                        formId: formId,
                        error: updatedSubmission.data.error,
                        message: updatedSubmission.data.message
                    });
                }
            }

            return {
                updated: true,
                data: updatedSubmissions
            };
        } catch (error) {
            logger.log(`Error while updating submissions data: ${error}`);

            const filteredErrorMessage = ErrorMessageFilter(error);

            return {
                updated: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while updating submissions data: ${!this.DEBUG ? error._message : error}`,
                    message: filteredErrorMessage
                }
            };
        }
    }
    /* // UPDATE METHODS // */

    /*  DELETE METHODS  */
    static async deleteSubmissionBySubmissionId(platform, decrypted, formId, submissionId) {
        try {
            const FormModel = await getModel(platform, 'Form');

            const existingForm = await FormModel.findOne({ formId });

            if (!existingForm) {
                const error = new Error(`Form with id: ${formId} was not found`);
                error.status = StatusCodes.NOT_FOUND;
                throw error;
            }

            const SubmissionModel = await getModel(platform, 'Submission');

            const removedSubmission = await SubmissionModel.findByIdAndUpdate(
                submissionId,
                {
                    $set: { removed: true },
                },
                { new: true }
            );

            return {
                deleted: true,
                data: removedSubmission
            };
        } catch (error) {
            logger.log(`Error while deleting form submission: ${error}`);

            return {
                deleted: false,
                statusCode: error.status || StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    error: `Error while deleting form submission: ${!this.DEBUG ? error._message : error}`,
                    message: 'Submission couldn\'t be removed'
                }
            };
        }
    }
    /* // DELETE METHODS // */
}

export default SubmissionService;