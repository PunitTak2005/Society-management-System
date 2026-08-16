import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-hidden border border-slate-200 rounded-lg shadow-sm">
    <table className={`w-full text-left border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '' }) => (
  <thead className={`bg-slate-50 border-b border-slate-200 ${className}`}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-200 ${className}`}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', hover = true }) => (
  <tr className={`animate-scale-in ${hover ? 'hover:bg-slate-50' : ''} transition-colors ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>
    {children}
  </td>
);
