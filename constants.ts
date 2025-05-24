
import { AppSettings } from './types';
// Fix: Import React to provide scope for JSX elements and React.ReactNode type.
// Even with the new JSX transform (React 17+), TypeScript needs React in scope (or equivalent JSX type declarations)
// for type-checking JSX syntax and recognizing types like React.ReactNode.
// React is also needed for React.createElement.
import React from 'react';

export const APP_NAME = "Swamy Academy Billing";

export const COURSES: string[] = [
  "Python Full Stack Development",
  "Java Full Stack Development",
  "MERN Stack Development",
  "Data Science with Python",
  "Digital Marketing",
  "Custom Course",
];

export const DEFAULT_SETTINGS: AppSettings = {
  instituteName: "Swamy Academy",
  instituteAddress: "123 Education Lane, Knowledge City, India",
  instituteContact: "Email: contact@swamyacademy.com | Phone: +91-9876543210",
  logoUrl: "https://picsum.photos/seed/swamyacademylogo/150/50", // Placeholder logo
  signatureUrl: "https://picsum.photos/seed/swamyacademysig/150/50", // Placeholder signature
  termsAndConditions: "1. Fees once paid are non-refundable.\n2. Course duration and content are subject to change.\n3. All disputes subject to local jurisdiction.",
};

export const LOCAL_STORAGE_KEYS = {
  STUDENTS: 'swamyAcademy_students',
  SETTINGS: 'swamyAcademy_settings',
  INVOICE_COUNTER: 'swamyAcademy_invoiceCounter',
};

// Fix: Replaced JSX with React.createElement to resolve parsing errors.
// This avoids issues if the environment is not configured to process JSX in .ts files.
// Defined the return type for icon functions as React.ReactNode.
// React import is kept for React.ReactNode type and general JSX scope,
// even with modern React's automatic JSX runtime.
export const ICONS: { [key: string]: (className?: string) => React.ReactNode } = {
  add: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { d: "M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1Z" })
  ),
  edit: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { d: "M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" }),
    React.createElement('path', { d: "M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" })
  ),
  delete: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { fillRule: "evenodd", d: "M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9Zm-1.457.227a.75.75 0 0 1-.75.75H8.682a.75.75 0 0 1-.75-.75v-.227c0-.545.443-1.152.992-1.152h.026c.549 0 .992.607.992 1.152v.227Z", clipRule: "evenodd" })
  ),
  invoice: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { d: "M3.375 3C2.339 3 1.5 3.84 1.5 4.875v14.25C1.5 20.16 2.339 21 3.375 21h17.25c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.84 21.661 3 20.625 3H3.375Z" }),
    React.createElement('path', { d: "M9 6.75A.75.75 0 0 1 9.75 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 6.75ZM9 12.75A.75.75 0 0 1 9.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 12.75ZM7.5 15.75a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Z" }),
    React.createElement('path', { d: "M10.5 9.75A.75.75 0 0 1 11.25 9h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 10.5 9.75Z" })
  ),
  download: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { d: "M12 1.5a.75.75 0 0 1 .75.75V12.44l3.97-3.97a.75.75 0 0 1 1.06 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0L5.22 9.53a.75.75 0 0 1 1.06-1.06l3.97 3.97V2.25A.75.75 0 0 1 12 1.5Z" }),
    React.createElement('path', { d: "M3.75 16.5a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" })
  ),
  settings: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { fillRule: "evenodd", d: "M11.078 2.25c-.917 0-1.699.663-1.925 1.542A1.986 1.986 0 0 0 7.78 5.033L6.03 4.006a1.991 1.991 0 0 0-2.412.965 1.991 1.991 0 0 0 .093 2.304l.937.937a1.986 1.986 0 0 0-.004 1.565l-.937.937a1.991 1.991 0 0 0-.093 2.304c.234.63.798 1.113 1.446 1.349l1.66.077a1.986 1.986 0 0 0 1.373 1.373l.077 1.66a1.991 1.991 0 0 0 1.349 1.446c.63.234 1.113.798 1.349 1.446l.077 1.66c.234.63.798 1.113 1.446 1.349a1.991 1.991 0 0 0 2.304-.093l.937-.937a1.986 1.986 0 0 0 1.565-.004l.937.937a1.991 1.991 0 0 0 2.304.093c.63-.234 1.113-.798 1.349-1.446l.077-1.66a1.986 1.986 0 0 0 1.373-1.373l1.66-.077a1.991 1.991 0 0 0 1.446-1.349c.234-.63.798-1.113 1.446-1.349l1.66-.077a1.991 1.991 0 0 0 1.349-1.446 1.991 1.991 0 0 0-.093-2.304l-.937-.937a1.986 1.986 0 0 0 .004-1.565l.937-.937a1.991 1.991 0 0 0 .093-2.304c-.234-.63-.798-1.113-1.446-1.349l-1.66-.077a1.986 1.986 0 0 0-1.373-1.373l-.077-1.66A1.991 1.991 0 0 0 17.97 3.009l-1.754 1.021a1.986 1.986 0 0 0-1.374-1.217 1.987 1.987 0 0 0-1.542-1.542L12.922.182A1.991 1.991 0 0 0 10.509.276L8.755 1.3a1.986 1.986 0 0 0-1.374 1.217 1.987 1.987 0 0 0-1.542 1.542L4.007 5.967a1.991 1.991 0 0 0-.965 2.412l1.021 1.754a1.986 1.986 0 0 0-1.217 1.374c-.095.48-.286.932-.558 1.326a1.991 1.991 0 0 0-.276 2.412l1.021 1.754a1.986 1.986 0 0 0-1.217 1.374 1.987 1.987 0 0 0-1.542 1.542L.182 11.078A1.991 1.991 0 0 0 .276 13.49l1.021 1.754a1.986 1.986 0 0 0 1.217 1.374c.48.095.932.286 1.326.558a1.991 1.991 0 0 0 2.412.276l1.754-1.021a1.986 1.986 0 0 0 1.374 1.217 1.987 1.987 0 0 0 1.542 1.542l1.839 1.839a1.991 1.991 0 0 0 2.412-.965l1.021-1.754a1.986 1.986 0 0 0-1.217-1.374 1.987 1.987 0 0 0-1.542-1.542L11.078 2.25Zm.19 13.094a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z", clipRule: "evenodd" })
  ),
  export: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { d: "M12 1.5a.75.75 0 0 1 .75.75V4.5h2.25a.75.75 0 0 1 0 1.5H12.75V12h1.5a.75.75 0 0 1 0 1.5H12.75v4.5a.75.75 0 0 1-1.5 0V13.5H9.75a.75.75 0 0 1 0-1.5H11.25V6H9.75a.75.75 0 0 1 0-1.5H11.25V2.25A.75.75 0 0 1 12 1.5ZM3.75 3.75A1.5 1.5 0 0 0 2.25 5.25v13.5A1.5 1.5 0 0 0 3.75 20.25h16.5A1.5 1.5 0 0 0 21.75 18.75V5.25A1.5 1.5 0 0 0 20.25 3.75H3.75Z" })
  ),
  whatsapp: (className = "w-5 h-5") => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className, viewBox: "0 0 24 24", fill: "currentColor" },
    React.createElement('path', { d: "M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.2-1.4-.5-2-.9-.5-.3-1.1-.9-1.6-1.5-.2-.3-.1-.5 0-.6s.2-.2.3-.4c.1-.1.2-.2.2-.3.1-.1.1-.2 0-.4-.1-.1-.6-1.3-.8-1.8-.1-.7-.3-.6-.5-.6h-.5c-.2 0-.4 0-.6.1-.2.1-.4.3-.7.6-.2.3-.7 1-.7 2.1 0 .9.4 1.8.9 2.6.4.6 1.1 1.4 2.1 2.2.3.3.5.4.8.6.7.4 1.1.6 1.6.8.3.1.5.1.7.1.5 0 1.2-.2 1.7-.9.2-.4.2-.7.1-1l-.1-.1zm5.3-9.1C20.4 3.4 18.8 2.5 17 2.1c-1-.2-2-.3-3-.3h-.1c-3.3 0-6.4 1.3-8.8 3.7S1.4 11.6 1.4 15c0 1.6.4 3.2 1.1 4.6l-1.3 4.9 5-1.3c1.4.7 2.9 1.1 4.5 1.1h.1c5.2 0 9.7-4.4 9.7-9.7 0-2.2-.8-4.4-2.2-6.1zm-3.1 12.5c-1.3.8-2.8 1.2-4.4 1.2h-.1c-1.4 0-2.8-.3-4.1-.9l-.3-.2-3 1.2.8-2.1.2-.4c-1.2-1.8-1.9-3.8-1.9-6 0-4.3 3.5-7.8 7.8-7.8h.1c1.3 0 2.6.3 3.8.8.6.2 1.1.5 1.6.9 1.5 1.1 2.5 2.8 2.5 4.6.1 4.3-3.4 7.8-7.7 7.8z" })
  ),
};
