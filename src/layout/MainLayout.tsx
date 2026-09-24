import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const closeAllMenus = useCallback(() => {
    setUserMenuOpen(false);
    setNotificationOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!e.target || typeof e.target === "string") return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setUserMenuOpen(false);
      if (!target.closest("[data-notification-menu]")) setNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    },
    [location.pathname],
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "dark bg-secondary-950 text-secondary-50" : "bg-secondary-50 text-secondary-900"
      }`}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        isActive={isActive}
        onToggle={handleSidebarToggle}
        onCollapse={handleSidebarCollapse}
      />

      <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
          }`}
        >
        <Header
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          notificationOpen={notificationOpen}
          userMenuOpen={userMenuOpen}
          isActive={isActive}
          onSidebarToggle={handleSidebarToggle}
          onNotificationToggle={() => {
            setNotificationOpen((prev) => !prev);
            setUserMenuOpen(false);
          }}
          onUserMenuToggle={() => {
            setUserMenuOpen((prev) => !prev);
            setNotificationOpen(false);
          }}
          onCloseMenus={closeAllMenus}
        />

        <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8" tabIndex={-1}>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;