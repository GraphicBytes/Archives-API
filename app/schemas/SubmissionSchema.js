import mongoose from 'mongoose';

export const SubmissionSchema = new mongoose.Schema({
    formId: {
        type: String,
        default: null,
        unique: false,
        maxlength: 10,
        required: true
    },
    public: {
        type: Boolean,
        default: false
    },
    status: {
        type: Array,
        default: ["pending"],
        required: true
    },
    modActions: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    moderators: {
        type: Array,
        default: null
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
    ],
    submissionData: {
        type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    removed: {
        type: Boolean,
        default: false
    },
}, {
    strict: "throw",
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});