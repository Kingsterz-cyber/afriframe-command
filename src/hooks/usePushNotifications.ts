import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import {
  pwaBlocked,
  pwaSupported,
  registerServiceWorker,
  urlBase64ToUint8Array,
} from "@/lib/pwa";
import {
  deletePushSubscription,
  getPushPublicKey,
  savePushSubscription,
  sendTestPush,
} from "@/lib/push.functions";

type Status = "loading" | "unsupported" | "blocked" | "denied" | "off" | "on";

export function usePushNotifications() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!pwaSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (pwaBlocked()) {
        if (!cancelled) setStatus("blocked");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }

      const registration = await registerServiceWorker();
      if (!registration) {
        if (!cancelled) {
          setStatus("off");
          setError("Web Push service worker failed to register.");
        }
        return;
      }
      const existing = await registration.pushManager.getSubscription();
      if (!cancelled) setStatus(existing ? "on" : "off");
    })().catch((err) => {
      if (!cancelled) {
        setStatus("off");
        setError(err instanceof Error ? err.message : "Web Push status check failed");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await registerServiceWorker();
      if (!registration) throw new Error("Web Push service worker failed to register.");

      const configuredPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
      const { publicKey: serverPublicKey } = await getPushPublicKey();
      const publicKey = configuredPublicKey || serverPublicKey;
      if (!publicKey) throw new Error("Web Push VAPID public key is not configured.");

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Sign in again to register this device");

      const json = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const result = await savePushSubscription({
        data: {
          accessToken,
          subscription: { endpoint: json.endpoint, keys: json.keys },
          userAgent: navigator.userAgent,
        },
      });

      if (!result.saved) {
        const reason = "reason" in result ? result.reason : "unknown";
        throw new Error(`PushSubscription could not be saved (${reason}).`);
      }
      setStatus("on");
    } catch (err) {
      console.error("[push] enable failed", err);
      setError(err instanceof Error ? err.message : "Could not enable notifications");
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription({ data: { endpoint: subscription.endpoint } });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch (err) {
      console.error("[push] disable failed", err);
      setError(err instanceof Error ? err.message : "Could not disable notifications");
    } finally {
      setBusy(false);
    }
  }, []);

  const test = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Sign in again to send a test");
      const result = await sendTestPush({ data: { accessToken } });
      if (!result.sent) setError("No devices received the test notification yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test notification failed");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable, test };
}
