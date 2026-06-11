import { create } from "zustand";

type UserState = {
  userId?: string;
  email?: string;
  credits: number;
  setUser: (user: { userId: string; email: string }) => void;
  setCredits: (credits: number) => void;
};

export const useUserStore = create<UserState>((set) => ({
  credits: 0,
  setUser: ({ userId, email }) => set({ userId, email }),
  setCredits: (credits) => set({ credits }),
}));
