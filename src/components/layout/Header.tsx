import { Bell, ChevronDown, Menu, Search, User } from "lucide-react";
import { NotificationMenu } from "./NotificationMenu";
import { UserMenu } from "./UserMenu";
import { navItems } from "./layoutData";

interface HeaderProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  notificationOpen: boolean;
  userMenuOpen: boolean;
  isActive: (href: string) => boolean;
  onSidebarToggle: () => void;
  onNotificationToggle: () => void;
  onUserMenuToggle: () => void;
  onCloseMenus: () => void;
}

/**
 * Visual concept: "drafting board" — the header reads like the title
 * block of a blueprint rather than a generic SaaS toolbar. Flat paper
 * / ink surfaces, a hairline rule instead of a blur-shadow, sharp
 * corners, and a single red-pencil accent reserved for things that
 * need a mark: unread notifications and the active/focus state.
 */
export function Header({
  darkMode,
  sidebarOpen,
  notificationOpen,
  userMenuOpen,
  isActive,
  onSidebarToggle,
  onNotificationToggle,
  onUserMenuToggle,
  onCloseMenus,
}: HeaderProps) {
  const paper = darkMode ? "bg-[#1B1023]" : "bg-[#FAF8FB]";
  const ink = darkMode ? "text-[#EEE6F4]" : "text-[#2A1A3D]";
  const inkSoft = darkMode ? "text-[#93839F]" : "text-[#6B5C7A]";
  const line = darkMode ? "border-[#332140]" : "border-[#E0D7E7]";
  const accent = "#7C2AE8";

  return (
    <header
      className={`sticky top-0 z-30 border-b-2 ${line} ${paper} transition-colors`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: menu + title block */}
        <div className="flex items-center gap-4">
          <button
            className={`rounded-sm p-2 transition-colors lg:hidden ${inkSoft} hover:${ink} ${
              darkMode ? "hover:bg-[#2A1938]" : "hover:bg-[#F1E9F5]"
            }`}
            onClick={onSidebarToggle}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className={`hidden border-l-2 pl-4 sm:block ${line}`}>
            <h1 className={`text-lg font-semibold leading-tight tracking-tight ${ink}`}>
              {navItems.find((item) => isActive(item.href))?.name || "Dashboard"}
            </h1>
            <p className={`font-mono text-[11px] leading-tight ${inkSoft}`}>
              project &amp; task portal
            </p>
          </div>
        </div>

        {/* Right: search, notifications, user */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative hidden md:block" data-search>
            <Search
              className={`pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 ${inkSoft}`}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search tasks, projects…"
              className={`w-56 rounded-none border-0 border-b-2 bg-transparent py-1.5 pl-7 pr-12 text-sm outline-none transition-[width,border-color] focus:w-72 ${line} ${ink} placeholder:${inkSoft}`}
              onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              aria-label="Search"
              autoComplete="off"
            />
            <kbd
              className={`absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] lg:inline-flex ${line} ${inkSoft}`}
            >
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="relative" data-notification-menu>
            <button
              className={`relative rounded-sm p-2 transition-colors ${
                notificationOpen
                  ? darkMode
                    ? "bg-[#2A1938]"
                    : "bg-[#F1E9F5]"
                  : `${inkSoft} ${darkMode ? "hover:bg-[#2A1938]" : "hover:bg-[#F1E9F5]"} hover:${ink}`
              }`}
              onClick={onNotificationToggle}
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              aria-haspopup="true"
            >
              <Bell className="h-5 w-5" />
              <span
                className="motion-safe:animate-pulse absolute right-1.5 top-1.5 h-2 w-2 rotate-45"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
            </button>
            <NotificationMenu darkMode={darkMode} isOpen={notificationOpen} />
          </div>

          {/* User menu */}
          <div className="relative" data-user-menu>
            <button
              className={`flex items-center gap-2 rounded-sm py-1 pl-1 pr-2 transition-colors ${
                userMenuOpen
                  ? darkMode
                    ? "bg-[#2A1938]"
                    : "bg-[#F1E9F5]"
                  : darkMode
                    ? "hover:bg-[#2A1938]"
                    : "hover:bg-[#F1E9F5]"
              }`}
              onClick={onUserMenuToggle}
              aria-label="User menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center border-2 ${
                  darkMode ? "border-[#EEE6F4] bg-[#1B1023]" : "border-[#2A1A3D] bg-[#FAF8FB]"
                }`}
              >
                <User className={`h-4 w-4 ${ink}`} />
                <span
                  className="absolute -bottom-1 -right-1 h-2 w-2"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
              </div>
              <div className="hidden min-w-0 text-left md:block">
                <p className={`truncate text-sm font-medium leading-tight ${ink}`}>John Doe</p>
                <p className={`truncate font-mono text-[10px] leading-tight ${inkSoft}`}>admin</p>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 transition-transform md:block ${inkSoft} ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <UserMenu darkMode={darkMode} isOpen={userMenuOpen} onClose={onCloseMenus} />
          </div>
        </div>
      </div>
    </header>
  );
}