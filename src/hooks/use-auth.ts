"use client";

import { useUserStore } from "@/stores/user-store";

export function useAuth() {
  const userId = useUserStore((state) => state.userId);
  const email = useUserStore((state) => state.email);

  return {
    userId,
    email,
    isAuthenticated: Boolean(userId),
  };
}
