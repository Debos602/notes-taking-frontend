import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  User,
  HelpCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
};

export const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Tasks", icon: ListTodo, href: "/tasks" },
  { name: "Team", icon: Users, href: "/team" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export type UserMenuItem = {
  name: string;
  icon: LucideIcon;
  action: string;
  variant?: "danger";
};

export const userMenuItems: UserMenuItem[] = [
  { name: "Profile", icon: User, action: "profile" },
  { name: "Help & Support", icon: HelpCircle, action: "help" },
  { name: "Logout", icon: LogOut, action: "logout", variant: "danger" },
];
