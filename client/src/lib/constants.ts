export const LANGUAGES = [
  { id: 'spanish', name: 'Spanish' },
  { id: 'french', name: 'French' },
  { id: 'german', name: 'German' },
  { id: 'italian', name: 'Italian' },
  { id: 'portuguese', name: 'Portuguese' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'mandarin', name: 'Mandarin' },
];

export const PROFICIENCY_LEVELS = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'elementary', name: 'Elementary' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
  { id: 'fluent', name: 'Fluent' },
];

export const CATEGORIES = [
  'Greetings',
  'Common phrases',
  'Food',
  'Travel',
  'Business',
  'Family',
  'Numbers',
  'Time',
  'Weather',
  'Shopping'
];

export const QUIZ_TYPES = [
  { 
    id: 'translation', 
    name: 'Translation Quiz', 
    description: 'Translate phrases between languages',
    color: 'bg-primary'
  },
  { 
    id: 'multiple-choice', 
    name: 'Multiple Choice', 
    description: 'Choose the correct translation',
    color: 'bg-secondary'
  },
  { 
    id: 'listening', 
    name: 'Listening Quiz', 
    description: 'Write what you hear',
    color: 'bg-accent'
  }
];

export const QUIZ_DIFFICULTIES = [
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
  { id: 'mixed', name: 'Mixed' },
];

export const QUIZ_LENGTHS = [
  { id: '5', name: '5 questions' },
  { id: '10', name: '10 questions' },
  { id: '15', name: '15 questions' },
  { id: '20', name: '20 questions' },
];

export const QUIZ_TIME_LIMITS = [
  { id: 'none', name: 'No Limit' },
  { id: '1', name: '1 Minute' },
  { id: '2', name: '2 Minutes' },
  { id: '5', name: '5 Minutes' },
  { id: '10', name: '10 Minutes' },
];
