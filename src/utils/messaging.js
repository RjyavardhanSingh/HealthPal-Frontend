import { getToken as getMessagingToken, getMessaging } from "firebase/messaging";
import { app } from "../config/firebase";

export const getToken = async (vapidKey) => {
  try {
    const messaging = getMessaging(app);
    const token = await getMessagingToken(messaging, {
      vapidKey: vapidKey || process.env.VITE_FIREBASE_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting messaging token:', error);
    return null;
  }
};