import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.svg';
import { toast } from 'sonner';

interface AppSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/meal-plans', label: 'Meal Plans', icon: UtensilsCrossed },
  { path: '/recipes', label: 'Recipes', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggle,
  onMobileClose
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    onMobileClose();
  }, [location.pathname, onMobileClose]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          // Desktop behavior
          "hidden lg:flex",
          isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        )}
      >
        {/* Header with Logo and Toggle */}
        <div className="flex items-center justify-between p-4 h-16">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center transition-opacity hover:opacity-80",
              isCollapsed && "justify-center"
            )}
          >
            <img
              src={logo}
              alt="Meal Planner"
              className={cn("transition-all", isCollapsed ? "h-8" : "h-10")}
            />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "sidebar-nav-item sidebar-nav-item-hover",
                  active && "sidebar-nav-item-active",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-[hsl(var(--brand-gray))]" : "text-muted-foreground")} />
                {!isCollapsed && (
                  <span className={active ? "text-[hsl(var(--brand-gray))]" : "text-sidebar-foreground"}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Administrator
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                isCollapsed && "mt-2"
              )}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with Logo and Close */}
        <div className="flex items-center justify-between p-4 h-16">
          <Link
            to="/dashboard"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <img
              src={logo}
              alt="Meal Planner"
              className="h-10"
            />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "sidebar-nav-item sidebar-nav-item-hover",
                  active && "sidebar-nav-item-active"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-[hsl(var(--brand-gray))]" : "text-muted-foreground")} />
                <span className={active ? "text-[hsl(var(--brand-gray))]" : "text-sidebar-foreground"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground">
                Administrator
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
