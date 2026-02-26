import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useId } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth.context";
import { User } from "@/types/auth";
import { useRouter } from "next/navigation";

// TODO improve form logic block submit on request, handle errors, loading state, etc
export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export function LoginForm() {
  const { setUser } = useAuth();
  const router = useRouter();
  const formId = useId();
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    const { data: user } = await axios.post<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      data,
      {
        withCredentials: true,
      },
    );
    setUser(user);
    router.push("/profile");
  };

  return (
    <>
      <form
        id={formId}
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
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
        </FieldGroup>
        <Button type="submit" form={formId}>
          Login
        </Button>
      </form>
    </>
  );
}
