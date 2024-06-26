import mongoose from 'mongoose';
import { AdminSchema } from './AdminSchema.js';
import { EmbedSchema } from './EmbedSchema.js';
import FormHelpers from '../helpers/Form.js';

export const FormSchema = new mongoose.Schema({
    formTitle: {
        type: String,
        required: true,
        unique: false
    },
    formId: {
        type: String,
        default: function () {
            return FormHelpers.generateFormId(10);
        },
        unique: true,
        maxlength: 10
    },
    thumbnailId: {
        type: String,
        required: false,
        unique: false,
        default: null
    },
    userId: {
        type: String,
        required: true,
        unique: false,
        maxlength: 15
    },
    userGroupId: {
        type: String,
        required: true,
        unique: false,
        maxlength: 15
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    expiration: {
        expires: {
            type: Boolean,
            default: false
        },
        dateTime: {
            type: Date,
            default: null
        }
    },
    themeId: {
        type: String,
        default: null
    },
    themeDescription: {
        type: String,
        default: null
    },
    isTheme: {
        type: Boolean,
        default: false
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    isRemoved: {
        type: Boolean,
        default: false
    },
    adminData: {
        type: AdminSchema,
        required: true
    },
    embedData: {
        type: EmbedSchema,
        required: true
    },
    apiData: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    strict: "throw",
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});