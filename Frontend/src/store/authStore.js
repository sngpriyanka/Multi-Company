import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,

      setSession: ({ token, user }) => {
        if (token) {
          localStorage.setItem('token', token)
        }

        set({
          token,
          user,
        })
      },

      clearSession: () => {
        localStorage.removeItem('token')
        set({
          token: null,
          user: null,
        })
      },

      setUser: (user) => {
        set((state) => ({
          ...state,
          user,
        }))
      },

      setHydrated: (hydrated) => {
        set({ hydrated })
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
