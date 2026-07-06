# Notifications Setup (Cloudflare)

## 1) Create D1 table
Open D1 Console and run SQL from:

- `notifications-d1.sql`

## 2) Worker requirements

- D1 binding name: `DB`
- Secret: `ADMIN_TOKEN`

If your worker already has report routes, merge notification routes from:

- `notifications-worker.js`

Expose these endpoints:

- `GET /notifications/active`
- `GET /admin/notifications`
- `POST /admin/notifications`
- `PATCH /admin/notifications/:id/toggle`
- `DELETE /admin/notifications/:id`

If the admin page says `Not found`, the deployed Worker does not have the
notification routes yet. Add the notification routes before the Worker's final
404 response, or use `notifications-worker-merge-example.js` as the merge guide.

Your CORS response must include:

- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`

## 3) Frontend pages already wired

The following pages now load `notifications.js`:

- `index.html`
- `companies.html`
- `player-guide.html`
- `reports.html`
- `track-report.html`
- `admin-reports.html`

The admin UI for notifications:

- `admin-notifications.html`

## 4) Optional hardening

- Replace `Access-Control-Allow-Origin: *` with your real domain.
- Add rate limit in Worker admin endpoints.
- Use a strong `ADMIN_TOKEN`.
