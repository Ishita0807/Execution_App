'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Thermometer, 
  LayoutDashboard, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  Settings,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import "./globals.css";

const navigationItems = [
  {
    title: "Dashboard",
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: "Zones",
    url: '/zones',
    icon: MapPin,
  },
  {
    title: "Sensors",
    url: '/sensors',
    icon: Radio,
  },
  {
    title: "Readings",
    url: '/readings',
    icon: Activity,
  },
  {
    title: "Logs",
    url: '/logs',
    icon: AlertTriangle,
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
              <SidebarHeader className="border-b border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Thermometer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">ColdStore Monitor</h2>
                    <p className="text-xs text-slate-500 font-medium">Warehouse IoT System</p>
                  </div>
                </div>
              </SidebarHeader>
              
              <SidebarContent className="p-4">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                    Monitoring
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 hover:text-blue-700 transition-all duration-300 rounded-xl mb-2 font-medium ${
                              pathname === item.url
                                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:from-blue-600 hover:to-teal-600'
                                : 'text-slate-600'
                            }`}
                          >
                            <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                    System Status
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-4 py-3 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          System Status
                        </span>
                        <span className="font-semibold text-green-600">Online</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Active Zones</span>
                        <span className="font-semibold text-blue-600">6</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Active Sensors</span>
                        <span className="font-semibold text-blue-600">18</span>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-700 font-semibold text-sm">OP</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">Warehouse Operator</p>
                    <p className="text-xs text-slate-500 truncate">Cold Storage Monitoring</p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                  <h1 className="text-xl font-bold text-slate-900">ColdStore Monitor</h1>
                </div>
              </header>

              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
