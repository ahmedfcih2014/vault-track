import { Archive, PiggyBank, Settings, Wallet } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/presentation/lib/utils";

const tabs = [
  { to: "/saving", label: "Saving", icon: PiggyBank },
  { to: "/spending", label: "Spending", icon: Wallet },
  { to: "/archives", label: "Archives", icon: Archive },
] as const;

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-end px-4 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <Link
          to="/settings"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200"
          aria-label="Settings"
          data-testid="settings-link"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-3 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-200",
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
