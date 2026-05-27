export const EXPENSE_CATEGORIES = {
  FOOD: { label: 'Food & Drinks', color: '#F97316', bg: '#FFF7ED', icon: '🍽️' },
  TRANSPORT: { label: 'Transport', color: '#3B82F6', bg: '#EFF6FF', icon: '🚗' },
  ACCOMMODATION: { label: 'Stay', color: '#8B5CF6', bg: '#F5F3FF', icon: '🏨' },
  SHOPPING: { label: 'Shopping', color: '#EC4899', bg: '#FDF2F8', icon: '🛍️' },
  ENTERTAINMENT: { label: 'Fun', color: '#EAB308', bg: '#FEFCE8', icon: '🎉' },
  UTILITIES: { label: 'Utilities', color: '#14B8A6', bg: '#F0FDFA', icon: '⚡' },
  OTHER: { label: 'Other', color: '#6B7280', bg: '#F9FAFB', icon: '📌' },
};

export const GROUP_CATEGORIES = {
  TRIP: { label: 'Trip', icon: '✈️', color: '#3B82F6' },
  HOME: { label: 'Home', icon: '🏠', color: '#10B981' },
  COUPLE: { label: 'Couple', icon: '💑', color: '#EC4899' },
  EVENT: { label: 'Event', icon: '🎊', color: '#F59E0B' },
  OTHER: { label: 'Other', icon: '👥', color: '#6B7280' },
};

export const SPLIT_TYPES = {
  EQUAL: { label: 'Equal', description: 'Split equally among all' },
  EXACT: { label: 'Exact', description: 'Enter exact amounts' },
  PERCENTAGE: { label: 'Percentage', description: 'Split by percentage' },
  SHARES: { label: 'Shares', description: 'Split by share ratio' },
};

export function getCategoryInfo(category, type = 'expense') {
  if (type === 'group') return GROUP_CATEGORIES[category] || GROUP_CATEGORIES.OTHER;
  return EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.OTHER;
}
