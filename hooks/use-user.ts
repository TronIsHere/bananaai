"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/user-store";

export function useUser() {
  const { data: session, status } = useSession();
  const {
    id,
    mobileNumber,
    firstName,
    lastName,
    credits,
    currentPlan,
    planStartDate,
    planEndDate,
    imagesGeneratedThisMonth,
    monthlyResetDate,
    setUser,
    resetUser,
  } = useUserStore();

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const userData = await response.json();
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
  }, [setUser]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session) {
      resetUser();
      return;
    }

    if (session?.user?.id) {
      refreshUserData();
    }
  }, [session, status, setUser, resetUser, refreshUserData]);

  return {
    user: {
      id,
      mobileNumber,
      firstName,
      lastName,
      credits,
      currentPlan,
      planStartDate,
      planEndDate,
      imagesGeneratedThisMonth,
      monthlyResetDate,
    },
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    refreshUserData,
  };
}

