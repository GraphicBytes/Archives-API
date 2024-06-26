import mongoose from 'mongoose';

export const EmbedSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    mirrored: {
        type: mongoose.Schema.Types.Mixed
    }
}, { required: true });