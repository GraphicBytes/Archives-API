import mongoose from 'mongoose';

export const AdminSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { required: true });