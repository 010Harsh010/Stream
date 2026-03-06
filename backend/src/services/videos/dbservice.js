import { Queue } from "./queue.js";
import { uploadcloudinary } from "../../utils/cloudinary.js";
import { Video } from "../../models/video.model.js";
import { notifyUser} from "./notification.js";

const dbWorker = async (data) => {
    try {
        if(trying > 3){
            const err = new Error(`Failed to after multiple attempts`);
            err.data = {
                type: data.type,
                message:"Limit excedded for processing your request. Please try again later."
              };
            throw err;
        }
        data.trying = data.trying + 1;
        if(data.type === "video-upload"){
            const video = await Video.create({
                title:data.title,
                description:data.description,
                videoFile:data.videocloud,
                thumbnail: data.thumbnail,
                owner: data.owner,
                duration: data.duration
            });
        }
    }catch(error){
        console.log("Error in dbWorker:", error.message);
        // re-add to queue for retry
        if(trying <= 3){
            dbQueue.add(data);
        }
        if (error.data){
            if(error.data.type === "video-upload"){
                if(error.data?.videourl){
                    await deletecloudVideo(data.videourl);
                    console.log("Deleted video from Cloudinary:", data.videourl);
                }
                if(error.data?.thumbnailurl){
                    await deletecloudVideo(data.thumbnailurl);
                    console.log("Deleted thumbnail from Cloudinary:", data.thumbnailurl);
                }
                error.userId = data.owner;
                error.data.message = `Failed to upload your video ${data.title}. Please try again later.`;
                notifyUser(error.data);
            }
        }
        return;
    }
}

const dbQueue = new Queue(dbWorker);

export {
    dbQueue,
    dbWorker
}
