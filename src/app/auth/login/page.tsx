"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Input, Label, FieldError } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button, LinkButton } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: "outline"; size: "large"; text: "continue_with"; width: number }
          ) => void;
        };
      };
    };
  }
}

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

const dashboardHref: Record<string, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      const next = params.get("next");
      router.push(next || dashboardHref[user.role] || "/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleCredential = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      toast.error("Google did not return an ID token. Try again.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await loginWithGoogle(response.credential);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      const next = params.get("next");
      router.push(next || dashboardHref[user.role] || "/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Google login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleScriptLoad = () => {
    if (!googleClientId) {
      toast.error("Google login is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    if (!window.google || !googleButtonRef.current) {
      toast.error("Google sign-in could not be loaded. Refresh and try again.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => void onGoogleCredential(response),
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: Math.min(400, googleButtonRef.current.clientWidth),
    });
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <p className="tag-label text-rust mb-2">Welcome back</p>
      <h1 className="font-display text-3xl text-forest mb-8">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label>Password</Label>
          <PasswordInput {...register("password")} placeholder="••••••••" />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-paper px-3 text-sm text-ink-soft">or</span>
        </div>
      </div>
      {googleClientId ? (
        <>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={onGoogleScriptLoad}
            onError={() => toast.error("Google sign-in could not be loaded. Refresh and try again.")}
          />
          <div ref={googleButtonRef} className="flex min-h-10 justify-center" aria-label="Continue with Google" />
        </>
      ) : (
        <Button type="button" variant="outline" className="w-full" disabled>
          Google login is not configured
        </Button>
      )}

      <div className="mt-5 border-t border-line pt-5 text-center">
        <p className="text-sm text-ink-soft mb-3">Just looking around? Explore the customer preview.</p>
        <LinkButton href="/demo" variant="outline" className="w-full">
          Demo Login
        </LinkButton>
      </div>

      <p className="text-sm text-ink-soft mt-6 text-center">
        Need an account?{" "}
        <Link href="/auth/register" className="text-rust font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
