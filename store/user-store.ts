import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlanType } from "@/lib/utils";

interface UserState {
  id: string | null;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  credits: number;
  currentPlan: PlanType;
  planStartDate: Date | null;
  planEndDate: Date | null;
  imagesGeneratedThisMonth: number;
  monthlyResetDate: Date | null;
  // Actions
  setUser: (user: Partial<UserState>) => void;
  updateCredits: (credits: number) => void;
  incrementImagesGenerated: () => void;
  resetUser: () => void;
}

const initialState = {
  id: null,
  mobileNumber: null,
  firstName: null,
  lastName: null,
  credits: 0,
  currentPlan: null,
  planStartDate: null,
  planEndDate: null,
  imagesGeneratedThisMonth: 0,
  monthlyResetDate: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set((state) => ({ ...state, ...user })),
      updateCredits: (credits) => set({ credits }),
      incrementImagesGenerated: () =>
        set((state) => ({
          imagesGeneratedThisMonth: state.imagesGeneratedThisMonth + 1,
        })),
      resetUser: () => set(initialState),
    }),
    {
      name: "user-storage",
    }
  )
);

