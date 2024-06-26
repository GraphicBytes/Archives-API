import { customAlphabet } from 'nanoid';
import { triggerLoadingDockProcessing } from './External.js';

class FormHelpers {
    static async checkFormDataForFiles(savedForm) {
        const formFileIds = [];
        const inputs = savedForm.embedData.data.inputs;

        for (const key in inputs) {
            if (inputs.hasOwnProperty(key)) {
                const item = inputs[key];

                const lowerCaseType = item.type.toLowerCase();

                if (lowerCaseType === 'image') {
                    formFileIds.push(item.data.elementAttributes.id);
                }

                if (lowerCaseType === 'video') {
                    formFileIds.push(item.data.video.id);
                }
            }
        }

        return formFileIds;
    }

    static createQueue() {
        // Create an async queue
        const queue = async.queue(async (task) => {
            try {
                const response = await axios.post(`${process.env.PUPPETEER_URL}/capture`, task.body);
                console.log(`Processed formId: ${task.formId}`);

                return response.data;
            } catch (error) {
                throw error;
            }
        }, 1); // Only one task at a time

        // When all tasks have been processed
        queue.drain(function () {
            console.log('All requests have been processed.');
        });

        return queue;
    }

    static async generateFormImage(formId) {
        const body = {
            formId: formId,
            formURL: `${process.env.RENDERER_URL}/render`,
            platform: this.platform
        }

        this.myQueue.push({ formId, body }, (err, result) => {
            if (err) {
                console.error('Error data:', err.response ? err.response.data : err.message);
                console.error(`Error generating image for form id: ${formId} and platform: ${this.platform}`);
            } else {
                // console.log('Image generated:', result);

                if (result && result?.loadingdockResponse && result.loadingdockResponse?.file_id) {
                    const formImageId = result.loadingdockResponse.file_id;

                    try {
                        this.model.findOneAndUpdate({ formId: formId }, { $set: { thumbnailId: formImageId } }).exec();

                        pingLoadingDock(formImageId, this.platform);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        });
    }

    static async processFormFiles(savedForm, platform) {
        const formFileIds = await this.checkFormDataForFiles(savedForm);

        if (formFileIds.length) {
            for (const fileId of formFileIds) {
                await triggerLoadingDockProcessing(fileId, platform, 1); // 1 = public
            }
        }

        if (savedForm?.adminData && savedForm.adminData?.data?.image) {
            // await triggerLoadingDockProcessing(form.adminData.data.image, platform);
        }

        if (savedForm) {
            // generateFormImage(form.formId);
        }
    }

    static generateFormId(length) {
        const allowedCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const generateId = customAlphabet(allowedCharacters, length);

        return generateId();
    }

    static createFormActivity(userId) {
        return {
            operation: "create",
            userId: userId
        }
    }

    static async checkForActivityUpdates(existingForm, updatedForm, userId) {
        const activity = {
            userId: userId,
            updatedData: {}
        };

        if (updatedForm?.formTitle !== existingForm?.formTitle) {
            activity.updatedData.formTitle = updatedForm.formTitle;
        }

        const compareAndUpdate = (existingData, updatedData) => {
            const allKeys = new Set([...Object.keys(updatedData ?? {}), ...Object.keys(existingData ?? {})]);
            const changes = {};

            for (const key of allKeys) {
                const existingItem = existingData?.[key];
                const updatedItem = updatedData?.[key];

                if (!existingItem && updatedItem) {
                    changes[key] = { ...updatedItem, operation: 'added' };
                } else if (existingItem && !updatedItem) {
                    changes[key] = { title: existingItem.title, operation: 'removed' };
                } else if (existingItem && updatedItem && JSON.stringify(existingItem) !== JSON.stringify(updatedItem)) {
                    changes[key] = { ...updatedItem, operation: 'updated' };
                }
            }

            return changes;
        };

        // Compare and update modActions
        const updatedModActions = updatedForm?.adminData?.data?.modActions;
        const existingModActions = existingForm?.adminData?.data?.modActions;
        const modActionsChanges = compareAndUpdate(existingModActions, updatedModActions);
        if (Object.keys(modActionsChanges).length > 0) {
            activity.updatedData.modActions = modActionsChanges;
        }

        // Compare and update formInputs
        const updatedFormFields = updatedForm?.adminData?.data?.adminInputs;
        const existingFormFields = existingForm?.adminData?.data?.adminInputs;
        const formInputsChanges = compareAndUpdate(existingFormFields, updatedFormFields);
        if (Object.keys(formInputsChanges).length > 0) {
            activity.updatedData.formInputs = formInputsChanges;
        }

        return activity;
    }
}

export default FormHelpers;