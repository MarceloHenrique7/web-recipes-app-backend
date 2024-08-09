import { Router } from "express";
import {MyNotificationController} from "../adminControllers/notificationController";
import { jwtCheck, jwtParse } from "../middleware/auth";
const router = Router()

router.post('/', jwtCheck, jwtParse, MyNotificationController.createNotification)
router.get('/', jwtCheck, jwtParse, MyNotificationController.getNotifications)
router.get('/:id', jwtCheck, jwtParse, MyNotificationController.getNotificationsById)
router.put('/:id', jwtCheck, jwtParse, MyNotificationController.updateNotification)
router.delete('/', jwtCheck, jwtParse, MyNotificationController.deleteNotification)

export default router;
