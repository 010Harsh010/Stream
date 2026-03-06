import { Queue } from "./queue.js";
import { Notification } from "../../models/notification.model.js";
import { io, map } from "../../socket.js";

const notificationWorker = async (data) => {
    try {
        const { userId, type, message } = data;
        const notification = new Notification({ userId, type, message });
        await notification.save();
         
        const socketId = map.get(userId);
        if(socketId) {
            console.log(
            `Notifying user ${socketId} with type ${type} and message: ${message}`
            );
            io.to(socketId).emit("notification", { type, message });
        }
        return;
    } catch (error) {
        console.log("Error saving notification to database:", error.message);
    }
}

export const notifyUser = (data) => {
    notificationQueue.enqueue(data);
}

const notificationQueue = new Queue(notificationWorker);
export { notificationQueue, notificationWorker 
};