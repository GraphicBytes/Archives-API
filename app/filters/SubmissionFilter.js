class SubmissionFilter {
    static async addSubmissionsHeaders(adminInputs, modActions) {
        let modActionsFiltered = {};

        for (const [key, value] of Object.entries(modActions)) {
            if (value.keyData) {
                modActionsFiltered[key] = {
                    title: value.title,
                };
            }
        }

        const headers = Object.keys(adminInputs).reduce((acc, key) => {
            const adminObj = adminInputs[key].data?.adminObj;

            if (adminObj && adminObj.keyData) {
                acc[key] = {
                    adminLabel: adminObj.adminLabel,
                    shortLabel: adminObj.shortLabel
                };
            }

            return acc;
        }, {});

        headers.modActions = modActionsFiltered;

        return headers;
    }

    static addSubmissionsData(submission, embedInputs, adminInputs, modActions) {
        for (const key in submission.submissionData) {
            if (adminInputs[key] && adminInputs[key].data && adminInputs[key].data.adminObj) {
                submission.modActions = modActions;
                submission.submissionData[key].adminLabel = adminInputs[key].data.adminObj.adminLabel;
                submission.submissionData[key].shortLabel = adminInputs[key].data.adminObj.shortLabel;
            }

            if (embedInputs[key] && embedInputs[key].data) {
                submission.submissionData[key].label = embedInputs[key].data?.label?.textContent;
            }
        }

        return submission;
    }

    static increaseSlots(submissionData, mirroredInputs, embedInputs) {
        let updated = false;

        for (const key in submissionData) {
            if (key.includes('checkboxgroup')) {
                const options = submissionData[key]?.value;
                const embedInput = embedInputs[key];
                const mirroredInput = mirroredInputs[key];

                if (options.length > 0) {
                    for (const object of options) {
                        if (object?.value && mirroredInput.hasOwnProperty(object?.key)) {
                            let occupiedSlots = mirroredInput[object?.key]?.slots;
                            let availableSlots = embedInput?.data?.options[object?.key]?.limit;

                            if (availableSlots && (parseInt(occupiedSlots) < parseInt(availableSlots))) {
                                mirroredInput[object?.key].slots += 1;

                                updated = true;
                            }
                        }
                    }
                }

            }

            if (key.includes('radiobuttongroup')) {
                const radioKey = submissionData[key]?.key;
                const radioValue = submissionData[key]?.value;
                const mirroredInput = mirroredInputs[key];
                const embedInput = embedInputs[key];

                if (radioKey && radioValue) {
                    let occupiedSlots = mirroredInput[radioKey]?.slots;
                    let availableSlots = embedInput?.data?.options[radioKey]?.limit;

                    if (availableSlots && (parseInt(occupiedSlots) < parseInt(availableSlots))) {
                        mirroredInput[radioKey].slots += 1;

                        updated = true;
                    }
                }
            }
        }

        return updated ? mirroredInputs : updated;
    }
}

export default SubmissionFilter;