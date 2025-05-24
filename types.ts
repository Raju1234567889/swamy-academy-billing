
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface Student {
  id: string; // UUID
  invoiceNumber: string;
  name: string;
  email: string;
  whatsAppNumber: string;
  address: string;
  course: string;
  amountPaid: number;
  pendingAmount: number;
  dateAdded: string; // ISO string
}

export interface AppSettings {
  instituteName: string;
  instituteAddress: string;
  instituteContact: string;
  logoUrl: string;
  signatureUrl: string;
  termsAndConditions: string;
}

export interface InvoiceData extends Student {
  // Combines student data, could add more invoice-specific fields if needed
}
