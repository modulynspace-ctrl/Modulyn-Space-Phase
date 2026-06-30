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
import { fetchPublicTestimonials, Testimonial } from "@/lib/testimonialsApi";
import { fetchPublicFAQs, FAQ } from "@/lib/faqsApi";
import { fetchPublicBrands, Brand } from "@/lib/brandsApi";
import { useSiteSettings } from "@/lib/siteSettingsContext";

interface FeaturedProject {
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  project_images: Array<{ url: string; is_hero: boolean }>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function Home() {
  const { homepageSettings: hs, loading: settingsLoading } = useSiteSettings();
  const [featuredProject, setFeaturedProject] = useState<FeaturedProject | null>(null);
  const [testimonials,   setTestimonials]   = useState<Testimonial[]>([]);
  const [faqs,           setFaqs]           = useState<FAQ[]>([]);
  const [brands,         setBrands]         = useState<Brand[]>([]);
  const [services, setServices] = useState([]);  //added manuvally
  
  useEffect(() => {
    document.title = "Modulyn Space | Premium Interior Design in Karnataka";
  }, []);

  useEffect(() => {
    fetchPublicTestimonials().then(({ data }) => setTestimonials(data));
    fetchPublicFAQs().then(({ data }) => setFaqs(data));
    fetchPublicBrands().then(({ data }) => setBrands(data));
  }, []);

  useEffect(() => {
    if (settingsLoading) return;

    const COLS = "title, slug, short_description, description, project_images(url, is_hero)";

    async function load() {
      // 0. Homepage settings override
      if (hs?.featured_project_id) {
        const { data: specific } = await supabase
          .from("projects")
          .select(COLS)
          .eq("id", hs.featured_project_id)
          .maybeSingle();
        if (specific) { setFeaturedProject(specific as FeaturedProject); return; }
      }

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
    }

    load();
  }, [settingsLoading, hs?.featured_project_id]);

  const heroHeadline  = hs?.hero_headline   ?? "Designing Spaces That Feel Like Home. Crafted To Last.";
  const heroSubtitle  = hs?.hero_subheading ?? "Bespoke residential and commercial interiors in Karnataka. We bring transparency, unhurried craftsmanship, and timeless quality to every project.";
  const heroImage     = hs?.hero_image_url  ?? heroImg;
  const statsProjects = hs?.stats_projects_count ?? 200;
  const statsClients  = hs?.stats_clients_count  ?? 150;
  const statsYears    = hs?.stats_years          ?? 1;

  return (
    <div className="w-full">
      {/* 1. Full-Screen Hero */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <img 
          src={heroImage} 
          alt="Luxury living room interior" 
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
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
              {heroHeadline}
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10">
              {heroSubtitle}
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
            <span>{statsYears}+ YEARS EXPERIENCE</span>
            <span className="hidden md:inline">•</span>
            <span>{statsProjects}+ COMPLETED PROJECTS</span>
            <span className="hidden md:inline">•</span>
            <span>{statsClients}+ HAPPY CLIENTS</span>
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
      {brands.length > 0 && (
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
              {[...brands, ...brands].map((brand, i) => (
                <div key={`${brand.id}-${i}`} className="opacity-50 hover:opacity-100 transition-opacity">
                  {brand.logo_url
                    ? <img src={brand.logo_url} alt={brand.name} className="h-10 max-w-[120px] object-contain grayscale hover:grayscale-0 transition-all" />
                    : <div className="text-2xl font-serif text-muted-foreground/40 font-bold">{brand.name}</div>}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* 10. Testimonials */}
      {testimonials.length > 0 && (
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
              {testimonials.slice(0, 3).map((testimonial, idx) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-secondary p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex text-primary mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => <Gem key={i} size={16} fill="currentColor" className="mr-1" />)}
                    </div>
                    <p className="text-foreground italic leading-relaxed mb-8">"{testimonial.content}"</p>
                  </div>
                  <div>
                    {testimonial.avatar_url && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border mb-3">
                        <img src={testimonial.avatar_url} alt={testimonial.client_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="font-medium text-sm">{testimonial.client_name}</p>
                    {testimonial.client_location && <p className="text-xs text-muted-foreground uppercase tracking-wider">{testimonial.client_location}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. FAQ */}
      {faqs.length > 0 && (
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
              {faqs.map((faq, idx) => (
                <AccordionItem key={faq.id} value={`item-${idx}`} className="border-border/50">
                  <AccordionTrigger className="font-serif text-lg hover:text-primary transition-colors text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

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
