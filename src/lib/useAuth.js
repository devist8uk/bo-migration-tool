import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    let authCompleted = false

    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client is not initialized')
      setError('Database connection not configured. Please check environment variables.')
      setLoading(false)
      return
    }

    // Timeout to prevent infinite loading - only fires if auth hasn't completed
    const timeout = setTimeout(() => {
      if (isMounted && !authCompleted) {
        console.error('Auth check timed out')
        setLoading(false)
        setError('Connection timed out. Please refresh the page.')
      }
    }, 10000) // 10 second timeout

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error: sessionError }) => {
        if (!isMounted) return
        authCompleted = true
        clearTimeout(timeout)

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        authCompleted = true
        clearTimeout(timeout)
        console.error('Auth error:', err)
        setError(err.message || 'Failed to connect to authentication service')
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }
}
