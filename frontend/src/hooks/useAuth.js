import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add debug logging to help troubleshoot auth issues
  console.log('🔍 useAuth called:', {
    user: context.user?.name || 'No user',
    hasToken: !!context.token,
    loading: context.loading
  });
  
  return context;
};
