import { supabaseAuthService } from '@/infrastructure/auth/supabaseAuthService';
import { User, LoginCredentials, ForgotPasswordData, ResetPasswordData, ApiResponse } from '@/types';

/**
 * Auth Service - Wrapper around Supabase Auth
 * Provides authentication functionality for the application
 */
class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    return supabaseAuthService.login(credentials);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await supabaseAuthService.logout();
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    return supabaseAuthService.forgotPassword(data);
  }

  /**
   * Reset password with new password
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    if (data.password !== data.confirmPassword) {
      throw new Error('Senhas não coincidem');
    }
    return supabaseAuthService.resetPassword(data.password);
  }

  /**
   * Verify current session and get user data
   */
  async verifyToken(): Promise<ApiResponse<User>> {
    return supabaseAuthService.verifyToken();
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return supabaseAuthService.updateProfile(userData);
  }

  /**
   * Get current session
   */
  async getSession() {
    return supabaseAuthService.getSession();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabaseAuthService.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();