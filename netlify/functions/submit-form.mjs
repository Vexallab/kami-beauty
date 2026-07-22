const MAX_FILE_SIZE = 5 * 1024 * 1024;
const TO_EMAIL = "iprokhorov08@gmail.com";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // защита от ботов
  if (form.get("_honey")) {
    return Response.json({ ok: true });
  }

  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const service = String(form.get("service") || "").trim();
  const date = String(form.get("date") || "").trim();
  const comment = String(form.get("comment") || "").trim();

  if (!name || !phone || !service) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const attachments = [];
  const file = form.get("attachment");
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({
      filename: file.name || "reference.jpg",
      content: buffer.toString("base64"),
    });
  }

  const rows = [
    ["Имя", name],
    ["Телефон", phone],
    ["Услуга", service],
    ["Желаемая дата", date || "—"],
    ["Комментарий", comment || "—"],
  ];
  const html = `<table cellpadding="6">${rows
    .map(([label, value]) => `<tr><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kami Beauty <onboarding@resend.dev>",
      to: TO_EMAIL,
      subject: `Новая заявка — ${name}`,
      html,
      attachments,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend error:", await resendResponse.text());
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
};

// экранирование HTML
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export const config = { path: "/api/submit-form" };
