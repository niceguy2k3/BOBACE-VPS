import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    // Don't show banner if already installed
    if (isStandaloneMode) {
      return;
    }

    // Check if user has dismissed the banner permanently
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Show banner after 3 seconds for mobile users
    const timer = setTimeout(() => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !isStandaloneMode) {
        setShowBanner(true);
      }
    }, 3000);

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA đã được cài đặt thành công!');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User choice: ${outcome}`);

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Hide permanently
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone || !showBanner) {
    return null;
  }

  // iOS specific instructions
  if (isIOS) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '64px',
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
          color: 'white',
          padding: '1.5rem 1rem',
          zIndex: 10000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              📱 Cài đặt BoBace ngay!
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.4' }}>
              Nhấn <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>Chia sẻ</span> {String.fromCharCode(8594)}{' '}
              <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>Thêm vào Màn hình chính</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome install prompt
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '64px',
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
        color: 'white',
        padding: '1.5rem 1rem',
        zIndex: 10000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            📱 Cài đặt BoBace ngay!
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.95, lineHeight: '1.4' }}>
            Cài đặt để trải nghiệm như một app thực, truy cập nhanh hơn!
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleInstallClick}
            style={{
              background: 'white',
              color: '#FF6B6B',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Cài đặt
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            aria-label="Đóng"
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;


