import { api } from './api';
import { Loan, LoanApplication, Payment } from '../types';

export const loanService = {
    // Get all loans for the current user
    getMyLoans: async (): Promise<Loan[]> => {
        const response = await api.get<Loan[]>('/loans/my-loans');
        return response.data;
    },

    // Get all loans (for admin/loan officer)
    getAllLoans: async (): Promise<Loan[]> => {
        const response = await api.get<Loan[]>('/loans');
        return response.data;
    },

    // Get a specific loan by ID
    getLoanById: async (id: string): Promise<Loan> => {
        const response = await api.get<Loan>(`/loans/${id}`);
        return response.data;
    },

    // Create a new loan application
    createLoanApplication: async (data: {
        amount: number;
        purpose: string;
    }): Promise<LoanApplication> => {
        const response = await api.post<LoanApplication>('/loans/applications', data);
        return response.data;
    },

    // Get loan payments
    getLoanPayments: async (loanId: string): Promise<Payment[]> => {
        const response = await api.get<Payment[]>(`/loans/${loanId}/payments`);
        return response.data;
    },

    // Make a loan payment
    makePayment: async (loanId: string, amount: number): Promise<Payment> => {
        const response = await api.post<Payment>(`/loans/${loanId}/payments`, { amount });
        return response.data;
    },

    // Approve a loan application (for loan officer)
    approveLoan: async (loanId: string, data: {
        interestRate: number;
        term: number;
    }): Promise<Loan> => {
        const response = await api.post<Loan>(`/loans/${loanId}/approve`, data);
        return response.data;
    },

    // Reject a loan application (for loan officer)
    rejectLoan: async (loanId: string, reason: string): Promise<void> => {
        await api.post(`/loans/${loanId}/reject`, { reason });
    }
}; 