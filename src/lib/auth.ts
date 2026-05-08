import { supabase } from './supabase'
import { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

export async function signUp(email: string, password: string, fullName: string, role: 'customer' | 'admin' | 'staff' | 'driver' = 'customer') {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (authError) throw authError

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          role: role
        })

      if (profileError) throw profileError

      // If customer, create customer record
      if (role === 'customer') {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: authData.user.id
          })

        if (customerError) throw customerError
      }

      // If driver, create driver record
      if (role === 'driver') {
        const { error: driverError } = await supabase
          .from('delivery_drivers')
          .insert({
            id: authData.user.id
          })

        if (driverError) throw driverError
      }
    }

    return { success: true, data: authData }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { success: true, user }
  } catch (error) {
    console.error('Get current user error:', error)
    return { success: false, error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Get user profile error:', error)
    return { success: false, error }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return { success: false, error }
  }
}

// Role-based access control
export function hasRole(userRole: string, requiredRoles: string[]) {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: string) {
  return userRole === 'admin'
}

export function isStaff(userRole: string) {
  return ['admin', 'staff'].includes(userRole)
}

export function isCustomer(userRole: string) {
  return ['admin', 'staff', 'customer'].includes(userRole)
}

export function isDriver(userRole: string) {
  return ['admin', 'staff', 'driver'].includes(userRole)
}

// Session management
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Refresh session error:', error)
    return { success: false, error }
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
