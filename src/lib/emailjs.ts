import emailjs from '@emailjs/browser';

const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const confirmationTemplateId = import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID;
const cancellationTemplateId = import.meta.env.VITE_EMAILJS_CANCELLATION_TEMPLATE_ID;

if (publicKey) {
  emailjs.init({ publicKey });
}

export type BookingEmailData = {
  clientEmail: string;
  clientName: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  bookingId: string;
};

function formatBookingDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatBookingTime(value: string) {
  const [hours, minutes = '00'] = value.split(':');
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function sendBookingEmail(
  status: 'confirmed' | 'cancelled',
  booking: BookingEmailData,
) {
  if (!publicKey || !serviceId) {
    throw new Error('EmailJS is not configured in the deployed client.');
  }

  const templateId = status === 'confirmed' ? confirmationTemplateId : cancellationTemplateId;
  if (!templateId) {
    throw new Error(`EmailJS ${status} template is not configured.`);
  }

  console.log('[v0] Attempting EmailJS send', {
    serviceId,
    templateId,
    bookingId: booking.bookingId,
    status,
  });

  try {
    const templateParams = {
      to_name: booking.clientName,
      service_name: booking.serviceName,
      booking_date: formatBookingDate(booking.bookingDate),
      booking_time: formatBookingTime(booking.bookingTime),
      booking_id: booking.bookingId,
      to_email: booking.clientEmail,
    };

    console.log('[v0] EmailJS template parameters', {
      ...templateParams,
      to_email: '[redacted]',
    });

    const response = await emailjs.send(serviceId, templateId, templateParams);
    console.log('[v0] EmailJS response', {
      status: response.status,
      text: response.text,
      bookingId: booking.bookingId,
    });
    return response;
  } catch (error) {
    const message =
      typeof error === 'object' && error !== null && 'text' in error
        ? String((error as { text?: unknown }).text)
        : error instanceof Error
          ? error.message
          : String(error);
    console.error('[v0] EmailJS send failed', {
      status,
      bookingId: booking.bookingId,
      error: message,
    });
    throw new Error(message);
  }
}
