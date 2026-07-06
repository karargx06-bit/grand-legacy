// Cloudflare Worker merge example for Grand Legacy notifications.
//
// Do not replace your existing reports Worker blindly with this file unless you
// also move your report routes into the marked section below.
//
// Required Cloudflare settings:
// - D1 binding name: DB
// - Secret name: ADMIN_TOKEN
// - Run notifications-d1.sql in your D1 database

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

function isAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return auth === `Bearer ${env.ADMIN_TOKEN}`;
}

function nowIso() {
  return new Date().toISOString();
}

function inWindow(now, startAt, endAt) {
  const nowMs = new Date(now).getTime();
  const startMs = startAt ? new Date(startAt).getTime() : null;
  const endMs = endAt ? new Date(endAt).getTime() : null;

  if (startMs && nowMs < startMs) return false;
  if (endMs && nowMs > endMs) return false;
  return true;
}

async function notificationRoutes(request, env) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/notifications/active") {
    const dbRows = await env.DB.prepare(
      `SELECT id, title, message, type, priority, is_active, start_at, end_at, link_url, cta_text
       FROM notifications
       WHERE is_active = 1
       ORDER BY priority DESC, id DESC
       LIMIT 50`
    ).all();

    const now = nowIso();
    const notifications = (dbRows.results || []).filter((item) => {
      return inWindow(now, item.start_at, item.end_at);
    });

    return json({ ok: true, notifications });
  }

  if (request.method === "GET" && url.pathname === "/admin/notifications") {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const dbRows = await env.DB.prepare(
      `SELECT id, title, message, type, priority, is_active, start_at, end_at, link_url, cta_text, created_at, updated_at
       FROM notifications
       ORDER BY id DESC
       LIMIT 200`
    ).all();

    return json({ ok: true, notifications: dbRows.results || [] });
  }

  if (request.method === "POST" && url.pathname === "/admin/notifications") {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const body = await request.json();
    if (!body.title || !body.message) {
      return json({ ok: false, error: "title and message are required" }, 400);
    }

    const now = nowIso();
    await env.DB.prepare(
      `INSERT INTO notifications
       (title, message, type, priority, is_active, start_at, end_at, link_url, cta_text, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, 'admin', ?, ?)`
    ).bind(
      String(body.title).trim(),
      String(body.message).trim(),
      String(body.type || "announcement").trim(),
      Number(body.priority || 50),
      body.start_at || null,
      body.end_at || null,
      body.link_url || null,
      body.cta_text || null,
      now,
      now
    ).run();

    return json({ ok: true });
  }

  const toggleMatch = url.pathname.match(/^\/admin\/notifications\/(\d+)\/toggle$/);
  if (request.method === "PATCH" && toggleMatch) {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const id = Number(toggleMatch[1]);
    const current = await env.DB.prepare(
      `SELECT is_active FROM notifications WHERE id = ? LIMIT 1`
    ).bind(id).first();

    if (!current) {
      return json({ ok: false, error: "Notification not found" }, 404);
    }

    const next = current.is_active ? 0 : 1;
    await env.DB.prepare(
      `UPDATE notifications SET is_active = ?, updated_at = ? WHERE id = ?`
    ).bind(next, nowIso(), id).run();

    return json({ ok: true, is_active: next });
  }

  const deleteMatch = url.pathname.match(/^\/admin\/notifications\/(\d+)$/);
  if (request.method === "DELETE" && deleteMatch) {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const id = Number(deleteMatch[1]);
    await env.DB.prepare(`DELETE FROM notifications WHERE id = ?`).bind(id).run();
    return json({ ok: true });
  }

  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const notificationResponse = await notificationRoutes(request, env);
    if (notificationResponse) {
      return notificationResponse;
    }

    // Keep your existing report routes here:
    // - POST /report
    // - POST /track
    // - GET /admin/list
    // - POST /admin/update-status

    return json({ ok: false, error: "Not found" }, 404);
  }
};
