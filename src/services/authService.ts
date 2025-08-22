import api from '@/lib/api';
import { User, LoginCredentials, ForgotPasswordData, ResetPasswordData, ApiResponse, UserRole } from '@/types';

// Mock data para desenvolvimento
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin Global',
    email: 'admin@lokmoto.com',
    password: 'admin123',
    role: UserRole.GLOBAL_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin+Global&background=dc2626&color=fff',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Admin Loja São Paulo',
    email: 'loja.sp@lokmoto.com',
    password: 'loja123',
    role: UserRole.STORE_ADMIN,
    storeId: 'store-sp-001',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Loja&background=dc2626&color=fff',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

class AuthService {
  // Login simulado - substituir por chamada real da API
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Remover password do objeto retornado
    const { password, ...userWithoutPassword } = user;
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      data: {
        user: userWithoutPassword,
        token
      },
      success: true,
      message: 'Login realizado com sucesso'
    };

    // Implementação real da API:
    /*
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
    */
  }

  // Logout
  async logout(): Promise<void> {
    // Implementação real da API:
    /*
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    */
  }

  // Esqueci minha senha
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(u => u.email === data.email);
    if (!user) {
      throw new Error('E-mail não encontrado');
    }

    return {
      data: null,
      success: true,
      message: 'E-mail de recuperação enviado com sucesso'
    };

    // Implementação real da API:
    /*
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao enviar e-mail de recuperação');
    }
    */
  }

  // Resetar senha
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.password !== data.confirmPassword) {
      throw new Error('Senhas não coincidem');
    }

    return {
      data: null,
      success: true,
      message: 'Senha alterada com sucesso'
    };

    // Implementação real da API:
    /*
    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao resetar senha');
    }
    */
  }

  // Verificar token
  async verifyToken(): Promise<ApiResponse<User>> {
    const token = localStorage.getItem('lokMoto-token');
    if (!token) {
      throw new Error('Token não encontrado');
    }

    // Mock - extrair ID do token simulado
    const tokenParts = token.split('-');
    const userId = tokenParts[3];
    const user = MOCK_USERS.find(u => u.id === userId);

    if (!user) {
      throw new Error('Token inválido');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      data: userWithoutPassword,
      success: true
    };

    // Implementação real da API:
    /*
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token inválido');
    }
    */
  }

  // Atualizar perfil
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: userData as User,
      success: true,
      message: 'Perfil atualizado com sucesso'
    };

    // Implementação real da API:
    /*
    try {
      const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
    */
  }
}

export const authService = new AuthService();