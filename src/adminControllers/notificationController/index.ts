import * as createNotification from "./createNotification";
import * as getNotifications from "./getNotifications";
import * as updateNotification from "./updateNotification";
import * as deleteNotification from "./deleteNotification";
import * as getNotificationsById from "./getNotificationsById";




export const MyNotificationController = {
    ...createNotification,
    ...getNotifications,
    ...updateNotification,
    ...getNotificationsById,
    ...deleteNotification
}