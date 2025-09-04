"use client";

import SidebarContent from "./SidebarContent";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-[var(--color-bg)]">
      <SidebarContent />
    </aside>
  );
}


