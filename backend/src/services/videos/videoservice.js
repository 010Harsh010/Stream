import { Queue } from "./queue.js";
import { uploadcloudinary } from "../../utils/cloudinary.js";
import { Video } from "../../models/video.model.js";
import { dbQueue } from "./dbservice.js";
import { deletecloudVideo } from "../../utils/cloudinary.js";
import { notifyUser } from "./notification.js";

const videoWorker = async (data) => {
  try {
    const { title, description, videourl, thumbnailurl, owner, trying } = data;
    if (trying > 3) {
      console.log("Max retry limit reached for video upload:", title);
      const err = new Error(`Failed to upload video ${title} after multiple attempts`);
      err.data = {
          userId: owner,
          type: "video-upload",
          message: `Failed to upload your video ${title} after multiple attempts. Please try again later.`,
        };
      throw err;
    }
    data.trying = trying + 1;
    console.log(
      `Processing video upload for: ${title} - ${description}, Owner: ${owner}, Video: ${videourl}, Thumbnail: ${thumbnailurl}`
    );
    let videocloud;
    let thumbnail;
    try {
      if(data?.videocloud){
        videocloud = data.videocloud;
      }else{
        videocloud = await uploadcloudinary(videourl);
      }
      if(data?.thumbnail){
        thumbnail = data.thumbnail;
      }else{
        thumbnail = await uploadcloudinary(thumbnailurl);
      }
    } catch (error) {
      if (videocloud) {
        data.videocloud = videocloud;
      }
      if (thumbnail) {
        data.thumbnail = thumbnail;
      }
      videoQueue.add(data);
      return;
    }
 
    if (!(videocloud && thumbnail)) {
      const err = new Error(`Failed to upload video or thumbnail for ${title}`);
      err.data = {
          userId: owner,
          type: "video-upload",
          message: `Failed to upload your video ${title}. Please try again later.`,
        };
      throw err;
    }
  
    let video;
    try {
      video = await Video.create({
        title,
        description,
        videoFile: videocloud.url,
        thumbnail: thumbnail.url,
        owner: owner,
        duration: videocloud.duration,
      });
    } catch (error) {
      const newdata = {
        type: "video-upload",
        tile:title,
        description:description,
        videoFile: videocloud.url,
        thumbnail: thumbnail.url,
        owner: owner,
        duration: videocloud.duration,
        trying: data.trying,
      };
      dbQueue.add(newdata);
      return;
    }

    if (!video) {
      const err = new Error(`Failed to save video details for ${title}`);
      err.data = {
          userId: owner,
          type: "video-upload",
          message: `Failed to save your video ${title}. Please try again later.`,
        };
      throw err;
    }

    notifyUser({
      userId: owner,
      type: "video-upload",
      message: `Your video has been uploaded successfully ${title}`,
    });
  } catch (error) {
    console.log(error.message);
    if (error.data) {
      try {
        if (error.data.type === "video-upload") {
          if(error.data?.videourl){
            await deletecloudVideo(error.data.videourl.url);
            console.log("Deleted video from Cloudinary:", error.data.videourl);
          }
          if(error.data?.thumbnailurl){
            await deletecloudVideo(error.data.thumbnailurl.url);
            console.log("Deleted thumbnail from Cloudinary:", error.data.thumbnailurl);
          }
        }
      } catch (error) {
        console.log("Error during cleanup after failed upload:", error.message);
      }
      notifyUser(error.data);
    }
    return;
  }
};

const deleteVideoWorker = async (data) => {
  const { videoId, owner, trying } = data;
  if (trying > 3) {
    console.log("Max retry limit reached for video delete:", videoId);
    return;
  }
  data.trying = trying + 1;
  console.log(`Processing video delete for: ${videoId}`);
  let video;
  try {
    video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(500, "Error while Finding Video");
    }
  } catch (error) {
    deleteVideoQueue.add(data);
    return;
  }
  try {
    await deletecloudVideo(video.videoFile);
    await video.remove();
  } catch (error) {
    deleteVideoQueue.add(data);
    return;
  }
  notifyUser({
    userId: owner,
    type: "video-delete",
    message: `Your video has been deleted successfully ${title}`,
  });
};

const videoQueue = new Queue(videoWorker);
const deleteVideoQueue = new Queue(deleteVideoWorker);

export { videoQueue, videoWorker, deleteVideoQueue, deleteVideoWorker };
