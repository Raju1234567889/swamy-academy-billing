
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole, Student, AppSettings, InvoiceData } from './types';
import { COURSES, DEFAULT_SETTINGS, LOCAL_STORAGE_KEYS, APP_NAME, ICONS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { Button, Input, Select, Textarea, Modal, Alert } from './components/uiElements';
import { InvoiceTemplate } from './components/shared/InvoiceTemplate';
import { generatePdfFromElement } from './services/pdfService';
import { generateInvoiceNumber, formatDate, formatCurrency, generateWhatsAppLink, exportToCSV, debounce } from './utils/helpers';

// --- Component Definitions (Moved Outside App Component) ---

// Settings Modal Component
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModalComponent: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentSettings({ ...currentSettings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Settings" size="2xl" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="ml-2">Save Settings</Button>
      </>
    }>
      <div className="space-y-4">
        <Input label="Institute Name" name="instituteName" value={currentSettings.instituteName} onChange={handleChange} />
        <Input label="Institute Address" name="instituteAddress" value={currentSettings.instituteAddress} onChange={handleChange} />
        <Input label="Institute Contact" name="instituteContact" value={currentSettings.instituteContact} onChange={handleChange} />
        <Input label="Logo URL" name="logoUrl" value={currentSettings.logoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" />
        <Input label="Signature URL" name="signatureUrl" value={currentSettings.signatureUrl} onChange={handleChange} placeholder="https://example.com/signature.png" />
        <Textarea label="Terms & Conditions" name="termsAndConditions" value={currentSettings.termsAndConditions} onChange={handleChange} rows={4} />
      </div>
    </Modal>
  );
};


// Student Form (for Admin Add/Edit and Employee Add)
interface StudentFormProps {
  onSubmit: (studentData: Omit<Student, 'id' | 'invoiceNumber' | 'dateAdded'>, studentId?: string) => void;
  onCancel: () => void;
  initialData?: Student | null;
  isEmployeeView?: boolean;
}

const StudentFormComponent: React.FC<StudentFormProps> = ({ onSubmit, onCancel, initialData, isEmployeeView = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsAppNumber: '',
    address: '',
    course: COURSES[0] || '',
    amountPaid: '0',
    pendingAmount: '0',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        whatsAppNumber: initialData.whatsAppNumber ?? '',
        address: initialData.address ?? '',
        course: initialData.course ?? (COURSES[0] || ''),
        amountPaid: String(initialData.amountPaid ?? 0),
        pendingAmount: String(initialData.pendingAmount ?? 0),
      });
    } else {
       setFormData({
        name: '',
        email: '',
        whatsAppNumber: '+91', // Default to +91 for new entries
        address: '',
        course: COURSES[0] || '',
        amountPaid: '0',
        pendingAmount: '0',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.whatsAppNumber.trim()) newErrors.whatsAppNumber = "WhatsApp number is required.";
    else if (!/^\+?[1-9]\d{1,14}$/.test(formData.whatsAppNumber.replace(/\s+/g, ''))) newErrors.whatsAppNumber = "Invalid WhatsApp number (e.g., +919876543210 or 9876543210). Ensure it starts with '+' and country code or just the number if local.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.course.trim()) newErrors.course = "Course is required.";
    if (isNaN(parseFloat(formData.amountPaid)) || parseFloat(formData.amountPaid) < 0) newErrors.amountPaid = "Valid amount paid is required.";
    if (isNaN(parseFloat(formData.pendingAmount)) || parseFloat(formData.pendingAmount) < 0) newErrors.pendingAmount = "Valid pending amount is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'whatsAppNumber') {
      if (value.startsWith('+')) {
        value = '+' + value.substring(1).replace(/\D/g, '');
      } else {
        value = value.replace(/\D/g, '');
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amountPaid: parseFloat(formData.amountPaid),
        pendingAmount: parseFloat(formData.pendingAmount),
      }, initialData?.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Student Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
      <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
      <Input 
        label="WhatsApp Number (e.g., +91XXXXXXXXXX)" 
        name="whatsAppNumber" 
        value={formData.whatsAppNumber} 
        onChange={handleChange} 
        error={errors.whatsAppNumber} 
        required 
        maxLength={15}
        inputMode="tel"
      />
      <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} required rows={3} />
      <Select label="Course" name="course" value={formData.course} onChange={handleChange} error={errors.course} options={COURSES.map(c => ({ value: c, label: c }))} required />
      <Input label="Amount Paid (INR)" name="amountPaid" type="number" step="0.01" value={formData.amountPaid} onChange={handleChange} error={errors.amountPaid} required />
      <Input label="Pending Amount (INR)" name="pendingAmount" type="number" step="0.01" value={formData.pendingAmount} onChange={handleChange} error={errors.pendingAmount} required />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update Entry' : 'Add Entry'}</Button>
      </div>
    </form>
  );
};

// Invoice Preview Modal
interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  settings: AppSettings;
}
const InvoicePreviewModalComponent: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, student, settings }) => {
  if (!student) return null;

  const invoiceIdForPdf = `invoice-preview-${student.id}`;

  const handleDownloadPdf = async () => {
    await generatePdfFromElement(invoiceIdForPdf, `Invoice-${student.invoiceNumber}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const link = generateWhatsAppLink(student, settings);
    window.open(link, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice: ${student.invoiceNumber}`} size="3xl" footer={
      <>
        <Button variant="ghost" onClick={handleShareWhatsApp} leftIcon={ICONS.whatsapp()}>Share on WhatsApp</Button>
        <Button onClick={handleDownloadPdf} className="ml-2" leftIcon={ICONS.download()}>Download PDF</Button>
        <Button variant="secondary" onClick={onClose} className="ml-2">Close</Button>
      </>
    }>
      <div className="max-h-[70vh] overflow-y-auto p-1">
         <InvoiceTemplate invoice={student} settings={settings} idForPdf={invoiceIdForPdf} />
      </div>
    </Modal>
  );
};


// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
const ConfirmModalComponent: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} className="ml-2">Confirm</Button>
      </>
    }>
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
};

// Admin Panel
interface AdminPanelProps {
  searchInputText: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: 'all' | 'paid' | 'pending';
  onStatusFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filteredStudents: Student[];
  onAddStudentClick: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
  onViewInvoiceClick: (student: Student) => void;
  onEditStudentClick: (student: Student) => void;
  onDeleteStudentClick: (student: Student) => void;
  
  isStudentFormModalOpen: boolean;
  closeStudentFormModal: () => void;
  editingStudentData: Student | null;
  handleStudentFormSubmit: (studentData: Omit<Student, 'id' | 'invoiceNumber' | 'dateAdded'>, studentId?: string) => void;
}

const AdminPanelComponent: React.FC<AdminPanelProps> = (props) => {
  const {
    searchInputText, handleSearchChange, statusFilter, onStatusFilterChange,
    filteredStudents, onAddStudentClick, onSettingsClick, onExportClick,
    onViewInvoiceClick, onEditStudentClick, onDeleteStudentClick,
    isStudentFormModalOpen, closeStudentFormModal, editingStudentData, handleStudentFormSubmit
  } = props;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={onAddStudentClick} leftIcon={ICONS.add()} variant="primary">Add Student</Button>
          <Button onClick={onSettingsClick} leftIcon={ICONS.settings()} variant="secondary">Settings</Button>
          <Button onClick={onExportClick} leftIcon={ICONS.export()} variant="secondary">Export CSV</Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row gap-4 items-center">
        <Input 
          id="admin-search-input"
          placeholder="Search by name, email, invoice #, course..."
          value={searchInputText} 
          onChange={handleSearchChange}
          className="flex-grow"
          aria-label="Search students"
        />
        <Select 
          label="Filter by Status:"
          value={statusFilter} 
          onChange={onStatusFilterChange}
          options={[
            { value: 'all', label: 'All' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
          ]}
          className="w-full sm:w-auto"
          aria-label="Filter students by payment status"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Invoice #', 'Name', 'Course', 'Amount Paid', 'Pending', 'Status', 'Date Added', 'Actions'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length > 0 ? filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{student.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(student.amountPaid)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(student.pendingAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.pendingAmount === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.pendingAmount === 0 ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(student.dateAdded)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                  <Button size="sm" variant="ghost" onClick={() => onViewInvoiceClick(student)} title="View Invoice">{ICONS.invoice("w-4 h-4")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => onEditStudentClick(student)} title="Edit">{ICONS.edit("w-4 h-4")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => onDeleteStudentClick(student)} title="Delete" className="text-red-600 hover:text-red-800">{ICONS.delete("w-4 h-4")}</Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No student records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isStudentFormModalOpen && (
          <Modal isOpen={isStudentFormModalOpen} onClose={closeStudentFormModal} title={editingStudentData ? 'Edit Student Entry' : 'Add New Student Entry'} size="lg">
            <StudentFormComponent
              onSubmit={handleStudentFormSubmit} 
              onCancel={closeStudentFormModal} 
              initialData={editingStudentData}
            />
          </Modal>
        )}
    </div>
  );
};

// Employee Panel
interface EmployeePanelProps {
  settings: AppSettings;
  handleStudentFormSubmit: (studentData: Omit<Student, 'id' | 'invoiceNumber' | 'dateAdded'>, studentId?: string) => void;
  onStudentFormCancel: () => void;
}
const EmployeePanelComponent: React.FC<EmployeePanelProps> = (props) => {
   const { settings, handleStudentFormSubmit, onStudentFormCancel } = props;
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <div className="text-center mb-8">
           {settings.logoUrl && <img src={settings.logoUrl} alt="Institute Logo" className="h-12 mx-auto mb-2 object-contain" />}
          <h1 className="text-2xl font-bold text-gray-800">New Billing Entry</h1>
          <p className="text-sm text-gray-500">Enter student billing details below.</p>
        </div>
        <StudentFormComponent
          onSubmit={handleStudentFormSubmit} 
          onCancel={onStudentFormCancel} 
          isEmployeeView={true}
        />
      </div>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useLocalStorage<UserRole>('swamyAcademy_userRole', UserRole.ADMIN);
  const [students, setStudents] = useLocalStorage<Student[]>(LOCAL_STORAGE_KEYS.STUDENTS, []);
  const [settings, setSettings] = useLocalStorage<AppSettings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputText, setSearchInputText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [viewingStudentInvoice, setViewingStudentInvoice] = useState<Student | null>(null);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleStudentSubmit = useCallback((studentData: Omit<Student, 'id' | 'invoiceNumber' | 'dateAdded'>, studentId?: string) => {
    if (studentId) {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData, dateAdded: s.dateAdded, invoiceNumber: s.invoiceNumber } : s));
      setAlertMessage({type: 'success', text: 'Student entry updated successfully!'});
    } else {
      const newStudent: Student = {
        ...studentData,
        id: crypto.randomUUID(),
        invoiceNumber: generateInvoiceNumber(),
        dateAdded: new Date().toISOString(),
      };
      setStudents(prev => [newStudent, ...prev]);
      setAlertMessage({type: 'success', text: 'Student entry added successfully!'});
      if(currentUserRole === UserRole.EMPLOYEE) {
        setViewingStudentInvoice(newStudent);
        setIsInvoiceModalOpen(true);
      }
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  }, [currentUserRole, setStudents, setAlertMessage, setIsInvoiceModalOpen, setViewingStudentInvoice, setIsStudentModalOpen, setEditingStudent]);


  const openStudentModal = useCallback((student?: Student) => {
    setEditingStudent(student || null);
    setIsStudentModalOpen(true);
  }, [setEditingStudent, setIsStudentModalOpen]);

  const handleDeleteStudent = useCallback((student: Student) => {
    setStudentToDelete(student);
    setIsConfirmDeleteModalOpen(true);
  }, [setStudentToDelete, setIsConfirmDeleteModalOpen]);

  const confirmDeleteStudent = useCallback(() => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setAlertMessage({type: 'success', text: 'Student entry deleted successfully!'});
    }
    setIsConfirmDeleteModalOpen(false);
    setStudentToDelete(null);
  }, [studentToDelete, setStudents, setAlertMessage, setIsConfirmDeleteModalOpen, setStudentToDelete]);

  const handleViewInvoice = useCallback((student: Student) => {
    setViewingStudentInvoice(student);
    setIsInvoiceModalOpen(true);
  }, [setViewingStudentInvoice, setIsInvoiceModalOpen]);
  
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    setAlertMessage({type: 'success', text: 'Settings saved successfully!'});
  }, [setSettings, setAlertMessage]);

  const debouncedSetSearchFilterTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    [setSearchTerm] 
  );
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = e.target.value;
    setSearchInputText(newSearchText); 
    debouncedSetSearchFilterTerm(newSearchText); 
  }, [setSearchInputText, debouncedSetSearchFilterTerm]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
          student.name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.invoiceNumber.toLowerCase().includes(searchLower) ||
          student.course.toLowerCase().includes(searchLower)
        );
      })
      .filter(student => {
        if (statusFilter === 'all') return true;
        const isPaid = student.pendingAmount === 0;
        return statusFilter === 'paid' ? isPaid : !isPaid;
      })
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [students, searchTerm, statusFilter]);

  const handleExportData = useCallback(() => {
    exportToCSV(filteredStudents, `swamy_academy_students_${new Date().toISOString().split('T')[0]}.csv`);
    setAlertMessage({ type: 'success', text: 'Data exported to CSV.' });
  }, [filteredStudents, setAlertMessage]);

  // Callbacks for AdminPanelComponent
  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'all' | 'paid' | 'pending');
  }, [setStatusFilter]);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, [setIsSettingsModalOpen]);
  
  const closeStudentFormModalForAdmin = useCallback(() => {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  }, [setIsStudentModalOpen, setEditingStudent]);
  
  const handleEmployeeFormCancel = useCallback(() => {
    // Clear form if needed, or just show a message. 
    // For now, the form will reset if the modal is closed and reopened.
    setAlertMessage({type: 'info', text: 'Entry cancelled.'});
  }, [setAlertMessage]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {settings.logoUrl && <img src={settings.logoUrl} alt={`${settings.instituteName} Logo`} className="h-10 w-auto mr-3 object-contain" />}
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">{APP_NAME}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Role:</span>
            <Select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              options={[
                { value: UserRole.ADMIN, label: 'Admin' },
                { value: UserRole.EMPLOYEE, label: 'Employee' },
              ]}
              className="w-32 text-sm"
              aria-label="Select user role"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-0 sm:px-4 py-4 sm:py-8">
        {alertMessage && <div className="px-4"><Alert type={alertMessage.type} message={alertMessage.text} onClose={() => setAlertMessage(null)} /></div>}
        {currentUserRole === UserRole.ADMIN ? (
          <AdminPanelComponent
            searchInputText={searchInputText}
            handleSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            filteredStudents={filteredStudents}
            onAddStudentClick={() => openStudentModal()} 
            onSettingsClick={handleSettingsClick}
            onExportClick={handleExportData}
            onViewInvoiceClick={handleViewInvoice}
            onEditStudentClick={openStudentModal} 
            onDeleteStudentClick={handleDeleteStudent}
            
            isStudentFormModalOpen={isStudentModalOpen}
            closeStudentFormModal={closeStudentFormModalForAdmin}
            editingStudentData={editingStudent}
            handleStudentFormSubmit={handleStudentSubmit}
          />
        ) : (
          <EmployeePanelComponent
            settings={settings}
            handleStudentFormSubmit={handleStudentSubmit}
            onStudentFormCancel={handleEmployeeFormCancel}
          />
        )}
      </main>

      <SettingsModalComponent
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        settings={settings} 
        onSave={handleSaveSettings} 
      />
      <InvoicePreviewModalComponent
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        student={viewingStudentInvoice}
        settings={settings}
      />
      <ConfirmModalComponent
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDeleteStudent}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the entry for ${studentToDelete?.name ?? 'this student'}? This action cannot be undone.`}
      />
       <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 mt-auto">
          &copy; {new Date().getFullYear()} {settings.instituteName}. All rights reserved.
          <p>Powered by React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;
