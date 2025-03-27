import { api } from './api';
import { User, LoanOfficer } from '../types';

export const userService = {
    // Get current user profile
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<User> => {
        const response = await api.put<User>('/users/me', data);
        return response.data;
    },

    // Get all users (for admin)
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    // Get all loan officers (for admin)
    getLoanOfficers: async (): Promise<LoanOfficer[]> => {
        const response = await api.get<LoanOfficer[]>('/users/loan-officers');
        return response.data;
    },

    // Create a new loan officer (for admin)
    createLoanOfficer: async (data: {
        name: string;
        email: string;
        password: string;
        department: string;
    }): Promise<LoanOfficer> => {
        const response = await api.post<LoanOfficer>('/users/loan-officers', data);
        return response.data;
    },

    // Update user role (for admin)
    updateUserRole: async (userId: string, role: 'Admin' | 'Borrower' | 'Loan Officer'): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}/role`, { role });
        return response.data;
    }
}; 