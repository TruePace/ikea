import React from 'react';
import { useRouter } from 'next/navigation';

const AuthModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleStayAsGuest = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Welcome to TruePace</h3>
        <p className="py-4">Would you like to log in for full access to all features, or continue as a guest?</p>
        <div className="modal-action">
          <button className="btn" onClick={handleStayAsGuest}>Stay as Guest</button>
          <button className="btn btn-primary" onClick={handleLogin}>Log In</button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;