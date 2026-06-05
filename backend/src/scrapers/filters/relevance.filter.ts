const INCLUDE_KEYWORDS = [
  'intern',
  'internship',
  'co-op',
  'coop',
  'apprentice',
  'trainee',
  'new grad',
  'entry level',
  'junior',
  'associate',
  'graduate',
  'student'
];

const EXCLUDE_KEYWORDS = [
  'senior',
  'lead',
  'manager',
  'director',
  'principal',
  'vp',
  'head'
];

export function isEarlyCareer(title: string): boolean {
  const lowerTitle = title.toLowerCase();

  // If contains exclude -> reject
  for (const exclude of EXCLUDE_KEYWORDS) {
    if (lowerTitle.includes(exclude)) {
      return false;
    }
  }

  // If contains include -> accept
  for (const include of INCLUDE_KEYWORDS) {
    if (lowerTitle.includes(include)) {
      return true;
    }
  }

  // Else reject
  return false;
}
