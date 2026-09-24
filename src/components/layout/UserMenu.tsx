import { userMenuItems } from "./layoutData";
import { useAuth } from "../../contexts/useAuth";

interface UserMenuProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function UserMenu({ darkMode, isOpen, onClose }: UserMenuProps) {
  const { logout } = useAuth();
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 origin-top-right animate-scale-in card shadow-lg overflow-hidden" role="menu">
      <div className="p-2">
        {userMenuItems.map((item) => (
          <button
            key={item.action}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              item.variant === "danger"
                ? "text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                : darkMode
                  ? "text-secondary-100 hover:bg-secondary-800"
                  : "text-secondary-700 hover:bg-secondary-100"
            }`}
            role="menuitem"
            onClick={() => {
              if (item.action === "logout") void logout();
              onClose();
            }}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
