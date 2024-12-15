import { HTMLAttributes, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Bounce, toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PinInput, PinInputField } from "@/components/custom/pin-input";
import { Button } from "@/components/custom/button";
import { PasswordInput } from "./custom/password-input";

type OtpFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  otp: z.string().min(1, { message: "Please enter your otp code." }),
  email: z.string().min(1, { message: "Please enter your email." }),
  password: z
    .string()
    .min(1, {
      message: "Please enter your password",
    })
    .min(7, {
      message: "Password must be at least 7 characters long",
    })
    .transform((pwd) => pwd.trim()),
  confirmPassword: z.string().transform((pwd) => pwd.trim()),
});

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: data.otp,
          email: data.email,
          new_password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail);
        throw new Error(errorData.detail || "Login failed");
      }

      const dataRes = await response.json();
      console.log("Verify successful:", dataRes);
      toast.success(dataRes.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      navigate("/sign-in"); // Redirect to the otp page
    } catch (err) {
      console.log("🚀 ~ onSubmit ~ err:", err);
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }
  const isPasswordTouched = !!form.formState.dirtyFields.password;
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <PinInput
                      {...field}
                      className="flex h-10 justify-between"
                      onComplete={() => setDisabledBtn(false)}
                      onIncomplete={() => setDisabledBtn(true)}
                    >
                      {Array.from({ length: 7 }, (_, i) => {
                        if (i === 3)
                          return <Separator key={i} orientation="vertical" />;
                        return (
                          <PinInputField
                            key={i}
                            component={Input}
                            className={`${form.getFieldState("otp").invalid ? "border-red-500" : ""}`}
                          />
                        );
                      })}
                    </PinInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@gmail.com"
                      className="col-span-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
                  <FormLabel className="col-span-2 text-right">
                    Password
                  </FormLabel>
                  <FormControl className="col-span-4">
                    <div className="w-full">
                      <PasswordInput
                        placeholder="e.g., S3cur3P@ssw0rd"
                        className="w-full" // Ensure full width
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
                  <FormLabel className="col-span-2 text-right">
                    Confirm Password
                  </FormLabel>
                  <FormControl className="col-span-4">
                    <div className="w-full">
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder="e.g., S3cur3P@ssw0rd"
                        className="w-full" // Ensure full width
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={disabledBtn || isLoading}>
              Verify
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
