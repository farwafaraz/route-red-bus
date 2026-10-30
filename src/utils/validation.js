const PK_PHONE = /^(?:\+92|0092|0)?3\d{2}[-\s]?\d{7}$/;

export function validateReport(form) {
  const errors = {};

  const itemName = form.itemName?.trim() ?? '';
  if (itemName.length < 2) errors.itemName = 'Item name must be at least 2 characters';
  else if (itemName.length > 80) errors.itemName = 'Item name must be 80 characters or fewer';

  const description = form.description?.trim() ?? '';
  if (description.length < 5) errors.description = 'Description must be at least 5 characters';
  else if (description.length > 300) errors.description = 'Description must be 300 characters or fewer';

  const contact = form.contact?.trim() ?? '';
  if (!contact) {
    errors.contact = 'Contact is required';
  } else if (contact.length > 100) {
    errors.contact = 'Contact must be 100 characters or fewer';
  } else if (!PK_PHONE.test(contact.replace(/\s/g, '')) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    errors.contact = 'Enter a valid Pakistani phone number or email';
  }

  if (!form.busId || !form.busId.trim()) errors.busId = 'Bus ID is required';

  return { errors, isValid: Object.keys(errors).length === 0 };
}
