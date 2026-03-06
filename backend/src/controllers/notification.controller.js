import {Notification} from "../models/notification.model.js"

export const getNotifications = async (req,res)=>{
    const notifications = await Notification.find({userId:req.user._id}).sort({createdAt:-1})
    // console.log(notifications);
    
    res.status(200).json({
        success:true,
        notifications
    })
}