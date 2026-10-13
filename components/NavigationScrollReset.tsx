"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavigationScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.getElementById("page-scroll-pane")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
