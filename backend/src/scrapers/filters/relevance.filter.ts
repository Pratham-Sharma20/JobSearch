const EARLY_CAREER_KEYWORDS = [
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
  'student',
  'university',
  '0-1 years',
  'freshman',
  'sophomore',
  'junior',
  'senior'
];

const SDE_KEYWORDS = [
  'software',
  'engineer',
  'developer',
  'sde',
  'fullstack',
  'backend',
  'frontend',
  'mobile',
  'ios',
  'android',
  'data engineer',
  'machine learning',
  'ai',
  'devops',
  'cloud',
  'infrastructure',
  'security engineer',
  'systems engineer',
  'test engineer',
  'qa',
  'quality assurance',
  'embedded',
  'firmware',
  'web',
  'react',
  'node',
  'python',
  'java',
  'c++',
  'golang'
];

const EXCLUDE_KEYWORDS = [
  'senior',
  'lead',
  'manager',
  'director',
  'principal',
  'vp',
  'head',
  'staff',
  'architect',
  'expert',
  'specialist',
  'sr.',
  'sr '
];

export function isEarlyCareer(title: string): boolean {
  const lowerTitle = title.toLowerCase();

  // 1. Must be a Software Engineering or related field job
  const isSDE = SDE_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
  if (!isSDE) return false;

  // 2. Must NOT contain senior/lead keywords
  const isSenior = EXCLUDE_KEYWORDS.some(exclude => {
    // Check if it's a whole word or followed by a space/punctuation to avoid matching "stream" for "sr"
    const regex = new RegExp(`\\b${exclude.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerTitle);
  });
  if (isSenior) return false;

  // 3. Must be an Early Career role
  const isEarly = EARLY_CAREER_KEYWORDS.some(include => lowerTitle.includes(include));

  return isEarly;
}
