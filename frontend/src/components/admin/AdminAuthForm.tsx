import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSignup, adminLogin, getAdminCsrfToken, adminSendOtp } from '../../utils/api';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminAuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupData, setSignupData] = useState({ name: '', email: '', username: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [adminUnverifiedEmail, setAdminUnverifiedEmail] = useState<string | null>(null);
  const [showAdminResendLink, setShowAdminResendLink] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    getAdminCsrfToken().then(setCsrfToken);
  }, []);

  const handleTabChange = (tab: 'signup' | 'login') => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (signupData.password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const csrfToken = await getAdminCsrfToken();
      await adminSignup(signupData, csrfToken);
      await adminSendOtp(signupData.email, csrfToken);
      navigate('/admin/verify-otp', { state: { email: signupData.email } });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Signup failed.';
      setError(errorMsg);
      if (err.response?.data?.unverified && err.response?.data?.email) {
        setUnverifiedEmail(err.response.data.email);
        setShowResendLink(true);
      } else {
        setShowResendLink(false);
        setUnverifiedEmail(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowAdminResendLink(false);
    setAdminUnverifiedEmail(null);
    try {
      const freshCsrfToken = await getAdminCsrfToken();
      const res = await adminLogin(loginData.email, loginData.password, freshCsrfToken);
      if (res.admin && res.admin.status === 'pending') {
        setSuccess('Your account is pending approval. Please wait for account verification. You will receive an email once your account is approved.');
      } else if (res.admin && res.admin.status === 'verified') {
        setSuccess(res.message);
        setUser(res.admin);
        navigate('/admin');
      } else {
        setError('Login failed.');
      }
    } catch (err: any) {
      if (err.response?.data?.adminUnverified && err.response?.data?.email) {
        setError(err.response.data.error || 'Your email is not verified.');
        setAdminUnverifiedEmail(err.response.data.email);
        setShowAdminResendLink(true);
      } else {
        setError(err.response?.data?.error || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dynamic height for container (top fixed, bottom stretches)
  const baseSignupHeight = 'h-[630px]';
  const expandedSignupHeight = 'h-[700px]';
  const baseLoginHeight = 'h-[400px]';
  const expandedLoginHeight = 'h-[430px]';
  const containerHeight = activeTab === 'signup'
    ? (error || success ? expandedSignupHeight : baseSignupHeight)
    : (error || success ? expandedLoginHeight : baseLoginHeight);

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2">
      <div className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-all duration-0 flex flex-col justify-start ${containerHeight} mt-8`}>
        <div className="relative mb-8 h-10">
          <ul className="flex border-b border-gray-200 dark:border-gray-700 h-full">
            <li
              className={`flex-1 text-center cursor-pointer py-2 px-4 font-semibold relative flex items-center justify-center h-full`}
              onClick={() => handleTabChange('signup')}
            >
              <span className={activeTab === 'signup' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}>Sign Up</span>
            </li>
            <li
              className={`flex-1 text-center cursor-pointer py-2 px-4 font-semibold relative flex items-center justify-center h-full`}
              onClick={() => handleTabChange('login')}
            >
              <span className={activeTab === 'login' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}>Log In</span>
            </li>
          </ul>
          {/* Animated underline */}
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded transition-all duration-300"
            style={{
              width: '50%',
              transform: activeTab === 'signup' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Admin Sign Up</h2>
              {error && (
                <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700">
                  {error}
                  {showResendLink && unverifiedEmail && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                        onClick={async () => {
                          setLoading(true);
                          setError('');
                          try {
                            const csrfToken = await getAdminCsrfToken();
                            await adminSendOtp(unverifiedEmail, csrfToken);
                            navigate('/admin/verify-otp', { state: { email: unverifiedEmail } });
                          } catch (e) {
                            setError('Failed to resend OTP. Please try again.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Click here to verify your account
                      </button>
                    </div>
                  )}
                </div>
              )}
              {success && <div className="p-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-700">{success}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name<span className="text-red-500">*</span></label>
                <input type="text" name="name" value={signupData.name} onChange={handleSignupChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address<span className="text-red-500">*</span></label>
                <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username<span className="text-red-500">*</span></label>
                <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={signupData.password} onChange={handleSignupChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Signing Up...' : 'Get Started'}</button>
            </form>
          )}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Admin Log In</h2>
              {error && (
                <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700">
                  {error}
                  {showAdminResendLink && adminUnverifiedEmail && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
                        onClick={async () => {
                          setLoading(true);
                          setError('');
                          try {
                            const csrfToken = await getAdminCsrfToken();
                            await adminSendOtp(adminUnverifiedEmail, csrfToken);
                            navigate('/admin/verify-otp', { state: { email: adminUnverifiedEmail } });
                          } catch (e) {
                            setError('Failed to resend OTP. Please try again.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Click here to verify your account
                      </button>
                    </div>
                  )}
                </div>
              )}
              {success && <div className="p-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-700">{success}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address<span className="text-red-500">*</span></label>
                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password<span className="text-red-500">*</span></label>
                <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? 'Logging In...' : 'Log In'}</button>
              <button
                type="button"
                className="w-full mt-2 px-4 bg-transparent text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium rounded-lg transition-colors border border-transparent"
                onClick={() => navigate('/admin/forgot-password')}
              >
                Forgot Password?
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuthForm; 