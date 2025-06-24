import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  contact: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const login = async (contact: string, password: string) => {
  const response = await api.post('/auth/login', { username: contact, password });
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

export const createProblem = async (problemData: any) => {
  const response = await api.post('/problem/create', problemData);
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

export default api;