import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    message:     { type: String, required: true },
    isRead:      { type: Boolean, default: false },
    createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model('Notification', notificationSchema);