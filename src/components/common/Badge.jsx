// import React from 'react';

// export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
//   const sizeClasses = {
//     xs: 'px-2 py-0.5 text-[10px] font-semibold',
//     sm: 'px-2.5 py-1 text-xs font-medium',
//     md: 'px-3 py-1.5 text-sm font-medium',
//   };

//   const variantClasses = {
//     default: 'bg-slate-100 text-slate-700 border-slate-200',
//     primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
//     success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     danger: 'bg-rose-50 text-rose-700 border-rose-200',
//     warning: 'bg-amber-50 text-amber-700 border-amber-200',
//     info: 'bg-sky-50 text-sky-700 border-sky-200',
//     gray: 'bg-slate-100 text-slate-500 border-slate-200',
//     // Platform variants
//     android: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     ios: 'bg-slate-900 text-white border-slate-900',
//     // Update Type variants
//     forcible: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
//     skippable: 'bg-sky-50 text-sky-700 border-sky-200 font-semibold',
//     // Action variants
//     create: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
//     update: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
//     delete: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
//     login: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
//     logout: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold',
//     status_change: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
//   };

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${
//         sizeClasses[size] || sizeClasses.sm
//       } ${variantClasses[variant] || variantClasses.default} ${className}`}
//     >
//       {children}
//     </span>
//   );
// };

// export default Badge;
