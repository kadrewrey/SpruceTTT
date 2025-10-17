import React, { useState, useEffect } from 'react';
import { apiService, ProfileResponse } from './apiService';
import { styles } from './styles';

interface UserProfileProps {
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiService.getProfile();
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    onLogout();
  };

  const profileCardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    margin: '0 auto 2rem',
  };

  const statItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const logoutButtonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    background: 'rgba(220, 53, 69, 0.1)',
    color: '#dc3545',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  if (loading) {
    return (
      <div style={profileCardStyle}>
        <div style={{ textAlign: 'center', color: '#2d5a3d' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={profileCardStyle}>
        <div style={{ textAlign: 'center', color: '#dc3545', marginBottom: '1rem' }}>
          {error}
        </div>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={profileCardStyle}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: '#2d5a3d', 
          margin: 0,
          fontFamily: 'Literata, serif' 
        }}>
          Welcome back, {profile.user.username}!
        </h3>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>

      <div style={{ color: '#2d5a3d' }}>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Literata, serif' }}>
          Your Stats
        </h4>
        
        <div style={statItemStyle}>
          <span>Total Games:</span>
          <strong>{profile.stats.totalGames}</strong>
        </div>
        
        <div style={statItemStyle}>
          <span>Wins:</span>
          <strong style={{ color: '#4a7c59' }}>{profile.stats.wins}</strong>
        </div>
        
        <div style={statItemStyle}>
          <span>Losses:</span>
          <strong style={{ color: '#dc3545' }}>{profile.stats.losses}</strong>
        </div>
        
        <div style={{ ...statItemStyle, borderBottom: 'none' }}>
          <span>Win Rate:</span>
          <strong style={{ 
            color: profile.stats.winRate >= 50 ? '#4a7c59' : '#dc3545' 
          }}>
            {profile.stats.winRate}%
          </strong>
        </div>
      </div>
    </div>
  );
};