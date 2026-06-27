import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import sofaImg from "@assets/product-sofa.png";
import chairImg from "@assets/product-chair.png";
import wardrobeImg from "@assets/product-wardrobe.png";

const products = [
  { id: 1, name: "The Alabaster Sofa", category: "Sofas", material: "Italian Leather", price: "₹1,20,000 - ₹1,80,000", image: sofaImg },
  { id: 2, name: "Modulyn Accent Chair", category: "Dining", material: "Teak Wood & Linen", price: "₹25,000 - ₹35,000", image: chairImg },
  { id: 3, name: "Walk-in Wardrobe System", category: "Wardrobes", material: "Veneer & Tinted Glass", price: "Custom Quote", image: wardrobeImg },
  { id: 4, name: "Lounge Sofa L-Shape", category: "Sofas", material: "Premium Boucle", price: "₹1,50,000 - ₹2,10,000", image: sofaImg },
  { id: 5, name: "Minimalist Dining Chair", category: "Dining", material: "Oak Wood", price: "₹18,000 - ₹24,000", image: chairImg },
  { id: 6, name: "Sliding Door Wardrobe", category: "Wardrobes", material: "Matte Lacquer & Brass", price: "Custom Quote", image: wardrobeImg },
];

const categories = ["All", "Sofas", "Dining", "Wardrobes", "Beds", "Accessories"];

export default function Store() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    document.title = "Store | Modulyn Space";
  }, []);

  const filteredProducts = filter === "All" ? products : products.filter(p => p.category === filter);

  const handleRequestQuote = (name: string) => {
    toast({
      title: "Quote Requested",
      description: `We'll send you pricing details for ${name} shortly.`,
    });
  };

  return (
    <div className="w-full pt-20">
      <section className="py-20 md:py-32 bg-secondary text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-primary font-semibold tracking-widest text-sm uppercase mb-4">Catalogue</h4>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-foreground">The Modulyn Store.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated luxury furniture pieces designed and manufactured in-house.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-background sticky top-20 z-40">
        <div className="container mx-auto px-6 flex items-center justify-center flex-wrap gap-4 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm tracking-wide uppercase transition-colors pb-1 border-b-2 ${
                filter === cat ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-24 bg-background min-h-[60vh]">
        <div className="container mx-auto px-6">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={product.id}
                className="group flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary mb-6">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl text-foreground">{product.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">{product.material}</p>
                  <p className="text-sm font-medium text-foreground mb-6">{product.price}</p>
                  
                  <div className="mt-auto pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                      onClick={() => handleRequestQuote(product.name)}
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No products found in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
