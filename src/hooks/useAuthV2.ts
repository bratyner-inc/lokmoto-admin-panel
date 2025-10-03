import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'customer' | 'rental_company' | 'platform_admin';

export const useAuthV2 = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role fetching to avoid blocking
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setRole(data.role as UserRole);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole,
    profileData: {
      fullName: string;
      phone: string;
      documentId?: string; // CPF for customers
      cnpj?: string; // For rental companies
      tradingName?: string; // For rental companies
      companyName?: string; // For rental companies
    }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role,
          full_name: profileData.fullName,
          phone: profileData.phone,
        },
      },
    });
    
    if (error || !data.user) {
      return { data, error };
    }

    // Create user_role record
    await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role });

    // Create profile based on role
    if (role === 'customer') {
      await supabase
        .from('customers')
        .insert({
          id: data.user.id,
          full_name: profileData.fullName,
          email,
          phone: profileData.phone,
          document_id: profileData.documentId || '',
        });
    } else if (role === 'rental_company') {
      await supabase
        .from('rental_companies')
        .insert({
          id: data.user.id,
          trading_name: profileData.tradingName || '',
          company_name: profileData.companyName || '',
          email,
          phone: profileData.phone,
          cnpj: profileData.cnpj || '',
        });
    } else if (role === 'platform_admin') {
      await supabase
        .from('platform_admins')
        .insert({
          id: data.user.id,
          full_name: profileData.fullName,
          email,
          role: 'support', // Default role
        });
    }
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  return {
    user,
    session,
    isLoading,
    role,
    isAuthenticated: !!user,
    isCustomer: role === 'customer',
    isRentalCompany: role === 'rental_company',
    isPlatformAdmin: role === 'platform_admin',
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
};
