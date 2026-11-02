// High-precision background timer using Web Worker and Service Worker to prevent browser background throttling
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

type TickCallback = () => void;

class BackgroundScheduler {
  private worker: Worker | null = null;
  private fallbackTimer: ReturnType<typeof setInterval> | null = null;
  private callbacks: Set<TickCallback> = new Set();
  private isRunning = false;

  constructor() {
    this.initWorker();
    this.setupVisibilityListener();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 1000); // 1s high-precision tick on background OS thread
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.notifyTick();
        }
      };
    } catch (err) {
      console.warn('Web Worker initialization fallback to setInterval:', err);
      this.worker = null;
    }
  }

  private setupVisibilityListener() {
    if (typeof window === 'undefined') return;

    // Immediately trigger tick and clear title alert when user tabs back or focuses window
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        stopTitleAlert();
        if (this.isRunning) {
          this.notifyTick();
        }
      }
    });

    window.addEventListener('focus', () => {
      stopTitleAlert();
      if (this.isRunning) {
        this.notifyTick();
      }
    });
  }

  private notifyTick() {
    this.callbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Scheduler callback error:', err);
      }
    });
  }

  public subscribe(callback: TickCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.worker) {
      this.worker.postMessage('start');
    } else if (typeof window !== 'undefined') {
      this.fallbackTimer = setInterval(() => this.notifyTick(), 1000);
    }
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}

export const backgroundScheduler = new BackgroundScheduler();

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Initialize Service Worker for background notifications and tab focusing
 */
export async function initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    swRegistration = reg;
    return reg;
  } catch (err) {
    console.warn('Service worker registration fallback:', err);
    return null;
  }
}

let originalDocTitle = typeof document !== 'undefined' ? document.title : 'Aqua — Mindful Hydration';
let titleAlertInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Pulse the browser tab title when an alert fires in the background
 */
export function startTitleAlert(alertText = '💧 Time to drink water!') {
  if (typeof document === 'undefined') return;
  if (!document.hidden) return; // Only flash title if tab is hidden/backgrounded

  if (titleAlertInterval) clearInterval(titleAlertInterval);

  let toggle = false;
  titleAlertInterval = setInterval(() => {
    if (!document.hidden) {
      stopTitleAlert();
      return;
    }
    document.title = toggle ? alertText : originalDocTitle;
    toggle = !toggle;
  }, 1000);
}

export function stopTitleAlert() {
  if (titleAlertInterval) {
    clearInterval(titleAlertInterval);
    titleAlertInterval = null;
  }
  if (typeof document !== 'undefined') {
    document.title = originalDocTitle;
  }
}

/**
 * Setup Android notification channels and action listeners
 */
export async function initNativeNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.createChannel({
      id: 'aqua-water-reminders',
      name: 'Aqua Water Reminders',
      description: 'Reminders from Aqua to stay hydrated throughout the day',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#0EA5E9',
    });

    // Listen to notification clicks to trigger Aqua reminder
    await LocalNotifications.addListener('localNotificationActionPerformed', () => {
      window.dispatchEvent(new CustomEvent('aqua-reminder-click'));
    });
  } catch (err) {
    console.warn('Failed to initialize native notifications:', err);
  }
}

/**
 * Check current notification permission status across web and native
 */
export async function checkNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'default';
    } catch {
      return 'default';
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }

  return 'unsupported';
}

/**
 * Send a native OS/browser notification with tab focus capability
 */
export async function sendBrowserNotification(
  title = 'Time to drink water! 💧',
  body = 'Aqua is waiting with your water bottle. Take a refreshing sip!'
): Promise<void> {
  // If running in Capacitor native Android/iOS shell, use LocalNotifications plugin
  if (Capacitor.isNativePlatform()) {
    try {
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 2147483647),
            title,
            body,
            channelId: 'aqua-water-reminders',
            schedule: { at: new Date(Date.now() + 100) },
          },
        ],
      });
      return;
    } catch (err) {
      console.warn('Native LocalNotifications schedule failed:', err);
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    startTitleAlert(title);

    interface ExtendedNotificationOptions extends NotificationOptions {
      renotify?: boolean;
    }

    const options: ExtendedNotificationOptions = {
      body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230EA5E9"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
      tag: 'aqua-water-reminder',
      requireInteraction: true,
      renotify: true,
    };

    // Try service worker showNotification first (native focus handling outside app)
    try {
      if ('serviceWorker' in navigator) {
        const reg = swRegistration || (await navigator.serviceWorker.ready);
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, options);
          return;
        }
      }
    } catch {
      // Fall through to window Notification
    }

    // Direct Notification fallback
    try {
      const notif = new Notification(title, options);
      notif.onclick = () => {
        try {
          window.focus();
        } catch {
          // ignore window focus restriction
        }
        window.dispatchEvent(new CustomEvent('aqua-reminder-click'));
        notif.close();
      };
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
}

/**
 * Request notification permission if not yet decided
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted' ? 'granted' : 'denied';
    } catch (err) {
      console.warn('Error requesting native notification permission:', err);
      return 'denied';
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}
