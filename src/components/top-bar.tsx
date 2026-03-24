"use client";

import { Bell, Search, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-primary bg-bg-secondary/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search products, sources, logs..."
          className="h-9 w-full rounded-lg border border-border-primary bg-bg-card pl-9 pr-4 text-[0.8rem] font-light text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary/30 transition-colors"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary bg-bg-card text-text-muted hover:bg-bg-card-hover hover:text-text-primary transition-colors">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-primary shadow-[0_0_6px_rgba(217,70,239,0.6)]" />
        </button>

        <button className="flex items-center gap-2.5 rounded-lg border border-border-primary bg-bg-card px-3 py-1.5 hover:bg-bg-card-hover transition-colors">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[0.75rem] font-light text-text-primary">Admin</p>
            <p className="micro-label" style={{ fontSize: "0.55rem" }}>
              admin@store.com
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
