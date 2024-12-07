import { IconLayoutDashboard, IconUsers } from "@tabler/icons-react";

export interface NavLink {
  title: string;
  label?: string;
  href: string;
  icon: JSX.Element;
}

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

export const sidelinks: SideLink[] = [
  {
    title: "sidebar.dashboard",
    label: "",
    href: "/",
    icon: <IconLayoutDashboard size={18} />,
  },
  {
    title: "sidebar.users",
    label: "",
    href: "/users",
    icon: <IconUsers size={18} />,
  },
];
