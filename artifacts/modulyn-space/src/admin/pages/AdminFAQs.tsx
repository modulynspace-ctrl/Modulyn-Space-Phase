import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFAQs() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-medium text-foreground mb-2">FAQs</h1>
        <p className="text-muted-foreground">Manage frequently asked questions displayed on the website</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <HelpCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-medium mb-2">No FAQs yet</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          This section is being set up. Data will appear here once connected.
        </p>
        <Button className="bg-primary hover:bg-primary/90 cursor-not-allowed opacity-50" disabled>
          Add FAQ
        </Button>
      </div>
    </div>
  );
}
