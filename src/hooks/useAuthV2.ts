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
    // Try canonical source: user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data?.role) {
      setRole(data.role as UserRole);
      return;
    }

    // Fallback: legacy users may have role in user_metadata
    const { data: userResp } = await supabase.auth.getUser();
    const metaRole = (userResp.user?.user_metadata as any)?.role as UserRole | undefined;
    if (metaRole === 'platform_admin' || metaRole === 'rental_company' || metaRole === 'customer') {
      setRole(metaRole);
    } else {
      setRole(null);
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
      fullName?: string;
      tradingName?: string;
      companyName?: string;
      cnpj?: string;
      documentId?: string;
      phone?: string;
    }
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Signup with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role,
            full_name: profileData.fullName,
            trading_name: profileData.tradingName,
            company_name: profileData.companyName,
            cnpj: profileData.cnpj,
            document_id: profileData.documentId,
            phone: profileData.phone,
          }
        }
      });

      if (error) throw error;

      // For rental companies, create additional records
      if (role === 'rental_company' && data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'rental_company'
          });

        if (roleError) throw roleError;

        const { error: companyError } = await supabase
          .from('rental_companies')
          .insert({
            id: data.user.id,
            email: email,
            trading_name: profileData.tradingName || '',
            company_name: profileData.companyName || '',
            cnpj: profileData.cnpj || '',
            phone: profileData.phone || ''
          });

        if (companyError) throw companyError;
      }

      // For platform admins, create additional records
      if (role === 'platform_admin' && data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'platform_admin'
          });

        if (roleError) throw roleError;

        const { error: adminError } = await supabase
          .from('platform_admins')
          .insert({
            id: data.user.id,
            email: email,
            full_name: profileData.fullName || ''
          });

        if (adminError) throw adminError;
      }

      // For customers, the trigger will handle user_roles and customers table insertion

      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
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
