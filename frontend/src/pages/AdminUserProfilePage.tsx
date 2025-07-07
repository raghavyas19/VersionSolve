import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminFetchUserProfile } from '../utils/api';

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  profilePhotoUrl: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  email: string;
  lastLogin?: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

const AdminUserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      setLoading(true);
      adminFetchUserProfile(username)
        .then(setProfile)
        .catch(() => setError('User not found'))
        .finally(() => setLoading(false));
    }
  }, [username]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !profile) return <div className="p-8 text-red-500">{error || 'User not found'}</div>;

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <button
        onClick={() => navigate('/admin/user')}
        className="flex items-center space-x-2 mb-4 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Manage Users</span>
      </button>
      <div className="p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="mb-6 flex items-center gap-4">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 dark:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-blue-400 dark:border-blue-500">
              <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="28" r="16" fill="#CBD5E1" />
                <ellipse cx="40" cy="60" rx="24" ry="14" fill="#CBD5E1" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
            <div className="text-gray-500 dark:text-gray-400 text-sm">@{profile.username}</div>
            <div className="mt-2 flex gap-2">
              {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">GitHub</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">LinkedIn</a>}
              {profile.twitter && <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Twitter</a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Website</a>}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 dark:text-gray-200 font-medium">Email: <span className="font-normal">{profile.email}</span></div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Active: <span className="font-normal">{profile.isActive ? 'Yes' : 'No'}</span></div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Email Verified: <span className="font-normal">{profile.isEmailVerified ? 'Yes' : 'No'}</span></div>
          <div className="text-gray-700 dark:text-gray-200 font-medium">Last Login: <span className="font-normal">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}</span></div>
        </div>
        <div className="mb-2">
          <div className="text-gray-700 dark:text-gray-200 font-medium">Bio:</div>
          <div className="text-gray-900 dark:text-white mt-1">{profile.bio || '-'}</div>
        </div>
        <div className="mt-6 p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-semibold text-center">
          Admin View: This is a user's profile. You can view all details but cannot edit as admin.
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfilePage; 