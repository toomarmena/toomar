/**
 * Points Supabase Auth at Resend's SMTP and installs Arabic email templates.
 * Runs in the workflow once RESEND_API_KEY exists. Also sets the site URL and
 * redirect allow-list, and turns email confirmation back on.
 */
const { SUPABASE_ACCESS_TOKEN, PROJECT_ID, RESEND_API_KEY, SITE_URL = "https://toomar.vercel.app" } = process.env;
if (!SUPABASE_ACCESS_TOKEN || !PROJECT_ID || !RESEND_API_KEY) {
  console.error("missing SUPABASE_ACCESS_TOKEN, PROJECT_ID or RESEND_API_KEY");
  process.exit(1);
}

const wrap = (title, body, cta) => `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#ffffff;color:#111111;font-family:'IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:40px 24px">
  <div style="font-size:28px;font-weight:500;margin-bottom:24px">طومار</div>
  <h1 style="font-size:20px;font-weight:500;margin:0 0 12px">${title}</h1>
  <p style="font-size:15px;line-height:1.8;color:#55555c;margin:0 0 24px">${body}</p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:15px">${cta}</a>
  <p style="font-size:12px;color:#7a7a82;margin-top:32px">إن لم تطلب هذه الرسالة فتجاهلها.</p>
</div></body></html>`;

const body = {
  site_url: SITE_URL,
  uri_allow_list: `${SITE_URL}/**,https://*-toomar.vercel.app/**,http://localhost:3000/**,http://localhost:3210/**`,
  external_email_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: "no-reply@toomar.app",
  smtp_sender_name: "طومار",
  smtp_host: "smtp.resend.com",
  smtp_port: "465",
  smtp_user: "resend",
  smtp_pass: RESEND_API_KEY,
  smtp_max_frequency: 30,
  mailer_subjects_confirmation: "تأكيد حسابك في طومار",
  mailer_templates_confirmation_content: wrap("مرحباً بك في طومار", "اضغط الزر لتأكيد بريدك وتفعيل حسابك.", "تأكيد الحساب"),
  mailer_subjects_recovery: "تعيين كلمة مرور جديدة",
  mailer_templates_recovery_content: wrap("كلمة مرور جديدة", "اضغط الزر لاختيار كلمة مرور جديدة لحسابك.", "تعيين كلمة المرور"),
  mailer_subjects_magic_link: "رابط الدخول إلى طومار",
  mailer_templates_magic_link_content: wrap("الدخول إلى طومار", "اضغط الزر للدخول إلى حسابك.", "الدخول"),
  mailer_subjects_email_change: "تأكيد البريد الجديد",
  mailer_templates_email_change_content: wrap("بريد جديد", "اضغط الزر لتأكيد بريدك الجديد.", "تأكيد البريد"),
};

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
console.log("auth mail configured");
