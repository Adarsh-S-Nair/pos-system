"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const prev = useRef<string | null>(null);
  const dir = useRef<1 | -1>(1);
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/devices") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/items") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/staff");
  useEffect(() => {
    first.current = false;
    prev.current = pathname;
  }, []);

  useEffect(() => {
    if (prev.current) {
      // If navigating back to root, slide right; otherwise slide left
      dir.current = pathname === "/" ? -1 : 1;
    }
    prev.current = pathname;
  }, [pathname]);

  if (isAdminRoute) {
    return (
      <div className="route-transition" suppressHydrationWarning={true as unknown as undefined}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key={pathname}
      initial={first.current ? false : { x: 64 * dir.current }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 560, damping: 40, mass: 0.6 }}
      className="route-transition"
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}


