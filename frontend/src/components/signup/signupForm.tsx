import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useId } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth.context";
import { User } from "@/types/auth";
import { useRouter } from "next/navigation";
import { ca } from "zod/locales";

// TODO improve form logic block submit on request, handle errors, loading state, etc
export const signupFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export function SignupForm() {
  const { setUser } = useAuth();
  const router = useRouter();
  const formId = useId();
  const form = useForm({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    try {
      const { data: user } = await axios.post<User>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        data,
        {
          withCredentials: true,
        },
      );
      setUser(user);
      router.push("/profile");
    } catch (error) {
      form.setError("root", {
        message:
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  useEffect(() => {
    return () => {
      form.reset();
    };
  }, []);

  return (
    <>
      <form
        id={formId}
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-input-username">
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Username"
                  autoComplete="username"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-input-email">Email</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Email"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-input-password">
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {form.formState.errors.root && (
            <FieldError errors={[form.formState.errors.root]} />
          )}
        </FieldGroup>
        <Button type="submit" form={formId}>
          Register
        </Button>
      </form>
    </>
  );
}
