import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, AlertCircle, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

// ── Schema ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type LoginValues = z.infer<typeof loginSchema>;

// ── Helper: user initials from email ─────────────────────────────────────────

function getYearString() {
  return new Date().getFullYear().toString();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const { user, loading, signIn } = useAuth();
  const [, navigate]              = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/admin");
    }
  }, [loading, user, navigate]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await signIn(values.email, values.password);

    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
      return;
    }

    // onAuthStateChange will fire and update user; redirect handled by useEffect above.
    // No need to navigate manually — keeps it reactive.
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel: brand ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-[#1a1714] flex-col items-center justify-between py-16 px-14">

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#b8965a]/15 via-transparent to-[#b8965a]/5 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#b8965a]/8 blur-3xl pointer-events-none" />
        <div className="absolute top-24 -left-20 w-72 h-72 rounded-full bg-[#b8965a]/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 self-start">
          <div className="font-serif text-lg tracking-[0.25em] uppercase text-white/90">
            Modulyn Space
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 mt-0.5">
            Admin Panel
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 text-center">
          <div className="w-px h-16 bg-white/15 mx-auto mb-10" />
          <p className="font-serif text-2xl text-white/80 leading-relaxed max-w-xs italic">
            "Great interiors are not about trends. They are about people."
          </p>
          <div className="w-px h-16 bg-white/15 mx-auto mt-10" />
        </div>

        {/* Footer */}
        <div className="relative z-10 self-start text-[11px] text-white/25 tracking-wide">
          © {getYearString()} Modulyn Space. All rights reserved.
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#faf9f7] flex flex-col items-center justify-center p-8 lg:p-16">

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-10">
          <div className="font-serif text-xl tracking-[0.25em] uppercase text-foreground">
            Modulyn Space
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
            Admin Panel
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in with your admin credentials to continue.
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-destructive/8 border border-destructive/20 text-destructive rounded-md p-4 mb-6 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 text-sm font-medium">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@modulynspace.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-11 rounded-none border-border/60 bg-white/80 focus-visible:ring-primary/50 focus-visible:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-foreground/80 text-sm font-medium">
                        Password
                      </FormLabel>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        tabIndex={-1}
                        onClick={() => {
                          // Placeholder — wire to Supabase resetPasswordForEmail when email is present
                          const email = form.getValues("email");
                          if (!email) {
                            form.setError("email", { message: "Enter your email first to reset password." });
                            return;
                          }
                          alert(`A password reset link will be sent to ${email}.\n(Configure email templates in your Supabase project to enable this.)`);
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          className="h-11 rounded-none border-border/60 bg-white/80 focus-visible:ring-primary/50 focus-visible:border-primary pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye    className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </span>
                )}
              </Button>

            </form>
          </Form>

          {/* No-signup note */}
          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            Access is by invitation only. Contact your administrator.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
