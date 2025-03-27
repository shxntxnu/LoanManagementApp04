export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Borrower' | 'Loan Officer';
    department?: string;
    createdAt: string;
}

export interface Loan {
    id: string;
    borrowerId: string;
    amount: number;
    interestRate: number;
    term: number; // in months
    status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted';
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    loanId: string;
    amount: number;
    status: 'Pending' | 'Completed' | 'Failed';
    dueDate: string;
    paidAt?: string;
}

export interface LoanApplication {
    id: string;
    borrowerId: string;
    amount: number;
    purpose: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    updatedAt: string;
}

export interface LoanOfficer {
    id: string;
    name: string;
    email: string;
    department: string;
    createdAt: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'Admin' | 'Borrower' | 'Loan Officer';
}

export interface LoanRequest {
    amount: number;
    termMonths: number;
} 