"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Input, Label, FieldError } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: doRegister, login } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await doRegister({ ...values, role: "CUSTOMER" });
      await login(values.email, values.password);
      toast.success("Account created. Welcome to GearUp!");
      router.push("/dashboard/customer");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <p className="tag-label text-rust mb-2">Create account</p>
      <h1 className="font-display text-3xl text-forest mb-8">Join GearUp</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label>Full name</Label>
          <Input {...register("name")} placeholder="Jordan Rivers" />
          <FieldError>{errors.name?.message}</FieldError>
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div>
          <Label>Phone (optional)</Label>
          <Input {...register("phone")} placeholder="01700000000" />
        </div>

        <div>
          <Label>Password</Label>
          <PasswordInput {...register("password")} placeholder="At least 6 characters" />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-ink-soft mt-6 text-center">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-rust font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}