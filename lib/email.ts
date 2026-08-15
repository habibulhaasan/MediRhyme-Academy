// Sends email by POSTing to a Google Apps Script web app (see
// apps-script/Code.gs) instead of using an SMTP library directly.
export async function sendApprovalEmail(
  to: string,
  name: string,
  opts?: { subject?: string; extraLine?: string }
) {
  const webhookUrl = process.env.GAS_EMAIL_WEBHOOK_URL;
  const secret = process.env.GAS_EMAIL_SECRET;

  if (!webhookUrl || !secret) {
    throw new Error(
      "Email not configured: set GAS_EMAIL_WEBHOOK_URL and GAS_EMAIL_SECRET in .env.local"
    );
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Medirhyme Academy";
  const subject = opts?.subject || "আপনার পেমেন্ট ভেরিফাই হয়েছে ✅";
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#0f172a;">প্রিয় ${name || "শিক্ষার্থী"},</h2>
      <p style="color:#334155; font-size: 15px; line-height: 1.6;">
        আপনার পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে এবং আপনার নিবন্ধন অনুমোদিত হয়েছে।
        ${opts?.extraLine ? `<br/>${opts.extraLine}` : ""}
      </p>
      <p style="color:#334155; font-size: 15px; line-height: 1.6;">
        শীঘ্রই আপনাকে <b>Google Classroom</b>-এর ইনভাইটেশন পাঠানো হবে।
      </p>
      <p style="color:#94a3b8; font-size: 13px; margin-top: 24px;">— ${siteName}</p>
    </div>
  `;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, to, subject, html }),
    redirect: "follow",
  });

  let data: { success?: boolean; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Apps Script returned a non-JSON response (HTTP ${res.status})`);
  }

  if (!data.success) {
    throw new Error(data.error || "Apps Script email send failed");
  }
}