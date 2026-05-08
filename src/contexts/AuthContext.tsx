'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getCurrentUser, getUserProfile, onAuthStateChange, signOut } from '@/lib/auth'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isStaff: boolean
  isCustomer: boolean
  isDriver: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<{ success: boolean; error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { data, success } = await getUserProfile(user.id)
      if (success && data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { success, user } = await getCurrentUser()
        if (success && user) {
          setUser(user)
          
          // Get user profile
          const { data: profileData, success: profileSuccess } = await getUserProfile(user.id)
          if (profileSuccess && profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        
        // Get user profile
        const { data: profileData, success } = await getUserProfile(session.user.id)
        if (success && profileData) {
          setProfile(profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isStaff: ['admin', 'staff'].includes(profile?.role || ''),
    isCustomer: ['admin', 'staff', 'customer'].includes(profile?.role || ''),
    isDriver: ['admin', 'staff', 'driver'].includes(profile?.role || ''),
    refreshProfile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
