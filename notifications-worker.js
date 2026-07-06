// Merge these routes into your existing Cloudflare Worker.
// Requires:
// - D1 binding name: DB
// - Secret: ADMIN_TOKEN

function json(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
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

export async function notificationsRoutes(request, env, corsHeaders) {
  const url = new URL(request.url);

  // GET /notifications/active
  if (request.method === "GET" && url.pathname === "/notifications/active") {
    const dbRows = await env.DB.prepare(
      `SELECT id, title, message, type, priority, is_active, start_at, end_at, link_url, cta_text
       FROM notifications
       WHERE is_active = 1
       ORDER BY priority DESC, id DESC
       LIMIT 50`
    ).all();

    const now = nowIso();
    const notifications = (dbRows.results || []).filter((n) => inWindow(now, n.start_at, n.end_at));
    return json({ ok: true, notifications }, 200, corsHeaders);
  }

  // GET /admin/notifications
  if (request.method === "GET" && url.pathname === "/admin/notifications") {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401, corsHeaders);
    }
    const dbRows = await env.DB.prepare(
      `SELECT id, title, message, type, priority, is_active, start_at, end_at, link_url, cta_text, created_at, updated_at
       FROM notifications
       ORDER BY id DESC
       LIMIT 200`
    ).all();
    return json({ ok: true, notifications: dbRows.results || [] }, 200, corsHeaders);
  }

  // POST /admin/notifications
  if (request.method === "POST" && url.pathname === "/admin/notifications") {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401, corsHeaders);
    }
    const body = await request.json();
    if (!body.title || !body.message) {
      return json({ ok: false, error: "title and message are required" }, 400, corsHeaders);
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

    return json({ ok: true }, 200, corsHeaders);
  }

  // PATCH /admin/notifications/:id/toggle
  const toggleMatch = url.pathname.match(/^\/admin\/notifications\/(\d+)\/toggle$/);
  if (request.method === "PATCH" && toggleMatch) {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401, corsHeaders);
    }
    const id = Number(toggleMatch[1]);
    const current = await env.DB.prepare(`SELECT is_active FROM notifications WHERE id = ? LIMIT 1`).bind(id).first();
    if (!current) {
      return json({ ok: false, error: "Notification not found" }, 404, corsHeaders);
    }
    const next = current.is_active ? 0 : 1;
    await env.DB.prepare(`UPDATE notifications SET is_active = ?, updated_at = ? WHERE id = ?`).bind(next, nowIso(), id).run();
    return json({ ok: true, is_active: next }, 200, corsHeaders);
  }

  // DELETE /admin/notifications/:id
  const deleteMatch = url.pathname.match(/^\/admin\/notifications\/(\d+)$/);
  if (request.method === "DELETE" && deleteMatch) {
    if (!isAdmin(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401, corsHeaders);
    }
    const id = Number(deleteMatch[1]);
    await env.DB.prepare(`DELETE FROM notifications WHERE id = ?`).bind(id).run();
    return json({ ok: true }, 200, corsHeaders);
  }

  return null;
}
