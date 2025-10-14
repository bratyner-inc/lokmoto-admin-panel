/**
 * useOnboarding Hook
 * Presentation layer - React hook for onboarding management
 */

import { useState } from 'react';
import { RentalCompanyRepository } from '@/data/repositories/RentalCompanyRepository';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const rentalCompanyRepository = new RentalCompanyRepository();

/**
 * Hook to manage onboarding process
 */
export function useOnboarding() {
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    try {
      const response = await authService.verifyToken();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const completeStep = async (step: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      await rentalCompanyRepository.completeOnboardingStep(user.id, step);
      await refreshUser(); // Refresh user data to update onboarding state
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) throw new Error('User not authenticated');

    setLoading(true);
    try {
      await rentalCompanyRepository.completeOnboarding(user.id);
      await refreshUser(); // Refresh user data
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep: user?.onboardingStep || 0,
    isCompleted: user?.onboardingCompleted || false,
    loading,
    completeStep,
    completeOnboarding,
  };
}

