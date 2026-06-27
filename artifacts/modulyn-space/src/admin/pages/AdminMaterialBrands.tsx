import React from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminMaterialBrands() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-medium text-foreground mb-2">Material Brands</h1>
        <p className="text-muted-foreground">Partner brands featured on the website</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-medium mb-2">No brands yet</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          This section is being set up. Data will appear here once connected.
        </p>
        <Button className="bg-primary hover:bg-primary/90 cursor-not-allowed opacity-50" disabled>
          Add Brand
        </Button>
      </div>
    </div>
  );
}
