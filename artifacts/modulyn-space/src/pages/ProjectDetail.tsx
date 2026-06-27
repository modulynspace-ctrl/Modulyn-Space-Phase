import React, { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import project5 from "@assets/hero-living-room.png";
import project1 from "@assets/project-bedroom.png";
import project2 from "@assets/project-kitchen.png";
import project3 from "@assets/project-office.png";
import project4 from "@assets/project-dining.png";

export default function ProjectDetail() {
  const { id } = useParams();

  useEffect(() => {
    document.title = `Project Details | Modulyn Space`;
    window.scrollTo(0, 0);
  }, [id]);

  // Mock data for any ID
  const project = {
    title: "The Artisan Villa",
    location: "Sadashivanagar, Bengaluru",
    description: "A masterclass in modern luxury. This 6,500 sq ft villa was designed to reflect the client's love for art and minimalist aesthetics. We employed a muted palette of warm greys, rich walnut wood, and imported Italian statuario marble. Large floor-to-ceiling windows were incorporated to bring in natural light, making the spaces feel expansive and airy.",
    details: {
      Client: "Private Residential",
      Area: "6,500 sq.ft",
      Duration: "6 Months",
      Budget: "Premium",
      Materials: "Italian Marble, Walnut Veneer, Brass Accents, Linen"
    },
    heroImage: project5,
    gallery: [project1, project2, project4]
  };

  return (
    <div className="w-full pt-20">
      <div className="container mx-auto px-6 py-8">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
          <ChevronLeft size={16} className="mr-2" /> Back to Projects
        </Link>
      </div>

      {/* Hero Image */}
      <section className="w-full h-[60vh] md:h-[80vh] relative">
        <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" />
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-serif text-4xl md:text-6xl mb-6">{project.title}</h1>
                <p className="text-xl text-muted-foreground font-light leading-relaxed mb-16">
                  {project.description}
                </p>

                {/* Before / After Placeholder */}
                <div className="mb-16">
                  <h3 className="font-serif text-2xl mb-8">Transformation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-[4/3] bg-secondary flex items-center justify-center border border-border">
                      <span className="text-muted-foreground tracking-widest uppercase text-sm font-medium">Before</span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden border border-border">
                      <img src={project.heroImage} className="w-full h-full object-cover opacity-80" alt="After" />
                      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 text-xs tracking-widest uppercase font-medium">
                        After
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="font-serif text-2xl mb-8">Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.gallery.map((img, i) => (
                      <div key={i} className={`relative overflow-hidden ${i === 2 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-secondary p-8 md:p-10 sticky top-32"
              >
                <h3 className="font-serif text-2xl mb-8">Project Details</h3>
                <dl className="space-y-6">
                  {Object.entries(project.details).map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <dt className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{key}</dt>
                      <dd className="font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
