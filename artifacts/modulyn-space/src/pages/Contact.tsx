import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/lib/siteSettingsContext";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  projectType: z.string().min(1, { message: "Please select a project type." }),
  message: z.string().min(10, { message: "Please tell us a bit more about your project." }),
});

type FormValues = z.infer<typeof formSchema>;
type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { websiteSettings } = useSiteSettings();

  const phone          = websiteSettings.site_phone    ?? "+91 98765 43210";
  const email          = websiteSettings.site_email    ?? "hello@modulynspace.com";
  const address        = websiteSettings.site_address  ?? "123 Design Avenue, Bengaluru 560001";
  const googleMapsUrl  = websiteSettings.google_maps_url ?? null;
  const siteName       = websiteSettings.site_name     ?? "Modulyn Space";

  useEffect(() => {
    document.title = `Contact | ${siteName}`;
  }, [siteName]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitStatus("loading");
    setErrorMessage("");

    const { error } = await supabase.from("contact_requests").insert({
      name:         values.name,
      email:        values.email,
      phone:        values.phone,
      project_type: values.projectType,
      message:      values.message,
      status:       "new",
    });

    if (error) {
      console.error("[Contact form] Supabase insert error:", error);
      setErrorMessage(
        "Something went wrong on our end. Please try again, or reach us directly by phone or email."
      );
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("success");
    form.reset();
  }

  function handleSendAnother() {
    setSubmitStatus("idle");
    setErrorMessage("");
  }

  return (
    <div className="w-full pt-20">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-primary font-semibold tracking-widest text-sm uppercase mb-4">Get In Touch</h4>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-foreground">Let's Discuss Your Space.</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Book a consultation with our design experts and take the first step toward your dream interior.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">

            {/* Contact Info & Process */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-12"
            >
              <div>
                <h3 className="font-serif text-3xl mb-8">Studio Information</h3>
                <div className="space-y-6 text-muted-foreground">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">{siteName} Studio</p>
                      <p>{address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-6 h-6 text-primary shrink-0" />
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">{phone}</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="w-6 h-6 text-primary shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p>Mon - Sat: 10:00 AM - 7:00 PM</p>
                      <p>Sunday: By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="font-serif text-2xl mb-6">Our Process</h3>
                <div className="space-y-4">
                  {[
                    "1. Discovery Call: We discuss your requirements.",
                    "2. Site Visit: Our team visits your space for measurements.",
                    "3. Design Proposal: We present 2D layouts and initial estimates.",
                    "4. Project Kickoff: 3D rendering, material selection, and execution."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card border border-border p-8 md:p-10 shadow-sm"
            >
              <h3 className="font-serif text-2xl mb-6">Book a Consultation</h3>

              <AnimatePresence mode="wait">
                {/* Success state */}
                {submitStatus === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center text-center py-10 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-serif text-2xl text-foreground">Request Received</h4>
                    <p className="text-muted-foreground max-w-xs">
                      Thank you for reaching out. Our team will contact you within 24 hours.
                    </p>
                    <button
                      onClick={handleSendAnother}
                      className="mt-4 text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                    >
                      Send another enquiry
                    </button>
                  </motion.div>
                )}

                {/* Form state */}
                {submitStatus !== "success" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Error banner */}
                    <AnimatePresence>
                      {submitStatus === "error" && errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-sm p-4 mb-6"
                        >
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm">{errorMessage}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="rounded-none border-border/50 bg-background/50"
                                  disabled={submitStatus === "loading"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john@example.com"
                                    className="rounded-none border-border/50 bg-background/50"
                                    disabled={submitStatus === "loading"}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+91 99999 99999"
                                    className="rounded-none border-border/50 bg-background/50"
                                    disabled={submitStatus === "loading"}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={submitStatus === "loading"}
                              >
                                <FormControl>
                                  <SelectTrigger className="rounded-none border-border/50 bg-background/50">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="residential_full">Full Home Interior</SelectItem>
                                  <SelectItem value="kitchen_wardrobe">Kitchen & Wardrobes</SelectItem>
                                  <SelectItem value="renovation">Renovation</SelectItem>
                                  <SelectItem value="commercial">Commercial/Office</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your property, location, and requirements..."
                                  className="resize-none h-32 rounded-none border-border/50 bg-background/50"
                                  disabled={submitStatus === "loading"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none"
                          disabled={submitStatus === "loading"}
                        >
                          {submitStatus === "loading" ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Submitting…
                            </span>
                          ) : (
                            "Submit Request"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Map */}
      {googleMapsUrl ? (
        <section className="w-full h-96 border-t border-border">
          <iframe
            src={googleMapsUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Studio Location"
          />
        </section>
      ) : (
        <section className="w-full h-96 bg-muted relative border-t border-border flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Bengaluru&zoom=12&size=1000x400&sensor=false')] bg-cover bg-center opacity-30 grayscale mix-blend-multiply pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-background rounded-full shadow-lg flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="font-serif text-xl">{address.split(",").slice(-2).join(",").trim() || "Bengaluru, Karnataka"}</p>
          </div>
        </section>
      )}
    </div>
  );
}
