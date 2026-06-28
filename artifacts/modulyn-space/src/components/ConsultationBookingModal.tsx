import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

// ── Schema ────────────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  name:           z.string().min(2, "Name must be at least 2 characters."),
  email:          z.string().email("Please enter a valid email address."),
  phone:          z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  location:       z.string().optional(),
  project_type:   z.string().optional(),
  message:        z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;
type SubmitStatus  = "idle" | "loading" | "success" | "error";

// ── Time slots ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
  "6:00 PM – 7:00 PM",
];

const PROJECT_TYPES = [
  { value: "residential_full",  label: "Full Home Interior" },
  { value: "kitchen_wardrobe",  label: "Kitchen & Wardrobes" },
  { value: "renovation",        label: "Renovation" },
  { value: "commercial",        label: "Commercial / Office" },
  { value: "other",             label: "Other" },
];

// ── Minimum date = today ──────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function ConsultationBookingModal({ open, onClose }: Props) {
  const [submitStatus,  setSubmitStatus]  = useState<SubmitStatus>("idle");
  const [errorMessage,  setErrorMessage]  = useState("");

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name:           "",
      email:          "",
      phone:          "",
      preferred_date: "",
      preferred_time: "",
      location:       "",
      project_type:   "",
      message:        "",
    },
  });

  function handleClose() {
    if (submitStatus === "loading") return;
    // Reset to idle so the form is fresh next time
    if (submitStatus === "success") {
      setSubmitStatus("idle");
      setErrorMessage("");
      form.reset();
    }
    onClose();
  }

  async function onSubmit(values: BookingValues) {
    setSubmitStatus("loading");
    setErrorMessage("");

    const { error } = await supabase.from("consultation_bookings").insert({
      name:           values.name,
      email:          values.email,
      phone:          values.phone        || null,
      preferred_date: values.preferred_date || null,
      preferred_time: values.preferred_time || null,
      location:       values.location      || null,
      project_type:   values.project_type  || null,
      message:        values.message       || null,
      status:         "pending",
    });

    if (error) {
      console.error("[ConsultationBookingModal] Supabase insert error:", error);
      setErrorMessage(
        "Something went wrong. Please try again, or call us directly at +91 98765 43210."
      );
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("success");
    form.reset();
  }

  const isLoading = submitStatus === "loading";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-none">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-border">
          <DialogTitle className="font-serif text-2xl font-medium">
            Book a Free Consultation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Tell us about your project and pick a convenient time. Our team will confirm within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-6">
          <AnimatePresence mode="wait">

            {/* ── Success ──────────────────────────────────────────────── */}
            {submitStatus === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-10 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl">Booking Received!</h3>
                <p className="text-muted-foreground max-w-xs">
                  We've received your consultation request. Our team will reach out to confirm your appointment within 24 hours.
                </p>
                <Button
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </motion.div>
            )}

            {/* ── Form ─────────────────────────────────────────────────── */}
            {submitStatus !== "success" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Error banner */}
                <AnimatePresence>
                  {submitStatus === "error" && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-sm p-4 mb-6"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Priya Sharma"
                              className="rounded-none border-border/50 bg-background/50"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder="priya@example.com"
                                className="rounded-none border-border/50 bg-background/50"
                                disabled={isLoading}
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
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Preferred Date + Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="preferred_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                min={todayISO()}
                                className="rounded-none border-border/50 bg-background/50"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferred_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger className="rounded-none border-border/50 bg-background/50">
                                  <SelectValue placeholder="Select a slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TIME_SLOTS.map((slot) => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location + Project Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Area / Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Whitefield, Bengaluru"
                                className="rounded-none border-border/50 bg-background/50"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="project_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger className="rounded-none border-border/50 bg-background/50">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROJECT_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell Us More</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Property size, budget range, timeline, or anything else we should know…"
                              className="resize-none h-24 rounded-none border-border/50 bg-background/50"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none flex-1"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="rounded-none flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Booking…
                          </span>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>

                  </form>
                </Form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
