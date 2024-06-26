import mongoose from 'mongoose';
import { FormSchema } from '../schemas/FormSchema.js';
import { FormActivitySchema } from '../schemas/FormActivitySchema.js';
import { SubmissionSchema } from '../schemas/SubmissionSchema.js';

const schemaMap = (platform, name) => {
    const schemaMap = {
        Form: FormSchema,
        FormActivity: FormActivitySchema(platform),
        Submission: SubmissionSchema,
    };

    return schemaMap[name];
}

export const getModel = async (platform, name) => {
    let model;
    let modelName = `${platform}-${name === 'FormActivity' ? 'forms-activity' : name}`;
    let schema = schemaMap(platform, name); // Dynamically select the schema

    if (!schema) {
        throw new Error(`Schema for ${name} not found.`);
    }

    if (mongoose.models[modelName]) {
        // The model already exists, use it directly
        model = mongoose.model(modelName);
    } else {
        // The model does not exist, define it with the provided schema
        model = mongoose.model(modelName, schema);
    }

    return model;
};
