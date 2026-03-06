import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/notification").get(getNotifications)
export default router;