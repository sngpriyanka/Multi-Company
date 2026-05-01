import { useEffect, useMemo, useState } from 'react'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { cacheData, getCachedData, clearCache } from '../utils/offlineCache'

export const useAuth = () => {
  const { token, user, hydrated, setSession, clearSession, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!hydrated || !token || user) return

    let active = true

    const hydrateUser = async () => {
      setBootstrapping(true)
      try {
        const cachedUser = getCachedData('user_profile')
        if (cachedUser && !isOnline) {
          setUser(cachedUser)
          setBootstrapping(false)
          return
        }

        const currentUser = await authAPI.me()
        if (active) {
          setUser(currentUser)
          cacheData('user_profile', currentUser, undefined, currentUser._id || currentUser.id)
        }
      } catch (error) {
        const cachedUser = getCachedData('user_profile')
        if (cachedUser && active) {
          setUser(cachedUser)
        } else if (active) {
          clearSession()
        }
      } finally {
        if (active) {
          setBootstrapping(false)
        }
      }
    }

    hydrateUser()

    return () => {
      active = false
    }
  }, [hydrated, token, user, setUser, clearSession, isOnline])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const payload = await authAPI.login({ email, password })
      setSession(payload)
      // Cache user data after successful login
      cacheData('user_profile', payload.user, undefined, payload.user._id || payload.user.id)
      return payload
    } finally {
      setLoading(false)
    }
  }

  const bootstrapSuperadmin = async (payload) => {
    setLoading(true)
    try {
      const data = await authAPI.bootstrapSuperadmin(payload)
      setSession(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout()
      }
    } catch (_error) {
      // Swallow logout API errors so local session always clears.
    } finally {
      clearSession()
    }
  }

  const refreshCurrentUser = async () => {
    if (!token) return null
    const currentUser = await authAPI.me()
    setUser(currentUser)
    return currentUser
  }

  const derived = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      isSuperadmin: user?.role === 'superadmin',
      isAdmin: user?.role === 'admin',
    }),
    [token, user]
  )

  return {
    token,
    user,
    hydrated,
    loading,
    bootstrapping,
    login,
    logout,
    refreshCurrentUser,
    bootstrapSuperadmin,
    ...derived,
  }
}
