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
export type PushDiagnostic = {
  serviceWorker: "PASS" | "FAIL";
  permission: NotificationPermission | "UNAVAILABLE";
  pushManager: "PASS" | "FAIL";
  subscription: "CREATED" | "EXISTING" | "NOT FOUND";
  supabaseSave: "PASS" | "FAIL";
  databaseRecord: "FOUND" | "NOT FOUND";
  role: "ADMIN" | "MISSING";
  vapid: "PASS" | "FAIL";
  delivery: "SENT" | "FAILED";
  adminDeviceCount: number;
};

export function usePushNotifications() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<PushDiagnostic | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    setDiagnostic(null);
    const next: PushDiagnostic = { serviceWorker: "FAIL", permission: "UNAVAILABLE", pushManager: "FAIL", subscription: "NOT FOUND", supabaseSave: "FAIL", databaseRecord: "NOT FOUND", role: "MISSING", vapid: "FAIL", delivery: "FAILED", adminDeviceCount: 0 };
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) throw new Error("Push notifications are not supported by this browser.");
      next.pushManager = "PASS";
      const registration = await registerServiceWorker();
      if (!registration?.active) throw new Error("Service worker registration failed: no active service worker");
      if (!navigator.serviceWorker.controller) {
        await registration.update();
        throw new Error("Service worker is registered but not controlling this page. Reload the CMS once, then tap Enable / Repair Notifications again.");
      }
      next.serviceWorker = "PASS";
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      next.permission = permission;
      if (permission === "denied") throw new Error("Notifications are blocked for this site. Enable notifications in your browser/site settings and try again.");
      if (permission !== "granted") throw new Error(`Notification permission is ${permission}.`);

      const configuredPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
      const { publicKey: serverPublicKey } = await getPushPublicKey();
      const publicKey = configuredPublicKey || serverPublicKey;
      if (!publicKey) throw new Error("Web Push is not configured: VAPID public key is missing.");
      next.vapid = "PASS";

      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      if (!subscription.endpoint || !subscription.options.applicationServerKey) throw new Error("PushManager created an incomplete subscription.");
      next.subscription = existing ? "EXISTING" : "CREATED";
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Sign in again to register this device");
      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const result = await savePushSubscription({ data: { accessToken, subscription: { endpoint: json.endpoint, keys: json.keys }, userAgent: navigator.userAgent } });
      if (!result.saved) throw new Error(`Subscription was created in the browser, but could not be saved to Supabase. Reason: ${"reason" in result ? result.reason : "unknown"}`);
      next.supabaseSave = "PASS";
      next.databaseRecord = "FOUND";
      next.role = result.role === "admin" ? "ADMIN" : "MISSING";
      const testResult = await sendTestPush({ data: { accessToken, endpoint: json.endpoint } });
      if (!testResult.sent || testResult.failed > 0) throw new Error(`Push delivery failed: ${testResult.reason ?? "no successful devices"}`);
      next.databaseRecord = "FOUND";
      next.role = "ADMIN";
      next.adminDeviceCount = testResult.devices ?? 0;
      next.delivery = "SENT";
      setSuccess("Hey Admin! Your Afriframe notification system works!");
      setStatus("on");
      setDiagnostic(next);
    } catch (err) {
      console.error("[push] diagnostic failed", err);
      setDiagnostic(next);
      setError(err instanceof Error ? err.message : "Push diagnostic failed");
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
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) throw new Error("No active PushSubscription found on this device.");
      const result = await sendTestPush({ data: { accessToken, endpoint: subscription.endpoint } });
      if (!result.sent) setError(result.reason ?? "Push delivery failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test notification failed");
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, success, diagnostic, enable, disable, test };
}
