

import { Router } from "express";

import {MyNotificationController} from "../controllers/notificationController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = Router()


router.post('/notification', jwtCheck, jwtParse, MyNotificationController.createNotification)
router.get('/notification', jwtCheck, jwtParse, MyNotificationController.getNotifications)
router.get('/notification/:id', jwtCheck, jwtParse, MyNotificationController.getNotificationsById)
router.put('/notification/:id', jwtCheck, jwtParse, MyNotificationController.updateNotification)
router.delete('/notification/:id', jwtCheck, jwtParse, MyNotificationController.deleteNotification)


export default router;
