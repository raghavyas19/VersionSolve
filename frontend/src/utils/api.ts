import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define types for compileCode and runTestCases
interface CompileResult {
  success: boolean;
  error?: string;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export const register = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { username: email, password });
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

export const googleLogin = () => {
  window.location.href = import.meta.env.VITE_BACKEND_OAUTH_URL; // Initiate Google OAuth flow
};

export const fetchProblems = async () => {
  const response = await api.get('/problem/list');
  return response.data;
};

export const fetchProblemById = async (id: string) => {
  const response = await api.get(`/problem/${id}`);
  return response.data;
};

export const createProblem = async (problemData: any, csrfToken?: string) => {
  const response = await api.post('/problem/create', problemData, csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined);
  return response.data;
};

export const compileCode = async (code: string, language: string): Promise<CompileResult> => {
  try {
    const response = await api.post('/code/compile', { code, language });
    return {
      success: response.data.success,
      error: response.data.error || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Compilation failed',
    };
  }
};

export const runTestCases = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<ExecutionResult[]> => {
  try {
    const response = await api.post('/code/run', { code, language, testCases });
    return response.data.results;
  } catch (error: any) {
    return [
      {
        success: false,
        error: error.response?.data?.message || error.message || 'Execution failed',
      },
    ];
  }
};

export const fetchUserSubmissions = async (problemId?: string, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams();
  if (problemId) params.append('problemId', problemId);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await api.get(`/submission?${params.toString()}`);
  return response.data;
};

export const adminSignup = async (data: {
  name: string;
  email: string;
  password: string;
}, csrfToken?: string) => {
  const response = await api.post('/admin/auth/signup', data, csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined);
  return response.data;
};

export const adminLogin = async (email: string, password: string, csrfToken?: string) => {
  const response = await api.post('/admin/auth/login', { email, password }, csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined);
  return response.data;
};

export const adminVerify = async () => {
  const response = await api.get('/admin/verify');
  return response.data;
};

export const adminLogout = async () => {
  const response = await api.post('/admin/logout');
  return response.data;
};

export const getAdminCsrfToken = async () => {
  const response = await api.get('/admin/csrf-token');
  return response.data.csrfToken;
};

export const sendOtp = async (email: string, forPasswordReset?: boolean) => {
  const response = await api.post('/auth/send-otp', { email, ...(forPasswordReset ? { forPasswordReset: true } : {}) });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string, forPasswordReset?: boolean) => {
  const response = await api.post('/auth/verify-otp', { email, otp, ...(forPasswordReset ? { forPasswordReset: true } : {}) });
  return response.data;
};

export const adminSendOtp = async (email: string, csrfToken?: string, forPasswordReset?: boolean) => {
  const response = await api.post(
    '/admin/auth/send-otp',
    { email, ...(forPasswordReset ? { forPasswordReset: true } : {}) },
    csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined
  );
  return response.data;
};

export const adminVerifyOtp = async (email: string, otp: string, csrfToken?: string, forPasswordReset?: boolean) => {
  const response = await api.post(
    '/admin/auth/verify-otp',
    { email, otp, ...(forPasswordReset ? { forPasswordReset: true } : {}) },
    csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined
  );
  return response.data;
};

// Fetch solved problem IDs for the authenticated user
export const fetchSolvedProblemIds = async (): Promise<string[]> => {
  const response = await api.get('/submission/solved');
  return response.solvedProblemIds || [];
};

export const resetPassword = async (email: string, password: string) => {
  const response = await api.post('/auth/reset-password', { email, password });
  return response.data;
};

export const adminResetPassword = async (email: string, password: string, csrfToken?: string) => {
  const response = await api.post(
    '/admin/auth/reset-password',
    { email, password },
    csrfToken ? { headers: { 'x-csrf-token': csrfToken } } : undefined
  );
  return response.data;
};

export default api;