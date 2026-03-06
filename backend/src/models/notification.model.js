import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    type: {
        type: ["video-upload", "comment", "like", "subscription"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

export const Notification = mongoose.model("Notification", notificationSchema);