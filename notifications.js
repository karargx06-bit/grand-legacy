(() => {
  const API_BASE = "https://gl-reports-worker0.karargx06.workers.dev";
  const DISMISS_KEY = "gl_dismissed_notifications_v1";

  const style = document.createElement("style");
  style.textContent = `
    .gl-notify-wrap {
      position: fixed;
      top: 70px;
      left: 0;
      width: 100%;
      z-index: 999;
      padding: 0 14px;
      pointer-events: none;
    }
    .gl-notify-bar {
      pointer-events: auto;
      max-width: 1180px;
      margin: 10px auto 0;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(12, 12, 14, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      box-shadow: 0 10px 26px rgba(0,0,0,0.35);
      color: #fff;
    }
    .gl-notify-bar[data-type="urgent"] {
      border-color: rgba(255, 96, 96, 0.55);
      box-shadow: 0 10px 26px rgba(255, 96, 96, 0.15);
    }
    .gl-notify-bar[data-type="maintenance"] {
      border-color: rgba(255, 167, 63, 0.52);
    }
    .gl-notify-bar[data-type="update"] {
      border-color: rgba(66, 153, 225, 0.52);
    }
    .gl-notify-bar[data-type="event"] {
      border-color: rgba(168, 85, 247, 0.52);
    }
    .gl-notify-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      background: rgba(255,255,255,0.07);
      color: #d4af37;
      font-size: 0.92rem;
    }
    .gl-notify-content {
      min-width: 0;
      flex: 1;
    }
    .gl-notify-title {
      font-weight: 800;
      color: #f3d57a;
      font-size: 0.95rem;
      line-height: 1.3;
    }
    .gl-notify-message {
      color: #ddd;
      font-size: 0.9rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .gl-notify-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }
    .gl-notify-btn {
      border: 1px solid rgba(212,175,55,0.42);
      color: #f3d57a;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(212,175,55,0.08);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .gl-notify-close {
      border: none;
      background: rgba(255,255,255,0.1);
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1;
    }
    @media (max-width: 768px) {
      .gl-notify-wrap { top: 70px; padding: 0 8px; }
      .gl-notify-bar { align-items: flex-start; }
      .gl-notify-message { white-space: normal; }
    }
  `;
  document.head.appendChild(style);

  function getDismissed() {
    try {
      return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]");
    } catch (_) {
      return [];
    }
  }

  function setDismissed(ids) {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(ids.slice(-25)));
  }

  function mapIcon(type) {
    if (type === "urgent") return "fa-triangle-exclamation";
    if (type === "maintenance") return "fa-screwdriver-wrench";
    if (type === "update") return "fa-rotate";
    if (type === "event") return "fa-calendar-days";
    return "fa-bullhorn";
  }

  function mountNotification(item) {
    const wrap = document.createElement("div");
    wrap.className = "gl-notify-wrap";

    const bar = document.createElement("div");
    bar.className = "gl-notify-bar";
    bar.dataset.type = item.type || "announcement";

    const icon = document.createElement("div");
    icon.className = "gl-notify-icon";
    icon.innerHTML = `<i class="fas ${mapIcon(item.type)}"></i>`;

    const content = document.createElement("div");
    content.className = "gl-notify-content";
    content.innerHTML = `
      <div class="gl-notify-title">${item.title || "إشعار هام"}</div>
      <div class="gl-notify-message">${item.message || ""}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "gl-notify-actions";

    if (item.link_url) {
      const link = document.createElement("a");
      link.className = "gl-notify-btn";
      link.href = item.link_url;
      link.textContent = item.cta_text || "تفاصيل";
      if (!item.link_url.startsWith("#")) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      actions.appendChild(link);
    }

    const close = document.createElement("button");
    close.className = "gl-notify-close";
    close.setAttribute("aria-label", "إغلاق الإشعار");
    close.textContent = "×";
    close.addEventListener("click", () => {
      const dismissed = getDismissed();
      dismissed.push(item.id);
      setDismissed(dismissed);
      wrap.remove();
    });

    actions.appendChild(close);
    bar.append(icon, content, actions);
    wrap.appendChild(bar);
    document.body.appendChild(wrap);
  }

  async function loadNotifications() {
    try {
      const resp = await fetch(`${API_BASE}/notifications/active`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.ok || !Array.isArray(data.notifications) || !data.notifications.length) return;

      const dismissed = new Set(getDismissed());
      const item = data.notifications.find((n) => !dismissed.has(n.id));
      if (!item) return;
      mountNotification(item);
    } catch (_) {
      // Skip UI failures silently to avoid breaking page
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadNotifications);
  } else {
    loadNotifications();
  }
})();
