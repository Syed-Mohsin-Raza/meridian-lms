"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  PasswordStrength,
  isPasswordStrong,
} from "@/components/auth/password-strength";
import { strongPasswordSchema } from "@/lib/validators/password";

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .max(20, "Phone must be at most 20 characters")
    .optional()
    .or(z.literal("")),
  password: strongPasswordSchema,
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const passwordValue = watch("password") ?? "";
  const passwordIsStrong = isPasswordStrong(passwordValue);

  async function onSubmit(data: RegisterFormData) {
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      };
      const user = await registerUser(payload);
      toast.success("Account created", `Welcome, ${user.fullName}`);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.isValidationError() && error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
          setFormError("Please correct the errors below.");
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Unable to create your account. Please try again.");
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Register as a customer to apply for loans.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              {...register("fullName")}
            />
            {(errors.fullName || fieldErrors.fullName) && (
              <p className="text-sm text-destructive">
                {errors.fullName?.message ?? fieldErrors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {(errors.email || fieldErrors.email) && (
              <p className="text-sm text-destructive">
                {errors.email?.message ?? fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 000 1234"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...register("password")}
            />
            <PasswordStrength password={passwordValue} />
            {(errors.password || fieldErrors.password) && (
              <p className="text-sm text-destructive">
                {errors.password?.message ?? fieldErrors.password}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !passwordIsStrong}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
