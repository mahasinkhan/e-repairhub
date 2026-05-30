import twilio from "twilio";

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

function getVerifySid(): string {
  const sid = process.env.TWILIO_VERIFY_SID;
  if (!sid) throw new Error("TWILIO_VERIFY_SID not configured in .env");
  return sid;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  // 11 digits starting with 0 → strip 0, add +91 (e.g. 08597495156 → +918597495156)
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  // 10 digits → add +91
  if (digits.length === 10) return `+91${digits}`;
  // 12 digits starting with 91 → add +
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  // Already has + prefix
  if (phone.startsWith("+")) return phone;

  return `+${digits}`;
}

// ── Send OTP via Twilio Verify ────────────────────────────────────────────────
export async function sendOtp(phone: string): Promise<{ message: string; expiresIn: number }> {
  const normalized = normalizePhone(phone);

  try {
    const verification = await getClient().verify.v2
      .services(getVerifySid())
      .verifications.create({
        to:      normalized,
        channel: "sms",
      });

    console.log(`[otp] Twilio Verify sent to ${normalized} — status: ${verification.status}`);

    return {
      message:   `OTP sent to ${phone.slice(0, 4)}****${phone.slice(-2)}`,
      expiresIn: 600,
    };
  } catch (e: any) {
    console.error("[otp] sendOtp error:", e?.message, e?.code);
    // Friendly error messages
    if (e?.code === 60200) throw new Error("Invalid phone number format.");
    if (e?.code === 60203) throw new Error("Max send attempts reached. Try again later.");
    if (e?.code === 60410) throw new Error("SMS is not supported for this number.");
    throw new Error(e?.message || "Failed to send OTP. Please try again.");
  }
}

// ── Verify OTP via Twilio Verify ──────────────────────────────────────────────
export async function verifyOtp(phone: string, otp: string): Promise<{ valid: boolean; message: string }> {
  const normalized = normalizePhone(phone);

  try {
    const check = await getClient().verify.v2
      .services(getVerifySid())
      .verificationChecks.create({
        to:   normalized,
        code: otp.trim(),
      });

    console.log(`[otp] Twilio Verify check for ${normalized} — status: ${check.status}`);

    if (check.status === "approved") {
      return { valid: true, message: "OTP verified successfully" };
    }

    // pending means wrong code
    return { valid: false, message: "Incorrect OTP. Please try again." };
  } catch (e: any) {
    console.error("[otp] verifyOtp error:", e?.message, e?.code);
    // 404 / 20404 = OTP expired or already used
    if (e?.status === 404 || e?.code === 20404 || e?.code === 60200) {
      return { valid: false, message: "OTP expired or not found. Request a new one." };
    }
    if (e?.code === 60202) {
      return { valid: false, message: "Max check attempts reached. Request a new OTP." };
    }
    throw new Error(e?.message || "OTP verification failed.");
  }
}