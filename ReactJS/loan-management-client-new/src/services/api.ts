import axios from 'axios';
import { AuthResponse, Loan, LoanRequest } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7214/api';
const LOAN_API_URL = process.env.REACT_APP_LOAN_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const loanApi = axios.create({
    baseURL: LOAN_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

loanApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'Admin' | 'Borrower' | 'Loan Officer';
}

// Auth Service
export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            console.log('Registration URL:', `${API_URL}/auth/register`);
            console.log('Registration data:', {
                ...data,
                password: '[REDACTED]',
                role: data.role
            });
            
            // Format the request data to match backend expectations
            const formattedData = {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role.replace(' ', '') // Remove spaces from role
            };

            const response = await api.post<AuthResponse>('/auth/register', formattedData);
            console.log('Registration response:', response.data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            console.error('Registration error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url,
                requestData: error.config?.data
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        const response = await api.get<AuthResponse>('/auth/me');
        return response.data;
    }
};

// Loan Service
export const loanService = {
    applyLoan: async (data: LoanRequest): Promise<Loan> => {
        const response = await loanApi.post<Loan>('/loans/apply', data);
        return response.data;
    },

    getLoan: async (id: string): Promise<Loan> => {
        const response = await loanApi.get<Loan>(`/loans/${id}`);
        return response.data;
    },

    getAllLoans: async (): Promise<Loan[]> => {
        const response = await loanApi.get<Loan[]>('/loans');
        return response.data;
    },

    getUserLoans: async (): Promise<Loan[]> => {
        const response = await loanApi.get<Loan[]>('/loans/user/loans');
        return response.data;
    },

    approveLoan: async (id: string): Promise<Loan> => {
        const response = await loanApi.put<Loan>(`/loans/${id}/approve`);
        return response.data;
    },

    rejectLoan: async (id: string): Promise<Loan> => {
        const response = await loanApi.put<Loan>(`/loans/${id}/reject`);
        return response.data;
    },
}; 