import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const getPercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const getGradeFromPercentage = (percentage) => {
  if (percentage >= 90) return { grade: 'A', color: 'text-green-600' };
  if (percentage >= 80) return { grade: 'B', color: 'text-blue-600' };
  if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600' };
  if (percentage >= 60) return { grade: 'D', color: 'text-orange-600' };
  return { grade: 'F', color: 'text-red-600' };
};

export const can = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

export const downloadCSV = async (data, filename) => {
  const { default: Papa } = await import('papaparse');
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const { saveAs } = await import('file-saver');
  const html = `<!DOCTYPE html><html><head><title>${filename}</title></head><body>${element.outerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  saveAs(blob, `${filename}.html`);
};
