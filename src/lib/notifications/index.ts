// NotificationProvider abstraction. Stub adapters log intent; real providers
// (Resend/SES email, Twilio SMS, WhatsApp Cloud API) implement the same interface in M4.2.
import { logger } from "@/lib/logger";

export type Channel = "email" | "sms" | "whatsapp";

export interface NotificationMessage {
  channel: Channel;
  to: string;
  subject?: string;
  body: string;
}

export interface NotificationProvider {
  readonly name: string;
  isLive(): boolean;
  send(msg: NotificationMessage): Promise<void>;
}

/** Fallback adapter: logs what would be sent. Used when no provider keys are set. */
class LogProvider implements NotificationProvider {
  readonly name = "log";
  isLive() {
    return false;
  }
  async send(msg: NotificationMessage) {
    logger.info({ channel: msg.channel, to: msg.to, subject: msg.subject }, `notification (stub): ${msg.body}`);
  }
}

/** Resend email adapter (real when RESEND_API_KEY is set). */
class ResendEmail implements NotificationProvider {
  readonly name = "resend";
  isLive() {
    return Boolean(process.env.RESEND_API_KEY);
  }
  async send(msg: NotificationMessage) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ASPORTS ZONE <noreply@asportszone.com>",
        to: msg.to,
        subject: msg.subject ?? "ASPORTS ZONE",
        text: msg.body,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  }
}

/** Twilio SMS adapter (real when TWILIO_* are set). */
class TwilioSms implements NotificationProvider {
  readonly name = "twilio";
  isLive() {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  async send(msg: NotificationMessage) {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const body = new URLSearchParams({ To: msg.to, From: process.env.TWILIO_FROM!, Body: msg.body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) throw new Error(`Twilio ${res.status}`);
  }
}

const log = new LogProvider();
const resend = new ResendEmail();
const twilio = new TwilioSms();

// Pick the real provider per channel when configured; else log.
export function getNotifier(channel: Channel): NotificationProvider {
  if (channel === "email" && resend.isLive()) return resend;
  if (channel === "sms" && twilio.isLive()) return twilio;
  return log;
}

export async function notify(msg: NotificationMessage) {
  try {
    await getNotifier(msg.channel).send(msg);
  } catch (err) {
    logger.error({ err, channel: msg.channel }, "notification failed");
  }
}
