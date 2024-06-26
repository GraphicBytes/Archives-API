import { triggerLoadingDockProcessing } from './External.js';

class SubmissionHelpers {
    static async checkSubmissionForUploadField(platform, submissionData) {
        for (const key in submissionData) {
            if (key.includes('fileuploadfield')) {
                const uploadField = submissionData[key];

                if (uploadField.value) {
                    const values = uploadField.value.split(',').map(value => value.trim());

                    for (const value of values) {
                        await triggerLoadingDockProcessing(value, platform);
                    }
                }
            }
        }
    }

    static async deleteSubmissionProperties(obj, propertiesToKeep) {
        Object.keys(obj).forEach(key => {
            if (!propertiesToKeep.includes(key)) {
                delete obj[key];
            }
        });
    }

    static async removeDuplicateTriggers(arr) {
        arr = arr.map((item) => {
            delete item.operator
            return item;
        });

        return arr.filter((item, index, self) =>
            index === self.findIndex((t) => (
                JSON.stringify(t) === JSON.stringify(item)
            ))
        );
    }

    static async evaluateTriggerCondition(fieldValue, condition, targetValue) {
        if (fieldValue === '') { fieldValue = 'off'; }

        switch (condition) {
            case '===':
                return fieldValue === targetValue;
            case '!==':
                return fieldValue !== targetValue;
            default:
                return false;
        }
    }

    static async validateTriggerConditions(submissionData, triggerConditions) {
        let results = {};
        const uniqueConditions = await this.removeDuplicateTriggers(triggerConditions);
        const operator = triggerConditions?.length && triggerConditions.length > 1 ? triggerConditions[1].operator : null;

        uniqueConditions.forEach(async (condition) => {
            let fieldName = condition.fieldName;

            if (submissionData.hasOwnProperty(fieldName)) {
                let field = submissionData[fieldName];
                let fieldValue = Array.isArray(field.value) && field.value.length > 0 ? field.value[0].value : field.value;
                let result = await this.evaluateTriggerCondition(fieldValue, condition.condition, condition.value);

                results[fieldName] = result;
            }
        });

        if (operator) {
            return operator === '&&' ? Object.values(results).every(Boolean) : Object.values(results).some(Boolean);
        } else {
            return Object.values(results).every(Boolean);
        }
    }

    static async checkSubmissionActivityUpdates_(existingSubmission, updatedSubmission, userId) {
        const activity = {
            userId: userId,
            updatedData: {}
        };

        const arraysEqual = (a, b) => {
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length !== b.length) return false;

            // Compare each element
            for (let i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        };

        if (!arraysEqual(existingSubmission.status, updatedSubmission.status)) {
            activity.updatedData.status = updatedSubmission.status;
        }

        if (existingSubmission.public !== updatedSubmission.public) {
            activity.updatedData.public = updatedSubmission.public;
        }

        const fieldUpdates = Object.keys(updatedSubmission.fields).reduce((acc, key) => {
            const existingField = existingSubmission.fields[key];
            const updatedField = updatedSubmission.fields[key];

            if (existingField && updatedField && existingField.value !== updatedField.value) {
                acc[key] = {
                    value: updatedField.value,
                    label: updatedField.label
                };
            }
            return acc;
        }, {});

        if (Object.keys(fieldUpdates).length > 0) {
            activity.updatedData.fields = fieldUpdates;
        }

        return activity;
    }

    static async checkSubmissionActivityUpdates(existingSubmission, updatedSubmission, userId) {
        const activity = {
            userId: userId,
            updatedData: {}
        }

        const existingStatus = existingSubmission.status;
        const existingPublic = existingSubmission.public;
        const existingFields = existingSubmission.fields;

        const updatedStatus = updatedSubmission.status;
        const updatedPublic = updatedSubmission.public;
        const updatedFields = updatedSubmission.fields;

        if (JSON.stringify(updatedStatus) !== JSON.stringify(existingStatus)) {
            activity.updatedData.status = updatedStatus;
        }

        if (updatedPublic !== existingPublic) {
            activity.updatedData.public = updatedPublic;
        }

        for (const key in existingFields) {
            if (updatedFields.hasOwnProperty(key)) {
                if (existingFields[key].value !== updatedFields[key].value) {
                    activity.updatedData.fields = {
                        [key]: {
                            value: updatedFields[key].value,
                            label: updatedFields[key].label
                        }
                    };
                }
            }
        }

        return activity;
    }

    static async updateSubmissionData(userId, SubmissionModel, submissionData, existingSubmission) {
        if (!existingSubmission) {
            return;
        }

        const updatedSubmissionActivity = await this.checkSubmissionActivityUpdates(existingSubmission, submissionData, userId);

        if (updatedSubmissionActivity && Object.keys(updatedSubmissionActivity.updatedData).length > 0) {
            return await SubmissionModel.findByIdAndUpdate(
                existingSubmission._id,
                {
                    $set: submissionData,
                    $addToSet: { moderators: userId },
                    $push: {
                        activity: {
                            $each: [updatedSubmissionActivity],
                            $position: 0
                        }
                    }
                },
                { new: true }
            );
        } else {
            console.log(submissionData);
            return await SubmissionModel.findByIdAndUpdate(
                existingSubmission._id,
                {
                    $set: submissionData,
                    $addToSet: { moderators: userId }
                },
                { new: true }
            );
        }
    }
}

export default SubmissionHelpers;