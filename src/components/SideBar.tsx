import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
  Building2,
  Users,
  Globe,
  Radio,
  Package,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SideBarProps {
  unreadCount: number;
  clientData?: any;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const SideBar: React.FC<SideBarProps> = ({ unreadCount, clientData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user, appRole, isSuperAdmin, isOrgAdmin, isPrimaryOrgAdmin, organizationName } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const activeClass = "flex items-center gap-3.5 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/10 transition-all";
  const inactiveClass = "flex items-center gap-3.5 py-3 px-4 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-xl font-medium transition-all";

  // Build the nav list based on resolved role.
  // Order: dashboard first, role-specific management links, then shared links (alerts/profile/settings).
  const navItems: NavItem[] = [];

  if (isSuperAdmin) {
    navItems.push({ to: 'platform', label: 'Platform Overview', icon: LayoutDashboard });
    navItems.push({ to: 'organizations', label: 'Organizations', icon: Building2 });
    navItems.push({ to: 'clients', label: 'All Clients', icon: Globe });
  } else if (isOrgAdmin) {
    navItems.push({ to: 'org-overview', label: 'Org Overview', icon: LayoutDashboard });
    navItems.push({ to: 'properties', label: 'Properties', icon: Building2 });
    if (isPrimaryOrgAdmin) {
      navItems.push({ to: 'team', label: 'Admin Team', icon: Users });
    }
  } else {
    // plain client
    navItems.push({ to: 'userdash', label: 'Dashboard', icon: LayoutDashboard });
    navItems.push({ to: 'devices', label: 'My Gateway', icon: Radio });
    navItems.push({ to: 'orders', label: 'My Orders', icon: Package });
  }

  // Shared across every role
  navItems.push({ to: 'alerts', label: 'Security Alerts', icon: Bell, badge: unreadCount });
  navItems.push({ to: 'profile', label: 'My Profile', icon: User });
  navItems.push({ to: 'wallet', label: 'Wallet', icon: Banknote });
  navItems.push({ to: 'settings', label: 'Preferences', icon: Settings });

  const roleLabel = isSuperAdmin
    ? 'Super Admin'
    : appRole === 'org_admin'
    ? 'Org Admin'
    : appRole === 'sub_admin'
    ? 'Sub Admin'
    : 'Client';

  return (
    <div className="relative">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white">SNOS</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-900/60 transition-transform duration-300 p-6 flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="space-y-8">
          {/* Top Branding (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/15">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                SNOS Console
              </span>
            </div>

            {/* Mobile close button inside the sidebar drawer */}
            <button onClick={toggleSidebar} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role / org context strip */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{roleLabel}</span>
            {organizationName && (
              <>
                <span className="text-slate-300 dark:text-slate-700">&middot;</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{organizationName}</span>
              </>
            )}
          </div>

          <div className="flex justify-between items-center md:hidden pb-4 border-b border-slate-100 dark:border-slate-900">
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Navigation Menu</span>
            <button onClick={toggleSidebar} className="text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `${isActive ? activeClass : inactiveClass} relative`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {!!badge && badge > 0 && (
                  <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 px-1.5 flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions of Sidebar */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-900">
          {/* User profile capsule */}
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-900">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              {clientData?.name ? clientData.name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'C')}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{clientData?.name || user?.name || 'Client User'}</h4>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.user_id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors flex items-center justify-center"
              title="Logout Session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
