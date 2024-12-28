import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '../utils/firebase';

interface SignInModalProps {
  onSignIn: () => void;
  isNewUser?: boolean;
  onUsernameSubmit?: (username: string) => Promise<void>;
}

export default function SignInModal({ onSignIn, isNewUser, onUsernameSubmit }: SignInModalProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      const { isNewUser } = await signInWithGoogle();
      if (!isNewUser) {
        onSignIn();
      }
      // Don't call onSignIn for new users - they need to set username first
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onUsernameSubmit?.(username.trim());
      onSignIn();
    } catch (error) {
      console.error('Error setting username:', error);
      setError('Failed to set username. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isNewUser && onUsernameSubmit) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-50">
        <div className="bg-[#161616] p-8 rounded-lg w-full max-w-md animate-scale-in">
          <h2 className="text-3xl font-black mb-4 text-center">Create Username</h2>
          <p className="text-gray-400 text-center mb-6">
            Choose a username that will be displayed in the game and on leaderboards.
          </p>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={isSubmitting}
                className="w-full bg-white/5 border-2 border-white/10 rounded-lg px-4 py-3 text-lg
                  focus:outline-none focus:border-white/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-[#161616] px-6 py-4 rounded-lg 
                text-lg font-bold hover:bg-white/90 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Username'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-50">
      <div className="bg-[#161616] p-8 rounded-lg w-full max-w-md animate-scale-in">
        <h2 className="text-3xl font-black mb-6 text-center">Welcome to Poynt</h2>
        <p className="text-gray-400 text-center mb-8">
          Sign in to track your stats and compete on the leaderboards!
        </p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#161616] px-6 py-4 rounded-lg 
            text-lg font-bold hover:bg-white/90 transition-colors"
        >
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </button>
      </div>
    </div>
  );
} 