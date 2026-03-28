type SendMagicLinkArgs = {
  email: string;
  magicLinkUrl: string;
};

type SendMagicLinkResult =
  | { ok: true }
  | { ok: false; reason: string; devPreviewUrl?: string; acceptancePreviewUrl?: string };

function normalizePreviewEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isAcceptancePreviewAllowed(email: string): boolean {
  const allowlist = (process.env.ACCESS_ACCEPTANCE_PREVIEW_ALLOWLIST ?? "")
    .split(",")
    .map(normalizePreviewEmail)
    .filter(Boolean);

  if (allowlist.length === 0) {
    return false;
  }

  return allowlist.includes(normalizePreviewEmail(email));
}

export async function sendMagicLinkEmail(args: SendMagicLinkArgs): Promise<SendMagicLinkResult> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.ACCESS_EMAIL_FROM?.trim() ?? "";

  if (resendApiKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.email],
        subject: "QARAQUTU access verification",
        html: `<p>Your access link is ready.</p><p><a href=\"${args.magicLinkUrl}\">Verify access</a></p><p>This link expires shortly.</p>`,
      }),
      cache: "no-store",
    });

    if (response.ok) {
      return { ok: true };
    }

    const body = await response.text().catch(() => "");
    return { ok: false, reason: `email_provider_error_${response.status}${body ? "_" + body.slice(0, 80) : ""}` };
  }

  const devMode = (process.env.ACCESS_MAGIC_LINK_DEV_MODE ?? "").toLowerCase() === "true";
  if (devMode && process.env.NODE_ENV !== "production") {
    return { ok: false, reason: "email_provider_not_configured_dev_preview", devPreviewUrl: args.magicLinkUrl };
  }

  const acceptancePreviewEnabled =
    (process.env.ACCESS_ACCEPTANCE_PREVIEW_ENABLED ?? "").toLowerCase() === "true";
  if (acceptancePreviewEnabled && isAcceptancePreviewAllowed(args.email)) {
    return {
      ok: false,
      reason: "email_provider_not_configured_allowlist_preview",
      acceptancePreviewUrl: args.magicLinkUrl,
    };
  }

  return { ok: false, reason: "email_provider_not_configured" };
}
