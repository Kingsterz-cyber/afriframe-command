import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Mail,
  RefreshCw,
  Send,
  Smartphone,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  getNotificationDiagnostics,
  testNotificationEmail,
  testNotificationPush,
} from "@/lib/notifications.functions";

type Diagnostics = Awaited<ReturnType<typeof getNotificationDiagnostics>>;

function StatusCard({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-xs font-semibold ${pass ? "text-emerald-400" : "text-rose-400"}`}
      >
        {pass ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
        {pass ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}

export function Diagnostics() {
  const { session } = useAuth();
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"email" | "push" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const token = session?.access_token;

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setData(await getNotificationDiagnostics({ data: { accessToken: token } }));
    } catch (error) {
      setMessage(String(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runEmail = async () => {
    if (!token) return;
    setBusy("email");
    setMessage(null);
    try {
      const result = await testNotificationEmail({ data: { accessToken: token } });
      setMessage(
        result.sent
          ? `Test email sent to ${result.recipient}.`
          : `Email failed: ${result.error ?? result.reason}`,
      );
    } catch (error) {
      setMessage(`Email failed: ${String(error)}`);
    } finally {
      setBusy(null);
    }
  };

  const runPush = async () => {
    if (!token) return;
    setBusy("push");
    setMessage(null);
    try {
      const result = await testNotificationPush({ data: { accessToken: token } });
      setMessage(
        result.reason
          ? `Push result: ${result.reason}.`
          : `Push delivered: ${result.sent} sent, ${result.failed} failed.`,
      );
      await refresh();
    } catch (error) {
      setMessage(`Push failed: ${String(error)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-5 py-8 text-white md:px-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4AF37]">
                Temporary admin surface
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Infrastructure diagnostics
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Verify production email and Web Push before testing real bookings.
              </p>
            </div>
            <button
              aria-label="Refresh diagnostics"
              onClick={() => void refresh()}
              className="rounded-xl border border-white/10 p-2.5 text-white/55 hover:bg-white/[0.06]"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </header>
          <section className="grid gap-3 sm:grid-cols-2">
            <StatusCard label="Supabase" pass={Boolean(data?.status?.supabase)} />
            <StatusCard label="Resend" pass={Boolean(data?.status?.resend)} />
            <StatusCard label="VAPID" pass={Boolean(data?.status?.vapid)} />
            <StatusCard label="Push dispatch URL" pass={Boolean(data?.status?.dispatchUrl)} />
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Activity size={16} />
                <span className="text-xs uppercase tracking-wider">Authenticated admin</span>
              </div>
              <p className="mt-3 break-all text-sm text-white/80">
                {data?.adminEmail ?? "Loading…"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Smartphone size={16} />
                <span className="text-xs uppercase tracking-wider">Push subscriptions</span>
              </div>
              <p className="mt-3 text-2xl font-semibold">
                {data?.devices ?? "—"}{" "}
                <span className="text-sm font-normal text-white/40">admin devices</span>
              </p>
            </div>
          </section>
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void runEmail()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                <Mail size={16} />
                {busy === "email" ? "Sending…" : "Test Email"}
              </button>
              <button
                onClick={() => void runPush()}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.06] disabled:opacity-50"
              >
                <Send size={16} />
                {busy === "push" ? "Sending…" : "Test Push"}
              </button>
            </div>
            {message && (
              <p role="status" className="mt-4 break-words text-sm leading-6 text-white/65">
                {message}
              </p>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
