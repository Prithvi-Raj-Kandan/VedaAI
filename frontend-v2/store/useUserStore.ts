'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppUser {
  _id: string
  displayName: string
  email: string
}

interface UserStore {
  user: AppUser | null
  signIn: (user: AppUser) => void
  signOut: () => void
  updateUser: (user: Partial<AppUser>) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } as AppUser : null })),
    }),
    {
      name: 'vedaai-user-session',
    }
  )
)
