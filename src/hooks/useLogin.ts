"use client";


import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp, getMe } from "../api/auth";
import { useAuth } from "../providers/AuthProvider";
import { STORAGE_KEYS } from "../api/config";
import type { UserRole } from "../types/admin";

const OTP_COUNTDOWN_SECONDS = 120;
const OTP_LENGTH = 5;

/** Two-step OTP login flow state. */
export type LoginStep = "phone" | "otp";

/** Return type for {@link useLogin}. */
export interface UseLoginResult {
  phone: string;
  setPhone: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  step: LoginStep;
  error: string;
  loading: boolean;
  autoVerifying: boolean;
  countdown: number;
  requestOtp: () => Promise<void>;
  resendOtp: () => Promise<void>;
  verifyOtp: (isAutoVerify?: boolean) => Promise<void>;
  changePhone: () => void;
}

/** Manages the phone + OTP two-step login flow, countdown, and post-login redirect. */
export function useLogin(): UseLoginResult {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [countdown, setCountdown] = useState(OTP_COUNTDOWN_SECONDS);

  const handleRequestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await requestOtp(phone);
      setStep("otp");
      setCountdown(OTP_COUNTDOWN_SECONDS);
      setCode("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ارسال کد با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await requestOtp(phone);
      setCountdown(OTP_COUNTDOWN_SECONDS);
      setCode("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ارسال مجدد کد با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = useCallback(
    async (isAutoVerify = false) => {
      setError("");
      if (isAutoVerify) setAutoVerifying(true);
      else setLoading(true);

      try {
        const verifyResponse = await verifyOtp(phone, code);
        const { access_token, role: verifyRole } = verifyResponse;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);

        const me = await getMe();
        const userRole = ((me.role || verifyRole || "user") as UserRole);
        const isAdmin = userRole === "admin";

        login(access_token, me.user_id, me.phone, isAdmin, me.name || undefined, userRole);
        router.push("/");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "کد وارد شده صحیح نیست");
      } finally {
        setLoading(false);
        setAutoVerifying(false);
      }
    },
    [phone, code, login, router],
  );

  const changePhone = () => {
    setStep("phone");
    setCode("");
    setCountdown(OTP_COUNTDOWN_SECONDS);
  };

  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  useEffect(() => {
    if (code.length === OTP_LENGTH && !loading && !autoVerifying) {
      handleVerifyOtp(true);
    }
  }, [code, loading, autoVerifying, handleVerifyOtp]);

  return {
    phone, setPhone, code, setCode, step, error, loading, autoVerifying, countdown,
    requestOtp: handleRequestOtp, resendOtp, verifyOtp: handleVerifyOtp, changePhone,
  };
}
