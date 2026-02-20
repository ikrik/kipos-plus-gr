export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    if (!url.pathname.includes(".")) {
      const indexUrl = new URL("/index.html", url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function handleContactRequest(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.MAIL_FROM) {
    return json({ ok: false, error: "Mail service is not configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400);
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    return json({ ok: false, error: "Invalid name" }, 400);
  }

  if (!isValidEmail(email) || email.length > 320) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }

  if (message.length < 10 || message.length > 5000) {
    return json({ ok: false, error: "Invalid message" }, 400);
  }

  const subject = `Νέα επικοινωνία από ${name}`;
  const text = [
    "Νέα φόρμα επικοινωνίας από το kipos-plus.gr",
    "",
    `Όνομα: ${name}`,
    `Email: ${email}`,
    "",
    "Μήνυμα:",
    message,
  ].join("\n");

  let emailResponse;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject,
        text,
      }),
    });
  } catch (error) {
    console.error("Resend request failed", error);
    return json({ ok: false, error: "Mail provider request failed" }, 502);
  }

  if (!emailResponse.ok) {
    const details = await emailResponse.text();
    console.error("Resend API rejected request", {
      status: emailResponse.status,
      details,
    });
    return json({ ok: false, error: "Failed to send email", details }, 502);
  }

  return json({ ok: true });
}
