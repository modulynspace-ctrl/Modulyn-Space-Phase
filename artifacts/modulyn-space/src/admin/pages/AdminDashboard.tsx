import React from "react";
import { FolderOpen, TrendingUp, CalendarCheck, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Projects", value: "24", change: "+3 this month", icon: FolderOpen, color: "text-blue-600" },
    { label: "New Leads", value: "18", change: "+5 this week", icon: TrendingUp, color: "text-green-600" },
    { label: "Consultation Bookings", value: "7", change: "+2 today", icon: CalendarCheck, color: "text-primary" },
    { label: "Store Products", value: "42", change: "0 pending review", icon: ShoppingBag, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-border relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <h3 className="text-3xl font-serif mt-2 mb-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`p-3 bg-secondary/50 rounded-md ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Projects</h2>
            <Link href="/admin/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "Lakshmi Villa Interiors", type: "Home Interior", loc: "Bengaluru", status: "Completed", date: "Oct 12", sColor: "bg-green-100 text-green-700" },
              { name: "The Mehta Kitchen", type: "Modular Kitchen", loc: "Mysuru", status: "In Progress", date: "Oct 10", sColor: "bg-amber-100 text-amber-700" },
              { name: "Tech Office Revamp", type: "Commercial", loc: "Bengaluru", status: "Planning", date: "Oct 08", sColor: "bg-blue-100 text-blue-700" },
              { name: "Sharma Residence", type: "Turnkey", loc: "Hubli", status: "Completed", date: "Oct 05", sColor: "bg-green-100 text-green-700" },
            ].map((p, i) => (
              <div key={i} className="p-4 hover:bg-secondary/40 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.type} &bull; {p.loc}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${p.sColor}`}>{p.status}</span>
                  <p className="text-xs text-muted-foreground mt-2">{p.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contact Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Contact Requests</h2>
            <Link href="/admin/contacts" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "Priya Nair", email: "priya@email.com", type: "Home Interior", date: "Today", status: "New", sColor: "bg-primary text-white" },
              { name: "Rajan Sharma", email: "rajan@email.com", type: "Modular Kitchen", date: "Yesterday", status: "Replied", sColor: "bg-secondary text-muted-foreground" },
              { name: "Deepa Rao", email: "deepa@email.com", type: "Commercial", date: "2 days ago", status: "New", sColor: "bg-primary text-white" },
              { name: "Anil Kumar", email: "anil@email.com", type: "Turnkey", date: "3 days ago", status: "Replied", sColor: "bg-secondary text-muted-foreground" },
            ].map((c, i) => (
              <div key={i} className="p-4 hover:bg-secondary/40 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.email} &bull; {c.type}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.sColor}`}>{c.status}</span>
                  <p className="text-xs text-muted-foreground mt-2">{c.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl">Recent Consultation Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Suresh Menon", date: "Oct 15, 2023", time: "10:00 AM", loc: "Bengaluru", status: "Confirmed", sColor: "bg-green-100 text-green-700" },
            { name: "Kavita Reddy", date: "Oct 16, 2023", time: "02:30 PM", loc: "Mysuru", status: "Pending", sColor: "bg-amber-100 text-amber-700" },
            { name: "Arun Patel", date: "Oct 18, 2023", time: "11:00 AM", loc: "Bengaluru", status: "Confirmed", sColor: "bg-green-100 text-green-700" },
          ].map((b, i) => (
            <div key={i} className="border border-border rounded-lg p-4 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">{b.name}</h4>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${b.sColor}`}>{b.status}</span>
              </div>
              <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-primary/70" />
                  {b.date} at {b.time}
                </div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary/70" />
                  {b.loc} Studio
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
