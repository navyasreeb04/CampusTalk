import crypto from "crypto";
import nodemailer from "nodemailer";
import twilio from "twilio";

const OTP_WINDOW_IN_MS = 5 * 60 * 1000;
const OTP_LENGTH = 6;

const getConfiguredClientUrls = () =>
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildMailTransport = () => {
  const smtpService = process.env.SMTP_SERVICE;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if ((!smtpService && !smtpHost) || !smtpUser || !smtpPass) {
    return null;
  }

  if (smtpService) {
    return nodemailer.createTransport({
      service: smtpService,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const buildSmsClient = () => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const getWebOtpHost = (req) => {
  const origin = req.get("origin");

  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch (error) {
      return null;
    }
  }

  for (const clientUrl of getConfiguredClientUrls()) {
    try {
      return new URL(clientUrl).hostname;
    } catch (error) {
      continue;
    }
  }

  return null;
};

const createEmailHtml = (otp, target) => `
  <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#433126;padding:24px;background:#fbf5ee;">
    <div style="max-width:560px;margin:0 auto;background:#fffaf4;border-radius:24px;padding:32px;border:1px solid rgba(79,59,45,0.08);">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#7b8e71;">CampusTalk Security</p>
      <h2 style="margin:0 0 16px;font-size:28px;font-weight:600;color:#4f3b2d;">Reset your password</h2>
      <p style="margin:0 0 18px;">Use this one-time password to continue your password reset for <strong>${target}</strong>.</p>
      <div style="margin:18px 0;padding:20px;border-radius:20px;background:#f4eadf;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#745f4b;">Verification code</p>
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:0.4em;color:#b98050;">${otp}</p>
      </div>
      <p style="margin:0 0 10px;">This code expires in 5 minutes.</p>
      <p style="margin:0;color:#745f4b;">If you did not request this, you can ignore this email safely.</p>
    </div>
  </div>
`;

const mailTransport = buildMailTransport();
const smsClient = buildSmsClient();

export const createOtpRecord = () => {
  const otp = crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();

  return {
    otp,
    hashedOtp: crypto.createHash("sha256").update(otp).digest("hex"),
    otpExpiry: new Date(Date.now() + OTP_WINDOW_IN_MS),
  };
};

export const isOtpMatch = (candidateOtp = "", hashedOtp = "") =>
  crypto.createHash("sha256").update(candidateOtp).digest("hex") === hashedOtp;

export const getOtpMeta = () => ({
  otpLength: OTP_LENGTH,
  expiresInSeconds: OTP_WINDOW_IN_MS / 1000,
  resendInSeconds: 30,
});

export const sendPasswordResetOtp = async ({ channel, target, otp, req }) => {
  if (channel === "email") {
    if (!mailTransport) {
      throw new Error("Email OTP delivery is not configured on the server");
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      process.env.ADMIN_EMAIL ||
      "no-reply@campustalk.app";

    await mailTransport.sendMail({
      from: fromAddress,
      to: target,
      subject: "CampusTalk password reset OTP",
      text: `Your CampusTalk password reset OTP is ${otp}. It expires in 5 minutes.`,
      html: createEmailHtml(otp, target),
    });

    return;
  }

  if (channel === "phone") {
    if (!smsClient) {
      throw new Error("SMS OTP delivery is not configured on the server");
    }

    const webOtpHost = getWebOtpHost(req);
    const webOtpLine = webOtpHost ? `\n@${webOtpHost} #${otp}` : "";

    await smsClient.messages.create({
      body: `CampusTalk verification code: ${otp}. It expires in 5 minutes.${webOtpLine}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: target,
    });
  }
};
