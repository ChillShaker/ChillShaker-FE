import { getToken } from 'firebase/messaging';
import { useEffect, useState, useRef } from 'react';
import useAuthStore from '../lib/hooks/useUserStore';
import {
  registerDeviceToken,
  linkDeviceToken
} from '../lib/service/notificationService';
import { messaging } from '../lib/Third-party/firebase/messaging';
import { vapidKey } from '../lib/Third-party/firebase/config';

export const useFCMToken = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuthStore();
  const isInitialized = useRef(false);
  const tokenInProgress = useRef(false);

  useEffect(() => {
    const initializeAndGetToken = async () => {
      if (isInitialized.current || tokenInProgress.current) {
        return;
      }

      try {
        tokenInProgress.current = true;
        setLoading(true);

        if (!('serviceWorker' in navigator)) {
          throw new Error('Service Worker not supported');
        }

        let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        
        if (!registration) {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;
        }

        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });

        if (currentToken) {
          //console.log('FCM Token generated:', currentToken);
          localStorage.setItem('fcmToken', currentToken);
          
          if (isLoggedIn) {
            await linkDeviceToken(currentToken);
          } else {
            await registerDeviceToken(currentToken);
          }

          setFcmToken(currentToken);
          setError(null);
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('FCM Error:', error);
        setError(error.message);
        setFcmToken(null);
      } finally {
        setLoading(false);
        tokenInProgress.current = false;
      }
    };

    if (!isInitialized.current && !tokenInProgress.current) {
      initializeAndGetToken();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    return () => {
      isInitialized.current = false;
      tokenInProgress.current = false;
    };
  }, []);

  const checkPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      //console.log('Notification permission:', permission);
      
      if (permission === 'granted') {
        // Kiểm tra service worker registration
        const registration = await navigator.serviceWorker.getRegistration();
        //console.log('Service Worker registration:', registration);
        
        // Kiểm tra FCM subscription
        const subscription = await registration?.pushManager.getSubscription();
        //console.log('Push subscription:', subscription);
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  return { fcmToken, loading, error };
}; 