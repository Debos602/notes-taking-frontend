interface NotificationMenuProps {
  darkMode: boolean;
  isOpen: boolean;
}

const notifications = [
  { title: "Task assigned", desc: "You were assigned to 'Design System'", time: "2m ago", unread: true },
  { title: "Comment added", desc: "Sarah commented on 'API Integration'", time: "1h ago", unread: true },
  { title: "Deadline approaching", desc: "Project 'Mobile App' due tomorrow", time: "3h ago", unread: false },
];

export function NotificationMenu({ darkMode, isOpen }: NotificationMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-80 origin-top-right animate-scale-in card shadow-lg overflow-hidden"
      role="menu"
    >
      <div className={`border-b p-4 ${darkMode ? "border-secondary-800" : "border-secondary-200"}`}>
        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Notifications</h3>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">3 new notifications</p>
      </div>
      <div className="max-h-64 overflow-y-auto scrollbar-thin">
        {notifications.map((notif, index) => (
          <button
            key={`${notif.title}-${index}`}
            className={`w-full border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 ${
              notif.unread ? "bg-primary-50/50 dark:bg-primary-900/20" : ""
            }`}
            role="menuitem"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                  notif.unread ? "bg-primary-500" : "bg-transparent"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium text-secondary-900 dark:text-secondary-100 ${
                    notif.unread ? "font-semibold" : ""
                  }`}
                >
                  {notif.title}
                </p>
                <p className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">{notif.desc}</p>
                <p className="mt-1 text-[10px] text-secondary-400 dark:text-secondary-500">{notif.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div
        className="border-t p-3"
        style={{ borderColor: darkMode ? "var(--color-secondary-800)" : "var(--color-secondary-200)" }}
      >
        <a
          href="/notifications"
          className="block text-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          View all notifications
        </a>
      </div>
    </div>
  );
}
