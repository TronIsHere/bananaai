"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  mobileNumberSchema,
  otpSchema,
  firstNameSchema,
  lastNameSchema,
} from "@/lib/validations";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "mobile" | "otp" | "name";

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [step, setStep] = useState<Step>("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileError, setMobileError] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError("");

    // Normalize mobile number (trim whitespace)
    const normalizedMobile = mobileNumber.trim().replace(/\s+/g, "");
    setMobileNumber(normalizedMobile);

    const result = mobileNumberSchema.safeParse(normalizedMobile);
    if (!result.success) {
      setMobileError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobileNumber: normalizedMobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMobileError(data.error || "خطا در ارسال کد تأیید");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMobileError("خطا در ارتباط با سرور");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    setOtpError("");

    const result = otpSchema.safeParse(otpCode);
    if (!result.success) {
      setOtpError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      // Normalize mobile number (trim whitespace)
      const normalizedMobile = mobileNumber.trim().replace(/\s+/g, "");
      
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobileNumber: normalizedMobile, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.error || "خطا در تأیید کد");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setUserExists(data.userExists);

      if (!data.userExists) {
        // User doesn't exist, go to registration
        setStep("name");
      } else {
        // User exists, login with NextAuth
        const result = await signIn("credentials", {
          mobileNumber: normalizedMobile,
          otp: otpCode,
          redirect: false,
        });

        if (result?.error) {
          setOtpError("خطا در ورود به سیستم");
          setIsLoading(false);
          return;
        }

        // Fetch and set user data in store
        try {
          const userResponse = await fetch("/api/user/me");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser({
              id: userData.id,
              mobileNumber: userData.mobileNumber,
              firstName: userData.firstName,
              lastName: userData.lastName,
              credits: userData.credits,
              currentPlan: userData.currentPlan,
              planStartDate: userData.planStartDate
                ? new Date(userData.planStartDate)
                : null,
              planEndDate: userData.planEndDate
                ? new Date(userData.planEndDate)
                : null,
              imagesGeneratedThisMonth: userData.imagesGeneratedThisMonth,
              monthlyResetDate: userData.monthlyResetDate
                ? new Date(userData.monthlyResetDate)
                : null,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        // Login successful, redirect to dashboard
        onOpenChange(false);
        router.push("/dashboard");
        // Reset form
        setStep("mobile");
        setMobileNumber("");
        setOtp(["", "", "", "", "", ""]);
        setMobileError("");
        setOtpError("");
        setUserExists(null);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("خطا در ارتباط با سرور");
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstNameError("");
    setLastNameError("");

    const firstNameResult = firstNameSchema.safeParse(firstName);
    const lastNameResult = lastNameSchema.safeParse(lastName);

    if (!firstNameResult.success) {
      setFirstNameError(firstNameResult.error.issues[0].message);
    }
    if (!lastNameResult.success) {
      setLastNameError(lastNameResult.error.issues[0].message);
    }

    if (!firstNameResult.success || !lastNameResult.success) {
      return;
    }

    setIsLoading(true);
    try {
      const otpCode = otp.join("");
      // Normalize mobile number (trim whitespace)
      const normalizedMobile = mobileNumber.trim().replace(/\s+/g, "");
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber: normalizedMobile,
          otp: otpCode,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if error is for firstName or lastName
        if (data.error.includes("نام")) {
          setFirstNameError(data.error);
        } else if (data.error.includes("نام خانوادگی")) {
          setLastNameError(data.error);
        } else if (data.error.includes("کد تأیید")) {
          setOtpError(data.error);
        } else {
          setFirstNameError(data.error || "خطا در ثبت‌نام");
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Registration successful, now login with NextAuth
      const result = await signIn("credentials", {
        mobileNumber,
        otp: otpCode,
        redirect: false,
      });

      if (result?.error) {
        setFirstNameError("خطا در ورود به سیستم");
        setIsLoading(false);
        return;
      }

      // Fetch and set user data in store
      try {
        const userResponse = await fetch("/api/user/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser({
            id: userData.id,
            mobileNumber: userData.mobileNumber,
            firstName: userData.firstName,
            lastName: userData.lastName,
            credits: userData.credits,
            currentPlan: userData.currentPlan,
            planStartDate: userData.planStartDate
              ? new Date(userData.planStartDate)
              : null,
            planEndDate: userData.planEndDate
              ? new Date(userData.planEndDate)
              : null,
            imagesGeneratedThisMonth: userData.imagesGeneratedThisMonth,
            monthlyResetDate: userData.monthlyResetDate
              ? new Date(userData.monthlyResetDate)
              : null,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      // Login successful, redirect to dashboard
      onOpenChange(false);
      router.push("/dashboard");
      // Reset form
      setStep("mobile");
      setMobileNumber("");
      setOtp(["", "", "", "", "", ""]);
      setFirstName("");
      setLastName("");
      setMobileError("");
      setOtpError("");
      setFirstNameError("");
      setLastNameError("");
      setUserExists(null);
    } catch (error) {
      console.error("Error registering user:", error);
      setFirstNameError("خطا در ارتباط با سرور");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("mobile");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
    } else if (step === "name") {
      setStep("otp");
      setFirstName("");
      setLastName("");
      setFirstNameError("");
      setLastNameError("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setTimeout(() => {
      setStep("mobile");
      setMobileNumber("");
      setOtp(["", "", "", "", "", ""]);
      setFirstName("");
      setLastName("");
      setMobileError("");
      setOtpError("");
      setFirstNameError("");
      setLastNameError("");
      setUserExists(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-white/10 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white text-right">
            {step === "mobile"
              ? "ورود به حساب کاربری"
              : step === "otp"
              ? "کد تأیید"
              : "تکمیل اطلاعات"}
          </DialogTitle>
          <DialogDescription className="text-right text-slate-400">
            {step === "mobile"
              ? "شماره موبایل خود را وارد کنید"
              : step === "otp"
              ? `کد تأیید به شماره ${mobileNumber} ارسال شد`
              : "لطفاً نام و نام خانوادگی خود را وارد کنید"}
          </DialogDescription>
        </DialogHeader>

        {step === "mobile" && (
          <form onSubmit={handleMobileSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="mobile"
                className="text-sm font-semibold text-white/80 block text-right"
              >
                شماره موبایل
              </label>
              <Input
                id="mobile"
                type="tel"
                inputMode="numeric"
                placeholder="09123456789"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    setMobileNumber(value);
                    setMobileError("");
                  }
                }}
                className="text-left text-lg tracking-wider border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20 h-12"
                required
                maxLength={11}
              />
              {mobileError && (
                <p className="text-xs text-red-400 text-right">{mobileError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-12 text-base"
            >
              {isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-white/80 block text-right">
                کد تأیید ۶ رقمی
              </label>
              <div className="flex gap-2 justify-center" dir="ltr">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      handleOtpChange(index, e.target.value);
                      setOtpError("");
                    }}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold border-white/10 bg-white/5 text-white focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20"
                    autoFocus={index === 0}
                    dir="ltr"
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-xs text-red-400 text-center">{otpError}</p>
              )}
              <p className="text-xs text-slate-400 text-center">
                کد را دریافت نکردید؟{" "}
                <button
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                  onClick={handleMobileSubmit}
                >
                  ارسال مجدد
                </button>
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-white/10 text-white/80 hover:border-white/30 hover:text-white h-12"
              >
                بازگشت
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-12"
              >
                {isLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </div>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-semibold text-white/80 block text-right"
              >
                نام
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="نام خود را وارد کنید"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFirstNameError("");
                }}
                className="text-right text-lg border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20 h-12"
                required
              />
              {firstNameError && (
                <p className="text-xs text-red-400 text-right">
                  {firstNameError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-semibold text-white/80 block text-right"
              >
                نام خانوادگی
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="نام خانوادگی خود را وارد کنید"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setLastNameError("");
                }}
                className="text-right text-lg border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20 h-12"
                required
              />
              {lastNameError && (
                <p className="text-xs text-red-400 text-right">
                  {lastNameError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-white/10 text-white/80 hover:border-white/30 hover:text-white h-12"
              >
                بازگشت
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-12"
              >
                {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام و ورود"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
