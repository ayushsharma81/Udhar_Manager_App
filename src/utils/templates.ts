import { Language, MessageTemplate } from '../types';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'English Friendly',
    language: 'ENGLISH',
    template: 'Hi {name}, just a friendly reminder that ₹{amount} is currently outstanding on your Udhar ledger. Please confirm when convenient. Thank you!',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'tpl-2',
    name: 'Hindi Polite',
    language: 'HINDI',
    template: 'नमस्ते {name}, याद दिलाना था कि आपके खाते में ₹{amount} बाकी हैं। कृपया भुगतान की तारीख और राशि की पुष्टि कर दें। धन्यवाद।',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'tpl-3',
    name: 'Hinglish Casual',
    language: 'HINGLISH',
    template: 'Hi {name}, ₹{amount} abhi outstanding hain. Jab possible ho payment kar dena. Thanks!',
    isDefault: true,
    createdAt: Date.now(),
  },
  {
    id: 'tpl-4',
    name: 'English Due Date Formal',
    language: 'ENGLISH',
    template: 'Dear {name}, your pending payment of ₹{amount} is scheduled by {due_date}. Kindly arrange the settlement. Regards.',
    isDefault: false,
    createdAt: Date.now(),
  },
];

export function renderMessageTemplate(
  templateText: string,
  params: {
    name: string;
    amount: number;
    dueDate?: number | null;
    interest?: number;
  }
): string {
  const formattedAmount = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    Math.max(0, params.amount)
  );

  let dateStr = 'soon';
  let daysOverdue = '0 days';

  if (params.dueDate) {
    const d = new Date(params.dueDate);
    dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const diffDays = Math.floor((Date.now() - params.dueDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      daysOverdue = `${diffDays} days`;
    }
  }

  const interestStr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    params.interest || 0
  );

  return templateText
    .replace(/{name}/g, params.name)
    .replace(/{amount}/g, formattedAmount)
    .replace(/{due_date}/g, dateStr)
    .replace(/{interest}/g, interestStr)
    .replace(/{days_overdue}/g, daysOverdue);
}
