/**
 * Calculates human-readable age based on a birth date string (YYYY-MM-DD) and the current date (today).
 * Handles edge cases like future dates, recent births, months, and years.
 */
export function calculateAge(birthDateString?: string): string {
  if (!birthDateString) return 'Idade não informada';

  // Parse YYYY-MM-DD safely without timezone shifts
  const parts = birthDateString.split('-');
  if (parts.length !== 3) return 'Idade não informada';

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed month
  const birthDay = parseInt(parts[2], 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    return 'Idade não informada';
  }

  const birthDate = new Date(birthYear, birthMonth, birthDay);
  const today = new Date();

  // Reset hours to compare purely by dates
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return 'Recém-nascido';
  }

  let years = today.getFullYear() - birthYear;
  let months = today.getMonth() - birthMonth;
  let days = today.getDate() - birthDay;

  if (days < 0) {
    months -= 1;
    // Calculate days in the previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0) {
    if (days === 0) return 'Nascido hoje';
    return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export function formatDateBR(dateString?: string): string {
  if (!dateString) return 'Não informada';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}
