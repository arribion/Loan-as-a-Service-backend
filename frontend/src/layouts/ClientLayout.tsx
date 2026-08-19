import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";
import {
  BanknoteArrowDown,
  Calculator,
  ChevronDown,
  Clock,
  Cog,
  HandCoins,
  LayoutDashboard,
  ReceiptText,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  User,
  CogIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import useAuth from "../hooks/useAuth";

/* --- Types and NAV --- */
type ChildNavItem = { id: string; label: string; to: string };
type NavItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  to?: string;
  children?: ChildNavItem[];
};

const NAV: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    to: "/member/dashboard",
  },
  {
    id: "Loans",
    label: "Loans",
    icon: ReceiptText,
    to: "/member/my-loans",
    children: [
      { id: "apply-loan", label: "Apply Loan", to: "/member/apply-loan" },
      { id: "my-loans", label: "My Loans", to: "/member/my-loans" },
    ],
  },
  {
    id: "loan-calculator",
    label: "Loan calculator",
    icon: Calculator,
    to: "/members/loan-calculator",
  },
  {
    id: "loans",
    label: "Loans",
    icon: HandCoins,
    to: "/admin/loans",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Clock,
    to: "/admin/schedule",
  },
  {
    id: "repayments",
    label: "Repayments",
    icon: BanknoteArrowDown,
    to: "/member/payments",
    children: [
      {
        id: "repay-loan",
        label: "Loan Payments",
        to: "/admin/payments/members",
      },
      {
        id: "payment-settings",
        label: "Payment History",
        to: "/member/payments/settings",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Cog,
    to: "/admin/settings",
  },
];

/* --- Component --- */
export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Sidebar state ---
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    NAV.forEach((item) => {
      if (item.children?.some((child) => location.pathname === child.to)) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleExpanded = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.to && location.pathname === item.to) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.to);
    }
    return false;
  };

  const doLogout = () => {
    logout();
    navigate("/");
  };

  // Toggle desktop collapse or mobile drawer
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed(!collapsed);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  // --- Shared Sidebar Content ---
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav
      className={cn(
        "flex-1 space-y-1",
        collapsed && !isMobile ? "px-2 py-5" : "px-3 py-5",
      )}
      aria-label="Main navigation">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item);
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedParents.has(item.id);

        // --- Leaf node ---
        if (!hasChildren) {
          return (
            <Link
              key={item.id}
              to={item.to!}
              className={cn(
                "group relative flex items-center gap-3 rounded px-4 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-gold text-ink"
                  : "text-cream/65 hover:bg-cream/8 hover:text-cream",
                collapsed && !isMobile ? "justify-center px-2 py-2" : "w-full",
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed && !isMobile ? item.label : undefined}>
              {Icon && (
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    collapsed && !isMobile ? "mx-auto" : "",
                  )}
                />
              )}
              {(!collapsed || isMobile) && (
                <span className="flex-1">{item.label}</span>
              )}

              {/* Tooltip for collapsed desktop */}
              {collapsed && !isMobile && (
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden rounded bg-ink/95 px-2 py-1 text-xs font-medium text-cream group-hover:block">
                  {item.label}
                </span>
              )}
            </Link>
          );
        }

        // --- Parent with children ---
        return (
          <div key={item.id} className="space-y-0.5">
            <button
              onClick={() => {
                toggleExpanded(item.id);
                if (item.to) navigate(item.to);
              }}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded px-4 py-2.5 text-sm font-semibold transition text-left",
                isActive
                  ? "bg-gold text-ink"
                  : "text-cream/65 hover:bg-cream/8 hover:text-cream",
                collapsed && !isMobile ? "justify-center px-2 py-2" : "w-full",
              )}
              aria-expanded={isExpanded}
              aria-current={isActive ? "page" : undefined}
              title={collapsed && !isMobile ? item.label : undefined}>
              {Icon && (
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    collapsed && !isMobile ? "mx-auto" : "",
                  )}
                />
              )}
              {(!collapsed || isMobile) && (
                <span className="flex-1">{item.label}</span>
              )}
              {(!collapsed || isMobile) && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 ml-auto transition-transform duration-200",
                    { "rotate-180": isExpanded },
                  )}
                />
              )}

              {/* Tooltip for collapsed desktop */}
              {collapsed && !isMobile && (
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden rounded bg-ink/95 px-2 py-1 text-xs font-medium text-cream group-hover:block">
                  {item.label}
                </span>
              )}
            </button>

            {/* Children – shown when expanded and not collapsed (or on mobile) */}
            {isExpanded && (!collapsed || isMobile) && (
              <ul className="ml-6 space-y-0.5 border-l border-cream/10 pl-4">
                {item.children!.map((child) => {
                  const childActive = location.pathname === child.to;
                  return (
                    <li key={child.id}>
                      <Link
                        to={child.to}
                        className={cn(
                          "block rounded-lg px-4 py-2 text-sm font-medium transition",
                          childActive
                            ? "bg-gold/20 text-gold"
                            : "text-cream/50 hover:bg-cream/8 hover:text-cream",
                        )}
                        aria-current={childActive ? "page" : undefined}>
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Collapsed desktop: show children as absolute popover */}
            {collapsed && !isMobile && isExpanded && (
              <div className="absolute left-full top-0 z-50 w-48 rounded bg-cream/95 p-2 shadow-lg">
                <ul className="space-y-1">
                  {item.children!.map((child) => {
                    const childActive = location.pathname === child.to;
                    return (
                      <li key={child.id}>
                        <Link
                          to={child.to}
                          className={cn(
                            "block rounded px-3 py-2 text-sm font-medium transition",
                            childActive
                              ? "bg-gold/20 text-gold"
                              : "text-ink/70 hover:bg-cream/8 hover:text-cream",
                          )}>
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  // --- Main JSX ---
  return (
    <>
      <div
        className="min-h-screen bg-frost lg:grid"
        style={{
          gridTemplateColumns: collapsed ? "80px 1fr" : "264px 1fr",
        }}>
        {/* --- Desktop Sidebar --- */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen flex-col border-r border-cream/10 bg-pine text-cream transition-all duration-300 lg:flex",
            collapsed ? "w-20 overflow-x-hidden" : "w-66",
          )}>
          <div className="flex items-center justify-between border-b border-cream/10 px-4 py-4">
            <Link
              to="/member/dashboard"
              className={cn(
                "flex items-center gap-3",
                collapsed ? "justify-center w-full" : "",
              )}>
              {collapsed ? <Logo compact light /> : <Logo light />}
            </Link>

            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((s) => !s)}
              className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded bg-cream/6 text-cream hover:bg-cream/10">
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <SidebarContent isMobile={false} />

          <div
            className={cn(
              "mt-auto border-t border-cream/10 px-4 py-4",
              collapsed ? "text-center" : "",
            )}>
            <div
              className={cn(
                "flex items-center gap-3",
                collapsed ? "justify-center" : "",
              )}>
              {!collapsed && (
                <span className="text-sm text-ink/55">{user?.org}</span>
              )}
              <button
                onClick={doLogout}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-ink/12 px-3 py-2 text-sm font-semibold text-ink/60 transition hover:border-danger/30 hover:text-danger",
                  collapsed ? "px-2 py-2" : "",
                )}
                title={collapsed ? "Log out" : undefined}>
                <LogOut className="h-4 w-4" />
                {!collapsed && "Log out"}
              </button>
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <div className="min-w-0">
          {/* --- Topbar (single header for all screens) --- */}
          <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
              <div className="flex items-center gap-3">
                {/* Hamburger toggle (mobile & desktop) */}
                <button
                  onClick={toggleSidebar}
                  className="rounded-lg p-1.5 text-ink/55 transition hover:bg-ink/5 lg:p-2"
                  aria-label="Toggle sidebar">
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                <div className="lg:hidden">
                  <Link to="/member/dashboard">
                    <Logo compact />
                  </Link>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs text-ink/45">
                    {user?.org || "Member"} · Portal
                  </p>
                  <h1 className="font-display text-lg font-bold capitalize text-ink">
                    {(() => {
                      const path = location.pathname;
                      const found = NAV.find(
                        (item) =>
                          item.to === path ||
                          item.children?.some((c) => c.to === path),
                      );
                      return found ? found.label : "Dashboard";
                    })()}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* User avatar */}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-sm font-bold text-gold">
                  {user?.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2) || "U"}
                </span>

                <div
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="relative min-w-0 flex-1 cursor-pointer">
                  <p className="truncate text-sm font-semibold">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-[11px] text-slate-800/70">
                    {user?.org || "Organization"}
                  </p>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5">
                      <nav>
                        <ul className="py-1">
                          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                            <User className="h-4 w-4" /> Account
                          </li>
                          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                            <CogIcon className="h-4 w-4" /> Settings
                          </li>
                          <li className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                            MFA
                          </li>
                          <li
                            onClick={doLogout}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <LogOut className="h-4 w-4" /> Logout
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>

                {/* Mobile logout button (already included in dropdown, but keep a quick one?) 
                    We'll keep it as secondary for mobile */}
                <button
                  onClick={doLogout}
                  className="rounded-lg border border-ink/10 p-2 text-ink/55 transition hover:border-danger/30 hover:text-danger lg:hidden"
                  title="Log out">
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Mobile quick nav (optional) */}
            <div className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
              {NAV.map((n) => (
                <Link
                  key={n.id}
                  to={n.to || "#"}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition",
                    location.pathname === n.to ||
                      n.children?.some((c) => location.pathname === c.to)
                      ? "bg-pine text-cream"
                      : "bg-ink/5 text-ink/60",
                  )}>
                  {n.icon && <n.icon className="h-3.5 w-3.5" />}
                  {n.label}
                </Link>
              ))}
            </div>
          </header>

          {/* --- Main Content --- */}
          <main className="px-5 py-7 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* --- Mobile Drawer (overlay) --- */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-70 overflow-y-auto border-r border-cream/10 bg-pine text-cream transition-transform duration-300 lg:hidden">
            <div className="flex items-center justify-between border-b border-cream/10 px-4 py-4">
              <Link
                to="/member/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3">
                <Logo light />
                <span className="text-sm font-semibold">Member portal</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded bg-cream/6">
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarContent isMobile={true} />

            <div className="mt-auto border-t border-cream/10 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/55">{user?.org}</span>
                <button
                  onClick={doLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-ink/12 px-3 py-2 text-sm font-semibold text-ink/60">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
