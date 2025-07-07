import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '../utils/api';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  profilePhotoUrl?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

// Helper for toast (simple alert fallback)
const showToast = (msg: string) => alert(msg);

const ActionsMenu: React.FC<{ user: User }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [showBanPrompt, setShowBanPrompt] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Close menu on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  const handleAction = async (action: string) => {
    setOpen(false);
    if (action === 'Temporary Ban') {
      setShowBanPrompt(true);
      return;
    }
    if (action === 'Set Inactive') {
      try {
        await axios.post(`/api/user/${user.username}/set-inactive`);
        showToast('User set to inactive');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to set inactive');
      }
      return;
    }
    if (action === 'Suspend') {
      try {
        await axios.post(`/api/user/${user.username}/suspend`, { reason: 'Account set for deletion' });
        showToast('User suspended');
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to suspend');
      }
      return;
    }
  };
  return (
    <div className="relative inline-block text-left">
      <button onClick={handleMenuClick} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-gray-900 dark:bg-gray-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button onClick={() => handleAction('Set Inactive')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Set Inactive</button>
            <button onClick={() => handleAction('Temporary Ban')} className="block w-full px-4 py-2 text-left text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900">Temporary Ban</button>
            <button onClick={() => handleAction('Suspend')} className="block w-full px-4 py-2 text-left text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900">Suspend</button>
          </div>
        </div>
      )}
      {showBanPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Temporary Ban Reason</h3>
            <textarea
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Enter reason for ban (optional)"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => { setShowBanPrompt(false); setBanReason(''); }}
              >Cancel</button>
              <button
                className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                onClick={async () => {
                  try {
                    await axios.post(`/api/user/${user.username}/temporary-ban`, { reason: banReason });
                    showToast('User temporarily banned');
                  } catch (err: any) {
                    showToast(err.response?.data?.message || 'Failed to ban');
                  }
                  setShowBanPrompt(false); setBanReason('');
                }}
              >Ban for 10 min</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message || 'Failed to fetch users'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GitHub</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">LinkedIn</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Twitter</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Website</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user, idx) => (
                <tr key={user._id} className="transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">{idx + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                    <Link to={`/admin/user/${user.username}`} className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">{user.name}</Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{user.username}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-4 py-2 text-sm">{user.isActive ? <span className="text-green-600 dark:text-green-400 font-semibold">Yes</span> : <span className="text-red-600 dark:text-red-400 font-semibold">No</span>}</td>
                  <td className="px-4 py-2 text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-sm">{user.bio || '-'}</td>
                  <td className="px-4 py-2 text-sm">{user.github ? <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">GitHub</a> : '-'}</td>
                  <td className="px-4 py-2 text-sm">{user.linkedin ? <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">LinkedIn</a> : '-'}</td>
                  <td className="px-4 py-2 text-sm">{user.twitter ? <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">Twitter</a> : '-'}</td>
                  <td className="px-4 py-2 text-sm">{user.website ? <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:opacity-80">Website</a> : '-'}</td>
                  <td className="px-4 py-2 text-sm relative">
                    <ActionsMenu user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsersPage; 