import { ChevronDown, User } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import type { NavItem } from "./layoutData";
import { navItems } from "./layoutData";

interface SidebarProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isActive: (href: string) => boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

function SidebarNavItem({
  item,
  active,
  collapsed,
  darkMode,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  darkMode: boolean;
}) {
  const Icon = item.icon;
  const accent = "#7C2AE8";
  const inkSoft = darkMode ? "text-[#93839F]" : "text-[#6B5C7A]";
  const ink = darkMode ? "text-[#EEE6F4]" : "text-[#2A1A3D]";

  return (
    <a
      href={item.href}
      className={`relative group flex items-center gap-3 rounded-sm px-3 py-2 text-[13.5px] leading-none tracking-[-0.01em] transition-colors ${
        active
          ? darkMode
            ? "bg-[#2A1938] font-semibold text-[#EEE6F4]"
            : "bg-[#F1E9F5] font-semibold text-[#2A1A3D]"
          : `font-medium ${inkSoft} hover:${ink} ${darkMode ? "hover:bg-[#2A1938]" : "hover:bg-[#F1E9F5]"}`
      } ${collapsed ? "justify-center px-2" : ""}`}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.name : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.name}</span>}
      {active && !collapsed && (
        <span
          className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
      )}
    </a>
  );
}

export function Sidebar({
  darkMode,
  sidebarOpen,
  sidebarCollapsed,
  isActive,
  onCollapse,
}: SidebarProps) {
  const { user } = useAuth();
  const paper = darkMode ? "bg-[#1B1023]" : "bg-[#FAF8FB]";
  const ink = darkMode ? "text-[#EEE6F4]" : "text-[#2A1A3D]";
  const inkSoft = darkMode ? "text-[#93839F]" : "text-[#6B5C7A]";
  const line = darkMode ? "border-[#332140]" : "border-[#E0D7E7]";
  const accent = "#7C2AE8";

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r-2 transition-all duration-300 ease-in-out ${line} ${paper} ${
        sidebarCollapsed ? "w-16" : "w-64"
      } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      aria-label="Main navigation"
    >
      <div
        className={`flex h-16 items-center border-b-2 transition-colors ${line} ${
          sidebarCollapsed ? "justify-between gap-0 px-2" : "justify-between px-4"
        }`}
      >
        {sidebarCollapsed ? (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center border-2 text-[9px] font-bold leading-none tracking-[-0.02em]"
            style={{ borderColor: accent, color: accent }}
            aria-hidden="true"
          >
            TM
          </span>
        ) : (
          <span
            className="truncate text-[22px] font-bold leading-none tracking-[-0.02em]"
            style={{ color: accent }}
          >
            Task Management
          </span>
        )}

        {/* Desktop collapse/expand toggle — always mounted, never disappears */}
        <button
          className={`hidden rounded-sm p-1 transition-colors lg:flex ${inkSoft} ${
            darkMode ? "hover:bg-[#2A1938]" : "hover:bg-[#F1E9F5]"
          } hover:${ink}`}
          onClick={onCollapse}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 px-2" aria-label="Navigation">
        {navItems.filter((item) => item.href === "/my-posts" ? user?.role === "USER" : ["/users", "/admin/notes"].includes(item.href) ? user?.role === "ADMIN" : true).map((item) => (
          <SidebarNavItem
            key={item.name}
            item={item}
            active={isActive(item.href)}
            collapsed={sidebarCollapsed}
            darkMode={darkMode}
          />
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className={`border-t-2 p-4 transition-colors ${line}`}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center border-2 ${
                darkMode ? "border-[#EEE6F4] bg-[#1B1023]" : "border-[#2A1A3D] bg-[#FAF8FB]"
              }`}
            >
              <User className={`h-4 w-4 ${ink}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold leading-tight tracking-[-0.01em] ${ink}`}>
                {user?.name || "User"}
              </p>
              <p className={`truncate font-mono text-[10.5px] leading-tight tracking-wide ${inkSoft}`}>
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}