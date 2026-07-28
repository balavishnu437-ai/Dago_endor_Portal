import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useVendor } from "@/contexts/VendorContext";
import {
  BarChart3,
  LogOut,
  PanelLeft,
  Package,
  ClipboardList,
  Warehouse,
  DollarSign,
  Settings,
  ShoppingBag,
  MapPin,
  Store,
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: ClipboardList, label: "Orders", path: "/orders" },
  { icon: Package, label: "Products / Menu", path: "/products" },
  { icon: MapPin, label: "Delivery Zones", path: "/delivery-zones" },
  { icon: Warehouse, label: "Inventory", path: "/inventory" },
  { icon: DollarSign, label: "Earnings", path: "/earnings" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 320;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { user, isAuthenticated, isLoading } = useVendor();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] text-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Loading DaGo Vendor Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] text-slate-100 p-4">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full bg-[#12121a] border border-slate-800 rounded-2xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35] shadow-inner">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              DaGo Vendor Portal
            </h1>
            <p className="text-sm text-slate-400">
              Manage your restaurant, grocery catalog, WhatsApp orders, and delivery zones.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="w-full bg-[#ff6b35] hover:bg-[#e05a2b] text-white py-2.5 rounded-xl font-medium shadow-lg shadow-[#ff6b35]/20"
          >
            Sign in as Vendor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, restaurant, store, logout } = useVendor();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  const businessName = (restaurant?.name && restaurant.name !== 'DaGo Express Kitchen')
    ? restaurant.name
    : store?.name
    ? store.name
    : "Bala hotel";

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-slate-800/80 bg-[#0d0d15] text-slate-100"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-slate-800/60 px-3 bg-[#0d0d15]">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#ff6b35] flex items-center justify-center shrink-0 text-white shadow-md shadow-[#ff6b35]/30">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold tracking-tight truncate text-white text-base">
                    DaGo Vendor
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-1 py-3 bg-[#0d0d15]">
            <SidebarMenu className="px-2">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 transition-all duration-150 font-medium rounded-xl px-3 flex items-center gap-3 ${
                        isActive
                          ? "bg-[#ff6b35] text-white font-semibold shadow-md shadow-[#ff6b35]/25"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                      }`}
                    >
                      <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span className="text-[14px]">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-slate-800/60 bg-[#0d0d15]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-slate-800/70 transition-colors w-full text-left focus:outline-none border border-slate-800/50 bg-slate-900/60">
                  <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-[#ff6b35] text-white">
                      {businessName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-none text-white">
                      {businessName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {user?.phoneNumber || "Vendor Account"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#12121a] border-slate-800 text-slate-100">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#ff6b35]/30 transition-colors ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[#0a0a0f] text-slate-100 min-h-screen">
        {isMobile && (
          <div className="flex border-b border-slate-800 h-14 items-center justify-between bg-[#0a0a0f]/95 px-4 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-slate-300" />
              <span className="tracking-tight text-white font-semibold text-sm">
                {activeMenuItem?.label ?? "DaGo Vendor"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
