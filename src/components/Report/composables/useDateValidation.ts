interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const formatBirthdateInput = (input: string): string => {
  input = input.replace(/[^\d.]/g, '');
  
  const digitsOnly = input.replace(/\./g, '');

  let formatted = '';
  for (let i = 0; i < digitsOnly.length && i < 8; i++) {
    if (i === 2 || i === 4) {
      formatted += '.';
    }
    formatted += digitsOnly[i];
  }
  
  return formatted;
};

export const validateBirthdate = (birthday: string): boolean | ValidationResult => {
  if (!birthday || birthday.trim() === '') {
    return true;
  }

  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = birthday.match(dateRegex);
  
  if (!match) {
    return {
      valid: false,
      message: 'Дата народження має бути у форматі ДД.ММ.РРРР'
    };
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const currentYear = new Date().getFullYear();
  
  if (day < 1 || day > 31) {
    return {
      valid: false,
      message: 'День має бути від 1 до 31'
    };
  }
  
  if (month < 1 || month > 12) {
    return {
      valid: false,
      message: 'Місяць має бути від 1 до 12'
    };
  }
  
  if (year < 1900 || year > currentYear) {
    return {
      valid: false,
      message: `Рік має бути від 1900 до ${currentYear}`
    };
  }
  
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) {
    return {
      valid: false,
      message: `Невірна кількість днів для місяця ${month}`
    };
  }
  
  return { valid: true };
};