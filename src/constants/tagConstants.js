// Predefined tags for income and expenses
export const PREDEFINED_INCOME_TAGS = [
  "salary",
  "freelance",
  "investment",
  "bonus",
  "gift",
  "refund",
  "other-income"
];

export const PREDEFINED_EXPENSE_TAGS = [
  "food",
  "education",
  "office",
  "travel",
  "shopping",
  "health",
  "bills",
  "miscellaneous",
  "entertainment",
  "utilities"
];

// Function to get all tags (predefined + custom)
export const getAllIncomeTags = (customTags = []) => {
  const customTagsArray = Array.isArray(customTags)
    ? customTags.filter(tag => !PREDEFINED_INCOME_TAGS.includes(tag.toLowerCase()))
    : [];
  return [...PREDEFINED_INCOME_TAGS, ...customTagsArray];
};

export const getAllExpenseTags = (customTags = []) => {
  const customTagsArray = Array.isArray(customTags)
    ? customTags.filter(tag => !PREDEFINED_EXPENSE_TAGS.includes(tag.toLowerCase()))
    : [];
  return [...PREDEFINED_EXPENSE_TAGS, ...customTagsArray];
};

// Function to format tag for display
export const formatTag = (tag) => {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
