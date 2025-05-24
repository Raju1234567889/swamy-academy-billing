
import { Student } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';

export const generateInvoiceNumber = (): string => {
  let counter = parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICE_COUNTER) || '0', 10);
  counter += 1;
  localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICE_COUNTER, counter.toString());
  const year = new Date().getFullYear();
  return `SA-${year}-${String(counter).padStart(4, '0')}`;
};

export const formatDate = (isoDateString: string): string => {
  return new Date(isoDateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export const generateWhatsAppLink = (student: Student, settings: import('../types').AppSettings): string => {
  const message = `Dear ${student.name},\n\nThank you for your payment at ${settings.instituteName}.\n\nInvoice Details:\nNumber: ${student.invoiceNumber}\nCourse: ${student.course}\nAmount Paid: ${formatCurrency(student.amountPaid)}\nPending Amount: ${formatCurrency(student.pendingAmount)}\n\nRegards,\n${settings.instituteName}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${student.whatsAppNumber.startsWith('+') ? student.whatsAppNumber.substring(1) : student.whatsAppNumber}?text=${encodedMessage}`;
};

export const exportToCSV = (students: Student[], fileName: string = 'student_data.csv'): void => {
  if (students.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = ['Invoice Number', 'Name', 'Email', 'WhatsApp Number', 'Address', 'Course', 'Amount Paid (INR)', 'Pending Amount (INR)', 'Date Added', 'Status'];
  const rows = students.map(s => [
    s.invoiceNumber,
    s.name,
    s.email,
    s.whatsAppNumber,
    `"${s.address.replace(/"/g, '""')}"`, // Escape quotes in address
    s.course,
    s.amountPaid,
    s.pendingAmount,
    formatDate(s.dateAdded),
    s.pendingAmount === 0 ? 'Paid' : 'Pending'
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link);
};

// Debounce function (simplified)
export function debounce<F extends (...args: any[]) => void>(func: F, waitFor: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
