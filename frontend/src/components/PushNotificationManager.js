import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import webPushService from '../services/webPushService';

/**
 * Component quản lý Web Push Notifications (VAPID)
 * - Tự động đăng ký subscription khi user vào web/PWA
 * - Đăng ký subscription khi user đăng nhập
 * - Tự động cập nhật subscription khi cần
 * - Đảm bảo subscription luôn được sync với server
 */
const PushNotificationManager = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const hasInitialized = useRef(false);
  const initTimeoutRef = useRef(null);

  // Khởi tạo thông báo đẩy khi người dùng đã đăng nhập
  useEffect(() => {
    // Chỉ chạy một lần khi user đăng nhập hoặc thay đổi
    if (isAuthenticated && currentUser && currentUser._id) {
      // Clear timeout cũ nếu có
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      // Đợi một chút để đảm bảo các service khác đã sẵn sàng
      initTimeoutRef.current = setTimeout(() => {
        console.log('[PushManager] Người dùng đã đăng nhập, tự động đăng ký Web Push...');
        initializePushNotifications();
      }, 1000); // Delay 1 giây để đảm bảo các service đã load xong
    } else {
      // Nếu user logout, reset flag
      hasInitialized.current = false;
    }

    // Cleanup timeout khi component unmount hoặc dependency thay đổi
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?._id]); // Chỉ chạy lại khi user ID thay đổi

  // Check và re-register subscription định kỳ
  useEffect(() => {
    if (!isAuthenticated || !currentUser?._id) {
      return;
    }

    // Check subscription mỗi 5 phút
    const checkInterval = setInterval(async () => {
      if (Notification.permission === 'granted') {
        console.log('[PushManager] Định kỳ kiểm tra subscription...');
        try {
          await webPushService.checkAndReRegisterSubscription();
        } catch (error) {
          console.error('[PushManager] Lỗi khi check subscription:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 phút

    return () => {
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, currentUser?._id]);

  const initializePushNotifications = async () => {
    // Tránh khởi tạo nhiều lần
    if (hasInitialized.current) {
      console.log('[PushManager] Đã khởi tạo rồi, bỏ qua');
      return;
    }

    // Kiểm tra hỗ trợ trình duyệt
    if (!webPushService.isNotificationSupported()) {
      console.log('[PushManager] Trình duyệt không hỗ trợ Web Push');
      hasInitialized.current = true; // Đánh dấu đã thử để không thử lại
      return;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập
      if (!currentUser || !currentUser._id) {
        console.error('[PushManager] Người dùng chưa đăng nhập');
        return;
      }

      // Kiểm tra xem đã đăng ký với user này chưa
      const lastRegisteredUserId = localStorage.getItem('notification_user_id');
      const needsRegistration = lastRegisteredUserId !== currentUser._id;
      
      console.log('[PushManager] Bắt đầu khởi tạo Web Push Notifications...');
      console.log('[PushManager] User ID:', currentUser._id);
      console.log('[PushManager] Notification permission:', Notification.permission);
      console.log('[PushManager] Cần đăng ký mới:', needsRegistration);
      
      // Nếu đã có quyền, đăng ký/sync subscription ngay
      if (Notification.permission === 'granted') {
        console.log('[PushManager] ✅ Quyền đã được cấp, đăng ký/sync subscription...');
        
        try {
          const result = await webPushService.updateSubscriptionUser();
          
          if (result) {
            console.log('[PushManager] ✅ Đã đăng ký/sync subscription thành công');
            localStorage.setItem('notification_registered', 'true');
            localStorage.setItem('notification_user_id', currentUser._id);
            hasInitialized.current = true;
          } else {
            console.warn('[PushManager] ⚠️ Không thể sync subscription, thử yêu cầu lại quyền...');
            // Nếu sync fail, có thể do subscription bị mất, thử tạo lại
            const subscription = await webPushService.requestNotificationPermission();
            if (subscription) {
              console.log('[PushManager] ✅ Đã tạo subscription mới thành công');
              localStorage.setItem('notification_registered', 'true');
              localStorage.setItem('notification_user_id', currentUser._id);
              hasInitialized.current = true;
            }
          }
        } catch (syncError) {
          console.error('[PushManager] ❌ Lỗi khi sync subscription:', syncError);
          // Thử tạo mới nếu sync fail
          try {
            const subscription = await webPushService.requestNotificationPermission();
            if (subscription) {
              console.log('[PushManager] ✅ Đã tạo subscription mới sau khi sync fail');
              localStorage.setItem('notification_registered', 'true');
              localStorage.setItem('notification_user_id', currentUser._id);
              hasInitialized.current = true;
            }
          } catch (retryError) {
            console.error('[PushManager] ❌ Lỗi khi retry subscription:', retryError);
          }
        }
      } 
      // Nếu chưa yêu cầu quyền, yêu cầu ngay
      else if (Notification.permission === 'default') {
        console.log('[PushManager] 🔔 Chưa có quyền, yêu cầu quyền thông báo...');
        
        try {
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            console.log('[PushManager] ✅ Người dùng đã cấp quyền, đăng ký subscription...');
            const subscription = await webPushService.requestNotificationPermission();
            
            if (subscription) {
              console.log('[PushManager] ✅ Đã đăng ký subscription thành công');
              localStorage.setItem('notification_registered', 'true');
              localStorage.setItem('notification_user_id', currentUser._id);
              hasInitialized.current = true;
            } else {
              console.error('[PushManager] ❌ Không thể tạo subscription');
            }
          } else if (permission === 'denied') {
            console.log('[PushManager] ⛔ Người dùng đã từ chối quyền thông báo');
            hasInitialized.current = true; // Đánh dấu để không hỏi lại
          } else {
            console.log('[PushManager] ❓ Người dùng chưa quyết định về quyền thông báo');
            hasInitialized.current = true;
          }
        } catch (permissionError) {
          console.error('[PushManager] ❌ Lỗi khi yêu cầu quyền:', permissionError);
        }
      } 
      // Nếu đã bị từ chối
      else if (Notification.permission === 'denied') {
        console.log('[PushManager] ⛔ Người dùng đã từ chối quyền thông báo từ trước');
        hasInitialized.current = true;
      }
    } catch (error) {
      console.error('[PushManager] ❌ Lỗi khi khởi tạo Web Push:', error);
      hasInitialized.current = true; // Đánh dấu để không retry liên tục
    }
  };

  return null;
};

export default PushNotificationManager;
