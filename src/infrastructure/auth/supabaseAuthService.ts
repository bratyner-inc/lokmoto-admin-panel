import { supabase } from '@/infrastructure/config/supabase';
import { User, LoginCredentials, ForgotPasswordData, ApiResponse, UserRole } from '@/types';

/**
 * Helper function to determine user role from Supabase
 * Checks rental_companies, platform_admins, and customers tables
 */
async function getUserRole(userId: string): Promise<{ role: UserRole; userData: any }> {
  // Check if user is a platform admin
  const { data: adminData } = await supabase
    .from('platform_admins')
    .select('*')
    .eq('id', userId)
    .single();

  if (adminData) {
    return {
      role: UserRole.GLOBAL_ADMIN,
      userData: {
        id: adminData.id,
        name: adminData.full_name,
        email: adminData.email,
        role: UserRole.GLOBAL_ADMIN,
        createdAt: adminData.created_at,
        updatedAt: adminData.updated_at,
      },
    };
  }

  // Check if user is a rental company
  const { data: rentalData } = await supabase
    .from('rental_companies')
    .select('*')
    .eq('id', userId)
    .single();

  if (rentalData) {
    return {
      role: UserRole.STORE_ADMIN,
      userData: {
        id: rentalData.id,
        name: rentalData.company_name,
        email: rentalData.email,
        role: UserRole.STORE_ADMIN,
        storeId: rentalData.id, // rental company ID is the store ID
        createdAt: rentalData.created_at,
        updatedAt: rentalData.updated_at,
      },
    };
  }

  // Default to customer role (though this admin panel shouldn't have customers)
  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .single();

  if (customerData) {
    throw new Error('Clientes não têm acesso ao painel administrativo');
  }

  throw new Error('Usuário não encontrado em nenhum perfil válido');
}

class SupabaseAuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new Error('Falha na autenticação');
      }

      // Get user role and profile data
      const { role, userData } = await getUserRole(authData.user.id);

      // Generate avatar if not provided
      const avatar = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=dc2626&color=fff`;

      const user: User = {
        ...userData,
        avatar,
      };

      return {
        data: {
          user,
          token: authData.session.access_token,
        },
        success: true,
        message: 'Login realizado com sucesso',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: null,
        success: true,
        message: 'E-mail de recuperação enviado com sucesso',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar e-mail de recuperação');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(newPassword: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: null,
        success: true,
        message: 'Senha alterada com sucesso',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao resetar senha');
    }
  }

  /**
   * Verify current session and get user data
   */
  async verifyToken(): Promise<ApiResponse<User>> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Sessão inválida');
      }

      // Get user role and profile data
      const { role, userData } = await getUserRole(session.user.id);

      const avatar = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=dc2626&color=fff`;

      const user: User = {
        ...userData,
        avatar,
      };

      return {
        data: user,
        success: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Token inválido');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('Usuário não autenticado');
      }

      // Determine which table to update based on current user role
      const { role } = await getUserRole(authUser.id);

      if (role === UserRole.GLOBAL_ADMIN) {
        const { error } = await supabase
          .from('platform_admins')
          .update({ full_name: userData.name })
          .eq('id', authUser.id);

        if (error) throw new Error(error.message);
      } else if (role === UserRole.STORE_ADMIN) {
        const { error } = await supabase
          .from('rental_companies')
          .update({ 
            company_name: userData.name,
            phone: userData.phone || undefined,
          })
          .eq('id', authUser.id);

        if (error) throw new Error(error.message);
      }

      return {
        data: userData as User,
        success: true,
        message: 'Perfil atualizado com sucesso',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  }

  /**
   * Get current user session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const supabaseAuthService = new SupabaseAuthService();

