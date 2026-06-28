import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Home as HomeIcon, 
  ChefHat, 
  DoorClosed, 
  Building2, 
  Hammer, 
  Briefcase, 
  Sofa, 
  LampCeiling, 
  Zap, 
  TreePine,
  ShieldCheck,
  Gem,
  Clock,
  Users,
  HeartHandshake
} from "lucide-react";

import heroImg from "@assets/hero-living-room.png";
import splitImg from "@assets/project-dining.png";
import featuredImg from "@assets/project-featured.png";
import { supabase } from "@/lib/supabase";

interface FeaturedProject {
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  project_images: Array<{ url: string; is_hero: boolean }>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Home() {
  const [featuredProject, setFeaturedProject] = useState<FeaturedProject | null>(null);

  useEffect(() => {
    document.title = "Modulyn Space | Premium Interior Design in Karnataka";
  }, []);

  useEffect(() => {
    const COLS = "title, slug, short_description, description, project_images(url, is_hero)";

    async function load() {
      // 1. Try featured = true
      const { data: featured } = await supabase
        .from("projects")
        .select(COLS)
        .eq("featured", true)
        .in("status", ["in_progress", "completed"])
        .limit(1)
        .maybeSingle();

      if (featured) { setFeaturedProject(featured as FeaturedProject); return; }

      // 2. Fallback: most recent completed
      const { data: recent } = await supabase
        .from("projects")
        .select(COLS)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent) setFeaturedProject(recent as FeaturedProject);
      // 3. No result → leave null (placeholder renders)
    }

    load();
  }, []);

  return (
    <div className="w-full">
      {/* 1. Full-Screen Hero */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <img 
          src={heroImg} 
          alt="Luxury living room interior" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 container mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-4xl"
          >
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Designing Spaces That Feel Like Home.<br/>
              <span className="italic font-light">Crafted To Last.</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10">
              Bespoke residential and commercial interiors in Karnataka. 
              We bring transparency, unhurried craftsmanship, and timeless quality to every project.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto h-14 px-8 text-base">
                <Link href="/contact" data-testid="link-hero-cta-primary">
                  Book Free Consultation
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-black w-full sm:w-auto h-14 px-8 text-base transition-colors duration-300">
                <Link href="/projects" data-testid="link-hero-cta-secondary">
                  Explore Projects
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center text-white/80 text-xs md:text-sm font-medium tracking-wide gap-4">
            <span>FOUNDED 2025</span>
            <span className="hidden md:inline">•</span>
            <span>200+ COMPLETED PROJECTS</span>
            <span className="hidden md:inline">•</span>
            <span>SERVING KARNATAKA</span>
            <span className="hidden md:inline">•</span>
            <span>TRANSPARENT PRICING</span>
          </div>
        </div>
      </section>

      {/* 2. Message to Every Homeowner */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-8"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">A Message to Every Homeowner</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
              We understand that building or renovating a home is a profound journey. It is more than just placing furniture or picking colors; it's about translating your life, your aspirations, and your peace of mind into a physical space. At Modulyn Space, we promise a partnership built on clarity, deep listening, and an uncompromising dedication to quality.
            </p>
            <p className="font-serif italic text-xl md:text-2xl text-primary">
              Welcome to the new standard of living.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Who We Are */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img src={splitImg} alt="Dining Room Project" className="w-full aspect-[4/5] object-cover shadow-2xl" />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-8 max-w-xl"
            >
              <h4 className="text-primary font-semibold tracking-wider text-sm uppercase">Who We Are</h4>
              <h2 className="font-serif text-4xl md:text-5xl">Crafting the Extraordinary.</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Modulyn Space is an architectural interior design firm driven by a singular vision: to create spaces that endure. We reject the fleeting trends in favor of timeless elegance.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our studio is composed of passionate designers, meticulous craftsmen, and dedicated project managers who believe that true luxury lies in the details—the perfectly aligned joinery, the soft wash of morning light, and the honest materiality of every element we select.
              </p>
              <Button asChild variant="outline" className="h-12 px-8 rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-300">
                <Link href="/story">Our Story</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Services */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h4 className="text-primary font-semibold tracking-wider text-sm uppercase mb-4">Expertise</h4>
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Our Services</h2>
            <p className="text-muted-foreground text-lg">Comprehensive design and execution capabilities, tailored to your exact requirements.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { icon: HomeIcon, title: "Home Interiors", desc: "Complete end-to-end residential design." },
              { icon: ChefHat, title: "Modular Kitchens", desc: "Ergonomic, premium kitchen spaces." },
              { icon: DoorClosed, title: "Wardrobes", desc: "Bespoke storage solutions." },
              { icon: Building2, title: "Turnkey Projects", desc: "From concept to final handover." },
              { icon: Hammer, title: "Renovation", desc: "Transforming existing spaces." },
              { icon: Briefcase, title: "Commercial", desc: "Offices and retail environments." },
              { icon: Sofa, title: "Furniture", desc: "Custom designed luxury pieces." },
              { icon: LampCeiling, title: "False Ceiling", desc: "Architectural lighting integration." },
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <service.icon className="w-10 h-10 text-primary mb-6 stroke-[1.5]" />
                <h3 className="font-serif text-xl mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Modulyn */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Why Choose Modulyn</h2>
            <p className="text-white/60 text-lg">We elevate the standard of interior design through unwavering commitment.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "Transparent Pricing", desc: "No hidden costs. Detailed BOQs provided before project kickoff." },
              { icon: Gem, title: "Quality Materials", desc: "Partnering only with industry-leading brands for lasting durability." },
              { icon: Clock, title: "On-Time Delivery", desc: "Strict adherence to timelines with regular progress updates." },
              { icon: Users, title: "Expert Team", desc: "In-house architects, 3D visualizers, and seasoned project managers." },
              { icon: HeartHandshake, title: "Post-handover Support", desc: "Comprehensive warranty and dedicated maintenance assistance." },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <feature.icon className="w-8 h-8 text-primary stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. The Modulyn Difference */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-5xl mx-auto text-center"
          >
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.1]">
              We do not just fill spaces.<br/>
              <span className="italic text-muted-foreground">We define them.</span>
            </h2>
          </motion.div>
        </div>
      </section>

      {/* 7. Our Process */}
      <section className="py-24 bg-secondary overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-center">How We Work</h2>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { step: "01", title: "Consultation", desc: "Understanding your vision and lifestyle." },
                { step: "02", title: "Design", desc: "2D layouts and photorealistic 3D rendering." },
                { step: "03", title: "Material Selection", desc: "Curating finishes with our experts." },
                { step: "04", title: "Execution", desc: "Precision installation by our craftsmen." },
                { step: "05", title: "Handover", desc: "Final walkthrough and project delivery." },
              ].map((process, idx) => (
                <motion.div
                  key={process.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative z-10 bg-secondary md:bg-transparent"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center font-serif text-lg mb-6 shadow-sm">
                      {process.step}
                    </div>
                    <h3 className="font-serif text-xl mb-2">{process.title}</h3>
                    <p className="text-muted-foreground text-sm">{process.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Featured Project */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <img
          src={featuredProject?.project_images?.find((i) => i.is_hero)?.url ?? featuredImg}
          alt="Featured luxury project"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-2xl text-white"
          >
            <div className="mb-4 text-primary font-medium tracking-widest text-sm uppercase">Featured Project</div>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">
              {featuredProject?.title ?? "The Koramangala Villa"}
            </h2>
            <p className="text-white/80 text-lg mb-8 font-light">
              {featuredProject?.short_description ?? featuredProject?.description ?? "A masterclass in modern minimalism. 6,500 sq ft of meticulously detailed spaces harmonizing natural light, Italian marble, and bespoke walnut joinery."}
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8">
              <Link href={featuredProject ? `/projects/${featuredProject.slug}` : "/projects"}>View Project</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 9. Material Brands */}
      <section className="py-20 border-b border-border bg-background overflow-hidden">
        <div className="container mx-auto px-6 mb-10">
          <h3 className="text-center text-sm font-medium tracking-widest text-muted-foreground uppercase">Trusted Brand Partners</h3>
        </div>
        <div className="flex w-full">
          <motion.div 
            className="flex gap-16 items-center px-8 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          >
            {/* Duplicate list for seamless loop */}
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {["Kajaria", "Asian Paints", "Hettich", "Sleek", "Greenlam", "Kohler", "Hafele", "Saint-Gobain"].map((brand) => (
                  <div key={brand} className="text-2xl font-serif text-muted-foreground/40 font-bold opacity-50 hover:opacity-100 transition-opacity">
                    {brand}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl">Client Stories</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "The level of detail Modulyn brought to our apartment was extraordinary. They understood our aesthetic immediately and executed it flawlessly.", author: "Priya S.", location: "Whitefield" },
              { text: "Professionalism from day one. The 3D designs matched the final outcome exactly. Their transparency regarding costs gave us immense peace of mind.", author: "Rahul M.", location: "Indiranagar" },
              { text: "A truly premium experience. The quality of the woodwork and the attention to lighting has completely transformed how we live in our home.", author: "Anjali & Vikram", location: "Jayanagar" },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-secondary p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-primary mb-6">
                    {[...Array(5)].map((_, i) => <Gem key={i} size={16} fill="currentColor" className="mr-1" />)}
                  </div>
                  <p className="text-foreground italic leading-relaxed mb-8">"{testimonial.text}"</p>
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What is your typical project timeline?", a: "For a standard 3BHK home interior, our execution timeline is typically 45-60 days from the day of design sign-off. Larger bespoke villas may take 3-4 months." },
              { q: "How do you handle pricing and budgets?", a: "We believe in 100% transparency. After the initial consultation, we provide a detailed Bill of Quantities (BOQ). There are no hidden charges." },
              { q: "Do you manufacture your own furniture?", a: "Yes, we have our own state-of-the-art manufacturing facility to ensure precision, quality control, and timely delivery of all modular and custom furniture." },
              { q: "Do you take up renovation projects?", a: "Yes, we undertake complete civil and interior renovation projects, handling everything from demolition to final styling." },
              { q: "Is there a warranty on your interiors?", a: "Absolutely. We provide a 5-year comprehensive warranty on all woodwork and hardware, along with dedicated post-handover support." }
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50">
                <AccordionTrigger className="font-serif text-lg hover:text-primary transition-colors text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 12. Luxury CTA Banner */}
      <section className="py-32 bg-foreground text-background text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">Let's Build Something Exceptional Together.</h2>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-base shadow-xl shadow-primary/20">
              <Link href="/contact">Start Your Project</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
