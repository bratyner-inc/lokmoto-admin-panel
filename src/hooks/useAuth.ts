import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { LoginCredentials, ForgotPasswordData, ResetPasswordData } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout: storeLogout, 
    setUser, 
    setLoading,
    hasPermission,
    hasRole 
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao fazer login');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storeLogout();
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro no logout:', error);
      // Fazer logout mesmo se der erro
      storeLogout();
      navigate('/login');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (response) => {
      toast.success(response.message || 'E-mail de recuperação enviado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar e-mail de recuperação');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (response) => {
      toast.success(response.message || 'Senha alterada com sucesso!');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao alterar senha');
    },
  });

  // Verify token query
  const { data: verifiedUser, isLoading: isVerifying, error: verifyError } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authService.verifyToken,
    enabled: !!token && !user,
    retry: false,
  });

  // Handle verify token response
  React.useEffect(() => {
    if (verifiedUser?.data) {
      setUser(verifiedUser.data);
    }
  }, [verifiedUser, setUser]);

  // Handle verify token error
  React.useEffect(() => {
    if (verifyError) {
      storeLogout();
    }
  }, [verifyError, storeLogout]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      setUser(response.data);
      toast.success(response.message || 'Perfil atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isVerifying,

    // Actions
    login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
    logout: () => logoutMutation.mutate(),
    forgotPassword: (data: ForgotPasswordData) => forgotPasswordMutation.mutate(data),
    resetPassword: (data: ResetPasswordData) => resetPasswordMutation.mutate(data),
    updateProfile: (userData: any) => updateProfileMutation.mutate(userData),

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSendingForgotPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // RBAC
    hasPermission,
    hasRole,
  };
};