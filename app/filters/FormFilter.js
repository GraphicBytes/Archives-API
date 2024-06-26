class FormFilter {
    static async createInputsSlots(submittedEmbedData) {
        const submittedEmbedInputs = submittedEmbedData?.data?.inputs;

        if (submittedEmbedInputs) {
            submittedEmbedData.mirrored = { inputs: {} };

            try {
                for (const key in submittedEmbedInputs) {
                    if (key.includes('radiobuttongroup') || key.includes('checkboxgroup')) {
                        const options = submittedEmbedInputs[key]?.data?.options;

                        submittedEmbedData.mirrored.inputs[key] = {};

                        if (Object.keys(options).length > 0) {
                            for (const option in options) {

                                if (options[option]?.value && options[option]?.limit) {
                                    submittedEmbedData.mirrored.inputs[key][option] = { slots: 0 };
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    static async updateInputsSlots(submittedEmbedInputs, existingMirroredInputs) {
        const mirrored = [];

        if (submittedEmbedInputs) {
            try {
                for (const key in submittedEmbedInputs) {
                    if (key.includes('radiobuttongroup') || key.includes('checkboxgroup')) {
                        const options = submittedEmbedInputs[key]?.data?.options;

                        if (Object.keys(options).length > 0) {
                            for (const option in options) {
                                if (!existingMirroredInputs?.inputs?.[key]?.[option]) {
                                    if (options[option]?.value && options[option]?.limit) {
                                        mirrored.push(`embedData.mirrored.inputs.${key}.${option}`);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        return mirrored;
    }
}

export default FormFilter;