"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Database,
  Package,
  Sparkles,
  ShoppingBag,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sources", label: "Data Sources", icon: Database },
  { href: "/products", label: "Products", icon: Package },
  { href: "/content", label: "Content AI", icon: Sparkles },
  { href: "/shopify", label: "Shopify Sync", icon: ShoppingBag },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "relative flex flex-col border-r border-border-primary bg-bg-secondary/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border-primary px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-extralight tracking-tight text-text-primary">
              Kalo<span className="gradient-text font-light">Starter</span>
            </h1>
            <p className="micro-label">Kalo → Shopify</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8rem] font-light transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-accent-primary/15 to-accent-secondary/10 text-accent-primary shadow-[inset_0_0_0_1px_rgba(217,70,239,0.2)]"
                  : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
              )}
            >
              <item.icon
                className={clsx(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-accent-primary"
                    : "text-text-muted group-hover:text-text-secondary"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_6px_rgba(217,70,239,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border-primary bg-bg-secondary/90 backdrop-blur-sm text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Bottom section */}
      <div className="border-t border-border-primary p-4">
        {!collapsed && (
          <div className="rounded-lg bg-gradient-to-br from-accent-primary/10 to-accent-tertiary/10 border border-accent-primary/20 p-3">
            <p className="text-[0.7rem] font-light text-text-primary">
              MVP Build
            </p>
            <p className="mt-1 text-[0.6rem] font-light text-text-muted">
              Mock panel — no live API calls
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
