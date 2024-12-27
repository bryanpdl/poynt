import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '../utils/firebase';

interface SignInModalProps {
  onSignIn: () => void;
}

export default function SignInModal({ onSignIn }: SignInModalProps) {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSignIn();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

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