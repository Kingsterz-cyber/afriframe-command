// Server-only helpers for Afriframe Studio notifications.
// Uses the studio's own Supabase project with the service-role key (RLS bypassed)
// and Resend for outbound email. Never import this from client code.
import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string, ...fallbacks: string[]) {
  for (const key of [name, ...fallbacks]) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  throw new Error(`${name} is not configured.`);
}

export function studioAdmin() {
  const url = requiredEnv('AFRIFRAME_SUPABASE_URL', 'SUPABASE_URL');
  const key = requiredEnv('AFRIFRAME_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export interface BookingDetails {
  id: string;
  booking_date: string;
  booking_time: string | null;
  status: string;
  message: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  service_name: string;
}

export async function loadBooking(bookingId: string): Promise<BookingDetails | null> {
  const db = studioAdmin();
  const { data, error } = await db
    .from('bookings')
    .select(
      'id, booking_date, booking_time, status, message, clients(full_name, email, phone), services(name)',
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, any>;
  const client = Array.isArray(row['clients']) ? row['clients'][0] : row['clients'];
  const service = Array.isArray(row['services']) ? row['services'][0] : row['services'];

  return {
    id: row['id'],
    booking_date: row['booking_date'],
    booking_time: row['booking_time'] ?? null,
    status: row['status'],
    message: row['message'] ?? null,
    client_name: client?.full_name ?? 'there',
    client_email: client?.email ?? null,
    client_phone: client?.phone ?? null,
    service_name: service?.name ?? 'your session',
  };
}

export async function loadSettings() {
  const db = studioAdmin();
  const { data } = await db.from('studio_settings').select('*').eq('id', 1).maybeSingle();
  return (data ?? {}) as { admin_email?: string | null; admin_whatsapp?: string | null };
}

const FROM = process.env['AFRIFRAME_EMAIL_FROM']?.trim() ?? 'Afriframe Studio <onboarding@resend.dev>';

export function notificationConfigStatus() {
  return {
    supabase: Boolean(process.env['AFRIFRAME_SUPABASE_URL'] || process.env['SUPABASE_URL']),
    serviceRole: Boolean(process.env['AFRIFRAME_SERVICE_ROLE_KEY'] || process.env['SUPABASE_SERVICE_ROLE_KEY']),
    resend: Boolean(process.env['RESEND_API_KEY']),
    vapidPublic: Boolean(process.env['VAPID_PUBLIC_KEY']),
    vapidPrivate: Boolean(process.env['VAPID_PRIVATE_KEY']),
    vapidSubject: Boolean(process.env['VAPID_SUBJECT']),
  };
}

export function notificationConfig() {
  const status = notificationConfigStatus();
  return {
    supabase: requiredEnv('AFRIFRAME_SUPABASE_URL', 'SUPABASE_URL'),
    serviceRole: requiredEnv('AFRIFRAME_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
    resend: requiredEnv('RESEND_API_KEY'),
    vapidPublic: requiredEnv('VAPID_PUBLIC_KEY'),
    vapidPrivate: requiredEnv('VAPID_PRIVATE_KEY'),
    vapidSubject: requiredEnv('VAPID_SUBJECT'),
    from: FROM,
    ...status,
  };
}

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = notificationConfig().resend;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend request failed [${res.status}]: ${body}`);
  }
  return (await res.json()) as { id?: string };
}

const GOLD = '#D4AF37';

export function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:0 auto;padding:32px 28px">
    <div style="letter-spacing:.28em;font-size:11px;text-transform:uppercase;color:${GOLD}">Afriframe Studio</div>
    <h1 style="font-size:24px;margin:14px 0 18px;font-weight:600">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
    <p style="font-size:12px;color:#888;margin:0">Afriframe Studio — capturing your story.</p>
  </div></body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 16px 6px 0;color:#777;font-size:13px">${label}</td>
  <td style="padding:6px 0;font-size:14px;font-weight:600">${value}</td></tr>`;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function confirmationHtml(b: BookingDetails) {
  const when = `${esc(b.booking_date)}${b.booking_time ? ` at ${esc(b.booking_time.slice(0, 5))}` : ''}`;
  return shell(
    `Your booking is confirmed, ${esc(b.client_name)}`,
    `<p style="font-size:15px;line-height:1.6;color:#333">We're delighted to confirm your session with Afriframe Studio.</p>
     <table style="margin:18px 0">${row('Session', esc(b.service_name))}${row('Date', when)}</table>
     <p style="font-size:14px;line-height:1.6;color:#333">If anything changes, simply reply to this email and we'll take care of it.</p>`,
  );
}

export function cancellationHtml(b: BookingDetails) {
  const when = `${esc(b.booking_date)}${b.booking_time ? ` at ${esc(b.booking_time.slice(0, 5))}` : ''}`;
  return shell(
    `Your booking has been cancelled, ${esc(b.client_name)}`,
    `<p style="font-size:15px;line-height:1.6;color:#333">Your Afriframe Studio session is no longer scheduled.</p><table style="margin:18px 0">${row('Session', esc(b.service_name))}${row('Date', when)}</table><p style="font-size:14px;line-height:1.6;color:#333">Reply to this email if you need help with a new date.</p>`,
  );
}

export function adminAlertHtml(b: BookingDetails) {
  const when = `${esc(b.booking_date)}${b.booking_time ? ` at ${esc(b.booking_time.slice(0, 5))}` : ''}`;
  return shell(
    'New booking request',
    `<table style="margin:8px 0">
      ${row('Client', esc(b.client_name))}
      ${row('Email', esc(b.client_email ?? '—'))}
      ${row('Phone', esc(b.client_phone ?? '—'))}
      ${row('Session', esc(b.service_name))}
      ${row('Date', when)}
      ${row('Status', esc(b.status))}
     </table>
     ${b.message ? `<p style="font-size:14px;color:#333">“${esc(b.message)}”</p>` : ''}`,
  );
}

export function whatsappLink(number: string, b: BookingDetails) {
  const digits = number.replace(/[^\d]/g, '');
  const text = `New booking — ${b.client_name} · ${b.service_name} · ${b.booking_date}${
    b.booking_time ? ` ${b.booking_time.slice(0, 5)}` : ''
  }`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
