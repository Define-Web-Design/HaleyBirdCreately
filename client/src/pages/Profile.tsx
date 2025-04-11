import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLocation('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          localStorage.removeItem('authToken');
          setLocation('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [setLocation]);
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLocation('/login');
  };
  
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error && !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => setLocation('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Back to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
      
      {user && (
        <div className="mb-6">
          <div className="mb-4 text-center">
            <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="rounded-full" />
              ) : (
                <span className="text-3xl text-gray-500">{user.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h3 className="text-xl font-semibold">{user.displayName || user.username}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-2">
              <span className="font-semibold">Username:</span> {user.username}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Role:</span> {user.role || 'User'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;