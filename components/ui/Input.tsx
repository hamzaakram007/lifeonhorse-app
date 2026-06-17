import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-600 focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Label = ({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-stone-700">
    {children}
    {required && <span className="text-red-500"> *</span>}
  </label>
);
