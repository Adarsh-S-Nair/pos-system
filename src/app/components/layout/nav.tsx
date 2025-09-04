import { ReactNode } from "react";
import {
  LuLayoutDashboard,
  LuReceipt,
  LuPackage,
  LuTags,
  LuMonitorSmartphone,
  LuUsers,
  LuStore,
} from "react-icons/lu";

export type NavItem = { href: string; label: string; icon?: ReactNode; badge?: string; disabled?: boolean };

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <LuLayoutDashboard className="h-4 w-4" /> },
      { href: "/transactions", label: "Transactions", icon: <LuReceipt className="h-4 w-4" />, disabled: true },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/items", label: "Items", icon: <LuPackage className="h-4 w-4" />, disabled: true },
      { href: "/categories", label: "Categories", icon: <LuTags className="h-4 w-4" />, disabled: true },
    ],
  },
  {
    title: "Devices & Staff",
    items: [
      { href: "/devices", label: "Devices & Lanes", icon: <LuMonitorSmartphone className="h-4 w-4" /> },
      { href: "/staff", label: "Staff & PINs", icon: <LuUsers className="h-4 w-4" />, disabled: true },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/reports/sales", label: "Sales Summary", disabled: true },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings/store", label: "Store Profile", icon: <LuStore className="h-4 w-4" />, disabled: true },
    ],
  },
];


