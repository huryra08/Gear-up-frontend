import { cn } from "@/lib/utils";
import {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-paper border border-ink/25 px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rust transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full bg-paper border border-ink/25 px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rust transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full bg-paper border border-ink/25 px-3 py-2.5 text-sm text-ink focus:border-rust transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("tag-label block mb-1.5 text-ink-soft", className)} {...props}>
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-rust-deep text-xs mt-1">{children}</p>;
}
