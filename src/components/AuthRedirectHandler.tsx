/**
 * Auth Redirect Handler
 * Handles authentication redirects from Supabase (recovery, email confirmation, etc.)
 * Detects tokens in URL and redirects to appropriate pages
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for hash fragments (Supabase auth tokens)
    const hash = window.location.hash;
    
    if (hash) {
      // Parse hash parameters
      const params = new URLSearchParams(hash.substring(1)); // Remove '#'
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      // If there's an error, redirect to login with error message
      if (error) {
        console.error('Auth error:', error, errorDescription);
        navigate('/login', { 
          state: { 
            error: errorDescription || error 
          },
          replace: true 
        });
        return;
      }

      // If there's a valid token, redirect based on type
      if (accessToken && type) {
        switch (type) {
          case 'recovery':
            // Password reset
            console.log('Recovery token detected, redirecting to reset password');
            navigate('/reset-password' + hash, { replace: true });
            break;

          case 'signup':
          case 'email_change':
            // Email confirmation
            console.log('Email confirmation detected, redirecting to login');
            navigate('/login' + hash, { 
              state: { 
                message: 'Email confirmado com sucesso! Faça login para continuar.' 
              },
              replace: true 
            });
            break;

          case 'invite':
            // User invitation
            console.log('Invite token detected, redirecting to register');
            navigate('/register' + hash, { replace: true });
            break;

          case 'magiclink':
            // Magic link login
            console.log('Magic link detected, processing login');
            // The hash will be processed by the auth service
            navigate('/dashboard' + hash, { replace: true });
            break;

          default:
            console.log('Unknown auth type:', type);
            navigate('/login' + hash, { replace: true });
        }
      }
    }
  }, [navigate, location]);

  return null; // This component doesn't render anything
}

