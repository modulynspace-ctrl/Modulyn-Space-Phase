import React from "react";
import { useLocation } from "wouter";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  
  const getTitle = () => {
    if (location === "/admin") return "Dashboard";
    const path = location.split("/").pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-lg font-medium hidden md:block">{getTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              3
            </span>
          </button>
          
          <div className="w-px h-6 bg-border mx-1 hidden md:block" />
          
          <button className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
              MS
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
