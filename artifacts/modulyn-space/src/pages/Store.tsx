import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import sofaImg     from "@assets/product-sofa.png";
import chairImg    from "@assets/product-chair.png";
import wardrobeImg from "@assets/product-wardrobe.png";

import { Product, ProductCategory, CATEGORY_LABELS, formatPriceRange } from "@/lib/productsTypes";
import { fetchPublicProducts } from "@/lib/productsApi";

const FALLBACK_IMAGE: Record<ProductCategory, string> = {
  sofa:      sofaImg,
  dining:    chairImg,
  wardrobe:  wardrobeImg,
  bed:       sofaImg,
  accessory: chairImg,
  other:     wardrobeImg,
};

export default function Store() {
  const { toast } = useToast();
  const [filter,   setFilter]   = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    document.title = "Store | Modulyn Space";
  }, []);

  useEffect(() => {
    fetchPublicProducts().then(({ data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const availableCategories = useMemo<ProductCategory[]>(() => {
    const seen = new Set<ProductCategory>();
    const result: ProductCategory[] = [];
    for (const p of products) {
      if (!seen.has(p.category)) { seen.add(p.category); result.push(p.category); }
    }
    return result;
  }, [products]);

  const filteredProducts = filter === "all"
    ? products
    : products.filter((p) => p.category === filter);

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
          <button
            onClick={() => setFilter("all")}
            className={`text-sm tracking-wide uppercase transition-colors pb-1 border-b-2 ${
              filter === "all"
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm tracking-wide uppercase transition-colors pb-1 border-b-2 ${
                filter === cat
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </section>

      <section className="py-24 bg-background min-h-[60vh]">
        <div className="container mx-auto px-6">

          {loading && (
            <div className="flex items-center justify-center min-h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && (
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
                      src={product.image_url || FALLBACK_IMAGE[product.category]}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl text-foreground">{product.title}</h3>
                    </div>
                    {product.material && (
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">{product.material}</p>
                    )}
                    <p className="text-sm font-medium text-foreground mb-6">
                      {formatPriceRange(product.price_range_min, product.price_range_max)}
                    </p>
                    <div className="mt-auto pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        className="w-full rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                        onClick={() => handleRequestQuote(product.title)}
                      >
                        Request Quote
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              {products.length === 0
                ? "No products available yet."
                : "No products found in this category."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
