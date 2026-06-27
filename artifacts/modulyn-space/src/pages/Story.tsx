import React, { useEffect } from "react";
import { motion } from "framer-motion";
import officeImg from "@assets/project-office.png";

export default function Story() {
  useEffect(() => {
    document.title = "Our Story | Modulyn Space";
  }, []);

  return (
    <div className="w-full pt-20">
      {/* Header */}
      <section className="py-20 md:py-32 bg-background text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h4 className="text-primary font-semibold tracking-widest text-sm uppercase mb-6">Our Story</h4>
            <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">Elevating Everyday Living.</h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              We started with a simple belief: that your environment profoundly shapes your well-being. A well-designed space is not just visually appealing—it is a foundation for a better life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Image */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-[60vh] max-h-[800px] overflow-hidden"
          >
            <img src={officeImg} alt="Modulyn Studio" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="font-serif text-4xl mb-6">The Philosophy</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                Established in Bengaluru, Modulyn Space emerged from a desire to bring clarity and uncompromising quality to the disorganized interior design sector. We saw homeowners overwhelmed by opaque pricing, delayed timelines, and subpar materials.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We set out to build an architecture and interior firm that operates with absolute transparency and meticulous precision. From the initial sketch to the final coat of paint, our process is designed to be an unhurried, reassuring experience.
              </p>
            </div>
            <div className="bg-secondary p-12 border border-border">
              <h3 className="font-serif text-2xl text-primary mb-4">Our Mission</h3>
              <p className="text-foreground leading-relaxed mb-8">
                To craft spaces that perfectly balance aesthetic beauty with functional intelligence, ensuring lasting value for every client.
              </p>
              <h3 className="font-serif text-2xl text-primary mb-4">Our Vision</h3>
              <p className="text-foreground leading-relaxed">
                To be the most trusted name in luxury residential and commercial interiors across India, known for our integrity and craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Transparency", desc: "Honest communication, clear BOQs, and no hidden surprises. Ever." },
              { title: "Craftsmanship", desc: "An obsession with detail. We measure twice, cut once, and polish to perfection." },
              { title: "Empathy", desc: "We design for how you live, not just how it looks in a magazine." },
              { title: "Endurance", desc: "Using materials and techniques that stand the test of time and trends." }
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border-t border-white/20 pt-8"
              >
                <div className="text-primary font-mono text-sm mb-4 tracking-widest">0{i + 1}</div>
                <h3 className="font-serif text-2xl mb-4">{value.title}</h3>
                <p className="text-white/60 leading-relaxed font-light">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
