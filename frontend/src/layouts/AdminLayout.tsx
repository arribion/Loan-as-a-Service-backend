import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/ui/Toaster";
import { UpgradeModal } from "../components/admin/UpgradeModel";
import { PlanBadge } from "../components/ui/Pills&Badges";
import Logo from "../components/ui/Logo";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Calculator,
  HandCoins,
  Clock,
  BanknoteArrowDown,
  Cog,
  Crown,
  ChevronDown,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  User,
  CogIcon,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

// --- Navigation Definition ---
type ChildNavItem = {
  id: string;
  label: string;
  to: string;
};

type NavItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  to?: string;
  children?: ChildNavItem[];
};

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/admin" },
  {
    id: "members",
    label: "Members",
    icon: Users,
    to: "/admin/members",
    children: [
      { id: "all-members", label: "All Members", to: "/admin/members" },
      { id: "add-member", label: "Add Member", to: "/admin/members/add" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: ReceiptText,
    to: "/admin/products",
    children: [
      { id: "all-products", label: "All Products", to: "/admin/products" },
      { id: "add-product", label: "Add Product", to: "/admin/products/add" },
    ],
  },
  {
    id: "loan-calculator",
    label: "Loan Calculator",
    icon: Calculator,
    to: "/admin/loan-calculator",
  },
  { id: "loans", label: "Loans", icon: HandCoins, to: "/admin/loans" },
  { id: "schedule", label: "Schedule", icon: Clock, to: "/admin/schedule" },
  {
    id: "payments",
    label: "Payments",
    icon: BanknoteArrowDown,
    to: "/admin/payments",
    children: [
      {
        id: "members-payments",
        label: "Members Payments",
        to: "/admin/payments/members",
      },
      {
        id: "payment-settings",
        label: "Payment Settings",
        to: "/admin/payments/settings",
      },
    ],
  },
  {
    id: "sms",
    label: "SMS",
    icon: BanknoteArrowDown,
    to: "/admin/sms-communication",
    children: [
      {
        id: "sms-members",
        label: "Members Payments",
        to: "/admin/payments/members",
      },
      { id: "sms-settings", label: "SMS Settings", to: "/admin/sms/settings" },
    ],
  },
  { id: "settings", label: "Settings", icon: Cog, to: "/admin/settings" },
];

// --- Helper to find a plan by id (assuming planById exists) ---
// (You should import planById from "../data/mock"; I'm keeping it here for completeness)
// For now, I'll define a placeholder if planById is not available.
// If planById is imported, you can remove this.
const planById = (id: string) => {
  const plans = {
    starter: { name: "Starter", memberCap: 10 },
    professional: { name: "Professional", memberCap: 50 },
    enterprise: { name: "Enterprise", memberCap: Infinity },
  };
  return plans[id as keyof typeof plans] || plans.starter;
};

// --- Main Layout Component ---
export function AdminLayout() {
  const location = useLocation();
  const { push } = useToast();
  const { user, memberCap, updatePlan } = useAuth();
  // user might be null; we'll guard later
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // --- Sidebar state ---
  // isCollapsed: controls desktop sidebar width (icon-only or full)
  // isMobileOpen: controls mobile drawer (overlay)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Expanded submenus (for desktop full mode and mobile)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    NAV.forEach((item) => {
      if (item.children?.some((child) => location.pathname === child.to)) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  // Toggle submenu expansion
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Check if a nav item (or its child) is active
  const isItemActive = (item: NavItem): boolean => {
    if (item.to && location.pathname === item.to) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.to);
    }
    return false;
  };

  // For mobile, close drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // --- User data ---
  // Guard against null user
  if (!user) {
    return <div>Loading...</div>; // or redirect
  }

  // Total members (mock: user.memberBase + added members, but added is not used here)
  // We'll assume user has memberBase property; otherwise fallback to 0
  const totalMembers = (user as any)?.memberBase ?? 0;
  const atCap = totalMembers >= memberCap;
  const usagePct =
    memberCap === Infinity
      ? 4
      : Math.min(100, Math.round((totalMembers / memberCap) * 100));

  // Plan details
  const plan = planById(user.plan);

  // --- Handlers ---
  const toggleSidebar = () => {
    // On desktop, toggle collapse; on mobile, toggle drawer
    if (window.innerWidth >= 1024) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const closeMobileDrawer = () => setIsMobileOpen(false);

  // Logout (assuming logout from useAuth)
  const { logout } = useAuth();
  const navigate = useNavigate(); // if you need to redirect
  const doLogout = () => {
    logout();
    navigate("/");
  };

  // --- Render Nav Items (reused for desktop and mobile) ---
  const renderNavItems = (collapsed: boolean, mobile: boolean) => {
    return NAV.map((item) => {
      const Icon = item.icon;
      const isActive = isItemActive(item);
      const hasChildren = Boolean(item.children?.length);
      const isExpandedState = expanded.has(item.id);

      // If collapsed (desktop icon-only), we only show top-level items without children
      // and only the icon (no text, no dropdown)
      if (collapsed && !mobile) {
        // In collapsed mode, we show only top-level items without children? Actually we show all items but only icons.
        // But we need to handle children: we could show a tooltip or not show children at all.
        // For simplicity, we show only the parent icon and no children.
        // We'll render a Link or button that navigates to the parent's "to" if exists, else to first child?
        // We'll just render a simple icon-only link with tooltip (you can add a title attribute).
        if (item.to) {
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex justify-center items-center rounded px-2 py-2.5 transition",
                isActive
                  ? "bg-gold text-ink"
                  : "text-cream/65 hover:bg-cream/8 hover:text-cream",
              )}
              title={item.label}>
              {Icon && <Icon className="h-5 w-5" />}
            </Link>
          );
        } else {
          // If no direct "to", maybe we show nothing or a placeholder
          return null;
        }
      }

      // Full mode (desktop expanded or mobile)
      if (!hasChildren) {
        return (
          <Link
            key={item.id}
            to={item.to!}
            className={cn(
              "flex w-full items-center gap-3 rounded px-4 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-gold text-ink"
                : "text-cream/65 hover:bg-cream/8 hover:text-cream",
            )}
            aria-current={isActive ? "page" : undefined}>
            {Icon && <Icon className="h-4.5 w-4.5" />}
            {!collapsed && item.label}
          </Link>
        );
      }

      // Has children
      return (
        <div key={item.id} className="space-y-0.5">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "flex w-full items-center justify-between rounded px-4 py-2.5 text-sm font-semibold transition text-left",
              isActive
                ? "bg-gold text-ink"
                : "text-cream/65 hover:bg-cream/8 hover:text-cream",
            )}
            aria-expanded={isExpandedState}>
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4.5 w-4.5" />}
              {!collapsed && item.label}
            </div>
            {!collapsed && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-cream/50 transition-transform duration-200",
                  {
                    "rotate-180": isExpandedState,
                    "text-ink/50": isActive,
                  },
                )}
              />
            )}
          </button>

          {isExpandedState && !collapsed && (
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
        </div>
      );
    });
  };

  // --- Render Plan Usage (only in full mode) ---
  const renderPlanUsage = (collapsed: boolean) => {
    if (collapsed) return null; // Hide in collapsed mode
    return (
      <div className="mx-3 mb-3 rounded-xl border border-cream/10 bg-cream/5 p-4">
        <div className="flex items-center justify-between">
          <PlanBadge plan={user.plan} />
          <span className="text-xs text-cream/50">
            {totalMembers}/{memberCap === Infinity ? "∞" : memberCap}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream/10">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              usagePct > 90
                ? "bg-danger"
                : usagePct > 70
                  ? "bg-gold"
                  : "bg-fern",
            )}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-cream/45">
          Members on subscription
        </p>
        {user.plan !== "enterprise" && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gold/15 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-ink"
            aria-label="Upgrade plan">
            <Crown className="h-3.5 w-3.5" /> Upgrade plan
          </button>
        )}
      </div>
    );
  };

  // --- Sidebar content (shared between desktop and mobile) ---
  const SidebarContent = ({
    collapsed,
    mobile,
  }: {
    collapsed: boolean;
    mobile: boolean;
  }) => (
    <>
      <div className="border-b border-cream/10 px-6 py-5">
        {collapsed ? (
          <Link to="/admin" className="flex justify-center">
            <Logo compact light />
          </Link>
        ) : (
          <Link to="/admin">
            <Logo light />
          </Link>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 space-y-1",
          collapsed ? "px-2 py-5" : "px-3 py-5",
        )}
        aria-label="Main navigation">
        {renderNavItems(collapsed, mobile)}
      </nav>

      {renderPlanUsage(collapsed)}
    </>
  );

  // --- Main JSX ---
  return (
    <>
      <div
        className="min-h-screen bg-frost lg:grid"
        style={{ gridTemplateColumns: isCollapsed ? "80px 1fr" : "264px 1fr" }}>
        {/* --- Desktop Sidebar --- */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen flex-col border-r border-cream/10 bg-pine text-cream transition-all duration-300 lg:flex",
            isCollapsed ? "w-20 overflow-x-hidden" : "w-66",
          )}>
          <SidebarContent collapsed={isCollapsed} mobile={false} />
        </aside>

        {/* --- Main Content Area --- */}
        <div className="min-w-0">
          {/* --- Topbar --- */}
          <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
              <div className="flex items-center gap-3">
                {/* Hamburger toggle (mobile & desktop) */}
                <button
                  onClick={toggleSidebar}
                  className="rounded-lg p-1.5 text-ink/55 transition hover:bg-ink/5 lg:p-2"
                  aria-label="Toggle sidebar">
                  {isMobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                <div className="lg:hidden">
                  <Link to="/admin">
                    <Logo compact />
                  </Link>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs text-ink/45">
                    {user.org} · Admin console
                  </p>
                  <h1 className="font-display text-lg font-bold capitalize text-ink">
                    {/* Derive title from current route */}
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
                <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-sm font-bold text-gold">
                  {user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>

                <div
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="relative min-w-0 flex-1 cursor-pointer">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-[11px] text-slate-800/70">
                    {user.org}
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

                {/* Mobile logout button */}
                <button
                  onClick={doLogout}
                  className="rounded-lg border border-ink/10 p-2 text-ink/55 transition hover:border-danger/30 hover:text-danger lg:hidden"
                  title="Log out">
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Mobile quick nav (tabs) - optional, can keep or remove */}
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
            {/* Cap warning */}
            {atCap && (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-warn/35 bg-gold/12 px-4 py-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-warn" />
                <p className="text-sm text-ink/75">
                  You've reached the <strong>{memberCap}-member limit</strong>{" "}
                  on the {plan.name} plan. Upgrade to keep onboarding members.
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="ml-auto rounded-lg bg-pine px-3.5 py-1.5 text-xs font-bold text-cream transition hover:bg-forest">
                  View plans
                </button>
              </div>
            )}

            {/* Upgrade Modal */}
            {showUpgrade && (
              <UpgradeModal
                current={user.plan}
                onClose={() => setShowUpgrade(false)}
                onSelect={(p) => {
                  updatePlan(p);
                  setShowUpgrade(false);
                  push(
                    `Subscription upgraded to ${planById(p).name}. New member limit: ${
                      planById(p).memberCap === Infinity
                        ? "unlimited"
                        : planById(p).memberCap
                    }.`,
                  );
                }}
              />
            )}

            <Outlet />
          </main>
        </div>
      </div>

      {/* --- Mobile Drawer (overlay) --- */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={closeMobileDrawer}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-70 overflow-y-auto border-r border-cream/10 bg-pine text-cream transition-transform duration-300 lg:hidden">
            <SidebarContent collapsed={false} mobile={true} />
          </aside>
        </>
      )}
    </>
  );
}

export default AdminLayout;
