import mongoose from 'mongoose';

export function FormActivitySchema(platform) {
    return new mongoose.Schema({
        formId: {
            type: String,
            default: null,
            unique: false,
            maxlength: 10,
            required: true
        },
        activity: [
            {
                operation: {
                    type: String,
                    default: "update",
                },
                userId: {
                    type: String,
                    default: null,
                    unique: false,
                    maxlength: 15
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                updatedData: {
                    type: Object,
                    default: null,
                }
            }
        ]
    }, { collection: `${platform}-forms-activity` });
}