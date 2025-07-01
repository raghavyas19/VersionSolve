import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, uploadUserProfilePhoto, changeUserPassword } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe, FaPencilAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import Modal from '../components/common/Modal';
import { CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

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
  createdAt: string;
  theme: string;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  // Popup notification state
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupProgress, setPopupProgress] = useState(100);

  useEffect(() => {
    if (username) {
      setLoading(true);
      fetchUserProfile(username)
        .then(data => {
          setProfile(data);
          setForm(data);
          setLoading(false);
        })
        .catch(() => {
          setError('User not found');
          setLoading(false);
        });
    }
  }, [username]);

  // Save theme preference to backend when toggled
  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    if (isOwnProfile && profile) {
      try {
        await updateUserProfile(profile.username, { theme: newTheme });
      } catch {}
    }
  };

  const isOwnProfile = user && profile && user.username === profile.username;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Assume image is uploaded elsewhere and URL is pasted for now
      // You can integrate upload logic here
      setForm({ ...form, profilePhotoUrl: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleFieldSave = async (field: string) => {
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      const updateData: any = {};
      let value = form[field as keyof UserProfile];
      // Auto-prepend https:// for social links if not present
      if (["github", "linkedin", "twitter", "website"].includes(field) && value) {
        if (!/^https?:\/\//i.test(value)) {
          value = 'https://' + value;
        }
      }
      updateData[field] = value;
      const res = await updateUserProfile(profile.username, updateData);
      setProfile(res.user);
      setEditingField(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldCancel = (field: string) => {
    setForm({ ...form, [field]: profile ? profile[field as keyof UserProfile] : '' });
    setEditingField(null);
  };

  // Handle image file selection
  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Handle image upload to backend
  const handleImageUpload = async () => {
    if (!selectedImage || !profile) return;
    setUploading(true);
    setError('');
    try {
      const data = await uploadUserProfilePhoto(profile.username, selectedImage);
      setProfile(data.user);
      setForm(data.user);
      setUser(data.user);
      setShowImageModal(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Notification logic (modeled after ProblemCodeEditor)
  const showNotification = (message: string, type: 'success' | 'error') => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupProgress(100);
    setShowPopup(true);
    const duration = 4000;
    const interval = 50;
    const steps = duration / interval;
    const decrement = 100 / steps;
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      const remaining = Math.max(0, 100 - (currentStep * decrement));
      setPopupProgress(remaining);
      if (currentStep >= steps || remaining <= 0) {
        clearInterval(progressInterval);
        setShowPopup(false);
      }
    }, interval);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-4">
        <div className="relative group">
          {form.profilePhotoUrl ? (
            <img
              src={form.profilePhotoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-blue-400 dark:border-blue-500 bg-gray-100 dark:bg-gray-700"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-blue-400 dark:border-blue-500">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="28" r="16" fill="#CBD5E1" />
                <ellipse cx="40" cy="60" rx="24" ry="14" fill="#CBD5E1" />
              </svg>
            </div>
          )}
          {isOwnProfile && (
            <button
              className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-300 dark:border-gray-600 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowImageModal(true)}
              title={form.profilePhotoUrl ? 'Change or remove photo' : 'Upload photo'}
            >
              <FaPencilAlt size={14} />
            </button>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-mono">@{profile.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 mb-2">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <span className="font-semibold">Email:</span> {profile.email}
        </div>
        {isOwnProfile && (
          <button
            className="ml-0 sm:ml-8 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm shadow border border-gray-300 dark:border-gray-600 mt-2 sm:mt-0"
            onClick={() => setShowChangePasswordModal(true)}
          >
            Change Password
          </button>
        )}
      </div>
      {/* Bio field with inline edit */}
      <div className="mt-4 flex items-center gap-2">
        <span className="font-semibold">Bio:</span>
        {editingField === 'bio' ? (
          <div className="flex flex-col w-full max-w-xl">
            <textarea
              name="bio"
              value={form.bio || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Tell us about yourself"
            />
            <div className="flex gap-2 mt-1">
              <button type="button" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleFieldSave('bio')} disabled={saving}>Save</button>
              <button type="button" className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => handleFieldCancel('bio')} disabled={saving}>Cancel</button>
            </div>
          </div>
        ) : (
          <span className="flex items-center text-base text-gray-800 dark:text-gray-200">
            {profile.bio || <span className="text-gray-400">No bio</span>}
            {isOwnProfile && editingField !== 'bio' && (
              <button className="ml-2 text-blue-600 dark:text-blue-300 hover:underline" onClick={() => setEditingField('bio')} title="Edit bio"><FaPencilAlt size={10} /></button>
            )}
          </span>
        )}
      </div>
      {/* Socials Section */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Socials</h3>
        <div className="flex flex-col gap-4 items-start w-full">
          {/* GitHub */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <FaGithub size={20} color={theme === 'dark' ? '#e5e7eb' : '#374151'} />
              <span className="font-medium">GitHub:</span>
            </div>
            <div className="flex flex-col w-full mt-1 sm:mt-0">
              {editingField === 'github' ? (
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2">
                  <input type="text" name="github" value={form.github || ''} onChange={handleChange} className="w-full sm:w-72 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="GitHub URL" />
                  <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-2">
                    <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleFieldSave('github')} disabled={saving}>Save</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => handleFieldCancel('github')} disabled={saving}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full justify-between">
                  {profile.github ? (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline break-all">{profile.github}</a>
                  ) : (
                    <span className="text-gray-400">Not added</span>
                  )}
                  {isOwnProfile && editingField !== 'github' && (
                    <button className="ml-2 text-blue-600 dark:text-blue-300 hover:underline" onClick={() => setEditingField('github')} title="Edit GitHub"><FaPencilAlt size={12} /></button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* LinkedIn */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <FaLinkedin size={20} color={theme === 'dark' ? '#60a5fa' : '#1d4ed8'} />
              <span className="font-medium">LinkedIn:</span>
            </div>
            <div className="flex flex-col w-full mt-1 sm:mt-0">
              {editingField === 'linkedin' ? (
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2">
                  <input type="text" name="linkedin" value={form.linkedin || ''} onChange={handleChange} className="w-full sm:w-72 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="LinkedIn URL" />
                  <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-2">
                    <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleFieldSave('linkedin')} disabled={saving}>Save</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => handleFieldCancel('linkedin')} disabled={saving}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full justify-between">
                  {profile.linkedin ? (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline break-all">{profile.linkedin}</a>
                  ) : (
                    <span className="text-gray-400">Not added</span>
                  )}
                  {isOwnProfile && editingField !== 'linkedin' && (
                    <button className="ml-2 text-blue-600 dark:text-blue-300 hover:underline" onClick={() => setEditingField('linkedin')} title="Edit LinkedIn"><FaPencilAlt size={12} /></button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Twitter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <FaTwitter size={20} color={'#38bdf8'} />
              <span className="font-medium">Twitter:</span>
            </div>
            <div className="flex flex-col w-full mt-1 sm:mt-0">
              {editingField === 'twitter' ? (
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2">
                  <input type="text" name="twitter" value={form.twitter || ''} onChange={handleChange} className="w-full sm:w-72 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Twitter URL" />
                  <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-2">
                    <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleFieldSave('twitter')} disabled={saving}>Save</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => handleFieldCancel('twitter')} disabled={saving}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full justify-between">
                  {profile.twitter ? (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline break-all">{profile.twitter}</a>
                  ) : (
                    <span className="text-gray-400">Not added</span>
                  )}
                  {isOwnProfile && editingField !== 'twitter' && (
                    <button className="ml-2 text-blue-600 dark:text-blue-300 hover:underline" onClick={() => setEditingField('twitter')} title="Edit Twitter"><FaPencilAlt size={12} /></button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Website */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <FaGlobe size={20} color={theme === 'dark' ? '#4ade80' : '#16a34a'} />
              <span className="font-medium">Website:</span>
            </div>
            <div className="flex flex-col w-full mt-1 sm:mt-0">
              {editingField === 'website' ? (
                <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2">
                  <input type="text" name="website" value={form.website || ''} onChange={handleChange} className="w-full sm:w-72 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Personal website" />
                  <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-2">
                    <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleFieldSave('website')} disabled={saving}>Save</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600" onClick={() => handleFieldCancel('website')} disabled={saving}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center w-full justify-between">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline break-all">{profile.website}</a>
                  ) : (
                    <span className="text-gray-400">Not added</span>
                  )}
                  {isOwnProfile && editingField !== 'website' && (
                    <button className="ml-2 text-blue-600 dark:text-blue-300 hover:underline" onClick={() => setEditingField('website')} title="Edit Website"><FaPencilAlt size={12} /></button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Theme toggle and actions */}
      <div className="mt-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <span className="font-semibold">Theme Prefe:</span>
        <button
          onClick={handleThemeToggle}
          className={
            theme === 'dark'
              ? 'px-2 py-0.5 rounded bg-gray-700 text-white border border-gray-500 ml-2 text-sm'
              : 'px-2 py-0.5 rounded bg-gray-200 text-gray-900 border border-gray-300 ml-2 text-sm'
          }
        >
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
      {/* Image upload modal */}
      <Modal isOpen={showImageModal} onClose={() => { setShowImageModal(false); setSelectedImage(null); setImagePreview(null); }} title={form.profilePhotoUrl ? 'Change or Remove Photo' : 'Upload Photo'}>
        <div className="flex flex-col items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-2 border-blue-400 dark:border-blue-500" />
          ) : form.profilePhotoUrl ? (
            <img src={form.profilePhotoUrl} alt="Current" className="w-32 h-32 rounded-full object-cover border-2 border-blue-400 dark:border-blue-500" />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-blue-400 dark:border-blue-500">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="28" r="16" fill="#CBD5E1" />
                <ellipse cx="40" cy="60" rx="24" ry="14" fill="#CBD5E1" />
              </svg>
            </div>
          )}
          <div
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('profile-image-input')?.click()}
          >
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) handleImageSelect(e.target.files[0]);
              }}
            />
            <p className="text-gray-600 dark:text-gray-300">Drag and drop or <span className="text-blue-600 dark:text-blue-300 underline cursor-pointer">select from your computer</span></p>
          </div>
          <div className="flex gap-2 mt-2">
            {form.profilePhotoUrl && !imagePreview && (
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  if (!profile) return;
                  setSaving(true);
                  setError('');
                  try {
                    const res = await updateUserProfile(profile.username, { profilePhotoUrl: '' });
                    setProfile(res.user);
                    setForm(res.user);
                    setShowImageModal(false);
                  } catch (err: any) {
                    setError(err.message || 'Remove failed');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                Remove Image
              </button>
            )}
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleImageUpload}
              disabled={!selectedImage || uploading}
            >
              {uploading ? 'Uploading...' : 'Save'}
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => { setSelectedImage(null); setImagePreview(null); }}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </div>
      </Modal>
      {/* Change Password Modal */}
      <Modal isOpen={showChangePasswordModal} onClose={() => { setShowChangePasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); setPasswordError(''); }} title="Change Password" centered>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setPasswordError('');
            if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
              setPasswordError('All fields are required.');
              return;
            }
            if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
              setPasswordError('New passwords do not match.');
              return;
            }
            setPasswordLoading(true);
            try {
              // @ts-ignore: api function will be added
              await changeUserPassword(profile.username, passwordForm.currentPassword, passwordForm.newPassword);
              setShowChangePasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
              setPasswordError('');
              showNotification('Password changed successfully!', 'success');
            } catch (err: any) {
              setPasswordError(err?.response?.data?.message || err?.message || 'Failed to change password');
            } finally {
              setPasswordLoading(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                tabIndex={0}
                aria-label={showPassword.current ? 'Hide current password' : 'Show current password'}
                onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
              >
                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                tabIndex={0}
                aria-label={showPassword.new ? 'Hide new password' : 'Show new password'}
                onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
              >
                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={passwordForm.confirmNewPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                tabIndex={0}
                aria-label={showPassword.confirm ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
              >
                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {passwordError && <div className="text-red-500 text-center text-sm">{passwordError}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => { setShowChangePasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); setPasswordError(''); }}
              disabled={passwordLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Popup Notification */}
      {showPopup && (
        <div className={clsx(
          'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border-2 font-semibold text-sm transition-all duration-300 min-w-[300px]',
          popupType === 'success'
            ? 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700 text-white'
            : 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700 text-white'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {popupType === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <XCircle className="h-5 w-5 text-white" />
              )}
              <span>{popupMessage}</span>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <XCircle className="h-4 w-4 text-white" />
            </button>
          </div>
          {/* Animated Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20 rounded-b-lg overflow-hidden">
            <div 
              className={clsx(
                'h-full transition-all duration-75 ease-linear',
                popupType === 'success' ? 'bg-white' : 'bg-white'
              )}
              style={{ width: `${popupProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 