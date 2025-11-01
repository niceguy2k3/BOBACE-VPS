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

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);

      // Hide banner after 10 seconds if not clicked
      setTimeout(() => {
        setShowBanner(false);
      }, 10000);
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
    // Hide for session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showBanner) {
    return null;
  }

  // iOS specific instructions
  if (isIOS) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          color: 'white',
          padding: '1rem',
          zIndex: 10000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
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
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              📱 Cài đặt BoBace
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Nhấn <span style={{ fontWeight: 'bold' }}>Chia sẻ</span> {String.fromCharCode(8594)}{' '}
              <span style={{ fontWeight: 'bold' }}>Thêm vào Màn hình chính</span>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        color: 'white',
        padding: '1rem',
        zIndex: 10000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
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
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            📱 Cài đặt BoBace
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Cài đặt để trải nghiệm tốt hơn như một ứng dụng thực!
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleInstallClick}
            style={{
              background: 'white',
              color: '#FF6B6B',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
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
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Đóng"
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
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


