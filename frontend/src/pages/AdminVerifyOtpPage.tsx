import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminSendOtp, adminVerifyOtp, verifyToken, getAdminCsrfToken } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

const AdminVerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const email = location.state?.email || new URLSearchParams(window.location.search).get('email') || '';
  const forPasswordReset = location.state?.forPasswordReset;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      setOtpDigits((prev) => {
        const newOtp = [...prev];
        newOtp[index - 1] = '';
        return newOtp;
      });
      inputsRef.current[index - 1]?.focus();
    }
  };

  const otp = otpDigits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const csrfToken = await getAdminCsrfToken();
      await adminVerifyOtp(email, otp, csrfToken, forPasswordReset).then(async (res) => {
        setSuccess(true);
        if (!forPasswordReset && res.token) {
          localStorage.setItem('token', res.token);
          // Fetch admin info and set in context
          const verifyRes = await import('../utils/api').then(({ adminVerify }) => adminVerify());
          setUser(verifyRes.admin);
        }
        if (forPasswordReset) {
          setTimeout(() => navigate('/admin/reset-password', { state: { email } }), 1000);
        } else {
          setTimeout(() => navigate('/admin'), 1000);
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      await adminSendOtp(email);
      setResendMessage('OTP resent to your email.');
      setResendCooldown(30);
    } catch (err: any) {
      setResendMessage(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return <div className="flex items-center justify-center h-screen">No email provided for verification.</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-900 shadow-lg rounded-2xl px-8 pt-8 pb-10 w-full max-w-md border border-gray-700">
        <div className="flex flex-col items-center mb-6">
          <Shield className="h-12 w-12 text-blue-500 mb-2" />
          <h2 className="text-2xl font-bold mb-2 text-center text-white">Admin Email Verification</h2>
          <p className="mb-2 text-center text-gray-300">Enter the 6-digit OTP sent to <b>{email}</b></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-4">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputsRef.current[idx] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{1}"
                maxLength={1}
                className="w-12 h-12 text-2xl text-center border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(idx, e)}
                disabled={loading || success}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              className="text-blue-400 hover:underline text-sm disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
            </button>
            {resendMessage && <span className="text-xs text-green-400">{resendMessage}</span>}
          </div>
          {error && <div className="text-red-400 mb-2 text-center">{error}</div>}
          {success && (
            <div className="text-green-600 mb-2 text-center">
              {forPasswordReset ? 'OTP verified! Redirecting to password reset...' : 'Email verified! Redirecting...'}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading || otp.length !== 6 || success}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyOtpPage; 