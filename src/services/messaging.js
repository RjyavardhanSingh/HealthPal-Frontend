import { getMessaging, getToken as getMessagingToken } from "firebase/messaging";
import { app } from "../config/firebase";

export const initializeMessaging = async () => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      const token = await getMessagingToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};