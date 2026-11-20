// PWA Install Manager & Event Listener

let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
    console.log('White Devils Music was successfully installed as an app');
  });
}

function notifyListeners() {
  listeners.forEach(fn => fn(canInstallPWA(), isAppInstalled()));
}

export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true ||
    document?.referrer?.includes('android-app://')
  );
}

export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function canInstallPWA() {
  return !!deferredPrompt || isIOS();
}

export function subscribePWA(callback) {
  listeners.add(callback);
  callback(canInstallPWA(), isAppInstalled());
  return () => listeners.delete(callback);
}

export async function promptPWAInstall() {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredPrompt = null;
        notifyListeners();
        return { success: true, outcome: 'accepted' };
      } else {
        return { success: false, outcome: 'dismissed' };
      }
    } catch (e) {
      console.warn('PWA install error:', e);
      return { success: false, error: e.message };
    }
  }

  if (isIOS()) {
    return {
      success: false,
      isIOS: true,
      message: "To install on iPhone/iPad: tap the Share button (⎋) in Safari and select 'Add to Home Screen'."
    };
  }

  return {
    success: false,
    manual: true,
    message: "To install: click the Install icon (⊕) in your browser address bar or menu."
  };
}
