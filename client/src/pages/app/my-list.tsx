import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhraseCard } from "@/components/ui/phrase-card";
import { SAMPLE_TAGS, LANGUAGES } from "@/lib/constants";
import { useState } from "react";
import { Link } from "wouter";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MyList() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  // State for modals
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    id: number;
    phrase: string;
    translation: string;
    notes?: string;
    tags?: string[];
    proficiency: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  } | null>(null);
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recent");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state for edit dialog
  const [editedPhrase, setEditedPhrase] = useState("");
  const [editedTranslation, setEditedTranslation] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  
  // Tag management
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguageInput, setSourceLanguageInput] = useState("");
  const [targetLanguageInput, setTargetLanguageInput] = useState("");
  const [filteredSourceLanguages, setFilteredSourceLanguages] = useState<typeof LANGUAGES>([]);
  const [filteredTargetLanguages, setFilteredTargetLanguages] = useState<typeof LANGUAGES>([]);

  // Example phrases data with notes - 50 phrases total
  const [phrases] = useState([
    // Spanish phrases
    { 
      id: 1, 
      phrase: 'Buenos días', 
      translation: 'Good morning', 
      tags: ['Greetings', 'Morning', 'Beginner'], 
      proficiency: 85,
      notes: 'Used as a morning greeting until around noon. The informal version is just "Hola".',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 2, 
      phrase: '¿Cómo estás?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions'], 
      proficiency: 70,
      notes: 'Informal way to ask how someone is doing. For formal situations use "¿Cómo está usted?"',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 3, 
      phrase: 'Gracias', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 95,
      notes: 'The standard way to say thank you. You can add "muchas" before it for "thank you very much".',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 4, 
      phrase: 'Por favor', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 90,
      notes: 'Used to make polite requests. Can be placed at the beginning or end of a sentence.',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 5, 
      phrase: 'Lo siento', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 60,
      notes: 'Used to apologize. For more serious apologies, you can say "Lo siento mucho" (I\'m very sorry).',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 6, 
      phrase: 'Buenas noches', 
      translation: 'Good evening/night', 
      tags: ['Greetings', 'Evening', 'Beginner'], 
      proficiency: 80,
      notes: 'Used in the evening and at night as both a greeting and a farewell.',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 7, 
      phrase: 'Adiós', 
      translation: 'Goodbye', 
      tags: ['Farewells', 'Beginner'], 
      proficiency: 95,
      notes: 'Formal way to say goodbye. "Hasta luego" (see you later) is often more common.',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 8, 
      phrase: 'Hasta mañana', 
      translation: 'See you tomorrow', 
      tags: ['Farewells', 'Intermediate'], 
      proficiency: 75,
      notes: 'A common way to say goodbye when you expect to see the person the next day.',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 9, 
      phrase: 'Mucho gusto', 
      translation: 'Nice to meet you', 
      tags: ['Greetings', 'Introductions', 'Beginner'], 
      proficiency: 65,
      notes: 'Used when meeting someone for the first time.',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    { 
      id: 10, 
      phrase: 'No entiendo', 
      translation: 'I don\'t understand', 
      tags: ['Common phrases', 'Learning', 'Beginner'], 
      proficiency: 85,
      notes: 'Very useful phrase when learning a language. You can follow it with "¿Puedes repetir?" (Can you repeat?)',
      sourceLanguage: 'spanish',
      targetLanguage: 'english'
    },
    
    // French phrases
    { 
      id: 11, 
      phrase: 'Bonjour', 
      translation: 'Hello/Good day', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 90,
      notes: 'The most common greeting in French, used during the day.',
      sourceLanguage: 'french',
      targetLanguage: 'english'
    },
    { 
      id: 12, 
      phrase: 'Comment ça va?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 75,
      notes: 'Casual way to ask how someone is doing. "Comment allez-vous?" is more formal.',
      sourceLanguage: 'french',
      targetLanguage: 'english'
    },
    { 
      id: 13, 
      phrase: 'Merci', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 100,
      notes: 'Basic way to say "thank you". "Merci beaucoup" means "thank you very much".',
      sourceLanguage: 'french',
      targetLanguage: 'english'
    },
    { 
      id: 14, 
      phrase: 'S\'il vous plaît', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 85,
      notes: 'Formal way to say "please". "S\'il te plaît" is the informal version.',
      sourceLanguage: 'french',
      targetLanguage: 'english'
    },
    { 
      id: 15, 
      phrase: 'Je suis désolé(e)', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 70,
      notes: 'Add "e" at the end if you are female (désolée).',
      sourceLanguage: 'french',
      targetLanguage: 'english'
    },
    
    // German phrases
    { 
      id: 16, 
      phrase: 'Guten Tag', 
      translation: 'Good day', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 80,
      notes: 'Formal greeting used during the day. "Hallo" is more casual.',
      sourceLanguage: 'german',
      targetLanguage: 'english'
    },
    { 
      id: 17, 
      phrase: 'Wie geht es dir?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 65,
      notes: 'Informal way to ask how someone is doing. "Wie geht es Ihnen?" is formal.',
      sourceLanguage: 'german',
      targetLanguage: 'english'
    },
    { 
      id: 18, 
      phrase: 'Danke', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 95,
      notes: 'The basic way to say "thank you". "Vielen Dank" means "many thanks".',
      sourceLanguage: 'german',
      targetLanguage: 'english'
    },
    { 
      id: 19, 
      phrase: 'Bitte', 
      translation: 'Please/You\'re welcome', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 85,
      notes: 'This word can mean both "please" and "you\'re welcome" depending on context.',
      sourceLanguage: 'german',
      targetLanguage: 'english'
    },
    { 
      id: 20, 
      phrase: 'Es tut mir leid', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 60,
      notes: 'The standard way to apologize in German.',
      sourceLanguage: 'german',
      targetLanguage: 'english'
    },
    
    // Italian phrases
    { 
      id: 21, 
      phrase: 'Buongiorno', 
      translation: 'Good morning/day', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 85,
      notes: 'Used as a greeting until the afternoon, when "buonasera" (good evening) is used.',
      sourceLanguage: 'italian',
      targetLanguage: 'english'
    },
    { 
      id: 22, 
      phrase: 'Come stai?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 75,
      notes: 'Informal way to ask how someone is doing. "Come sta?" is formal.',
      sourceLanguage: 'italian',
      targetLanguage: 'english'
    },
    { 
      id: 23, 
      phrase: 'Grazie', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 100,
      notes: 'Basic way to say thanks. "Grazie mille" means "a thousand thanks".',
      sourceLanguage: 'italian',
      targetLanguage: 'english'
    },
    { 
      id: 24, 
      phrase: 'Per favore', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 90,
      notes: 'Used to make a request polite. "Per piacere" is also commonly used.',
      sourceLanguage: 'italian',
      targetLanguage: 'english'
    },
    { 
      id: 25, 
      phrase: 'Mi dispiace', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 65,
      notes: 'Used to apologize in Italian. "Scusi" is used for more minor apologies or to get attention.',
      sourceLanguage: 'italian',
      targetLanguage: 'english'
    },
    
    // Japanese phrases
    { 
      id: 26, 
      phrase: 'おはようございます (Ohayou gozaimasu)', 
      translation: 'Good morning', 
      tags: ['Greetings', 'Morning', 'Beginner'], 
      proficiency: 70,
      notes: 'Formal morning greeting. "おはよう" (Ohayou) is the casual version.',
      sourceLanguage: 'japanese',
      targetLanguage: 'english'
    },
    { 
      id: 27, 
      phrase: 'お元気ですか？ (O-genki desu ka?)', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 55,
      notes: 'Formal way to ask how someone is doing.',
      sourceLanguage: 'japanese',
      targetLanguage: 'english'
    },
    { 
      id: 28, 
      phrase: 'ありがとうございます (Arigatou gozaimasu)', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 80,
      notes: 'Formal way to say thank you. "ありがとう" (Arigatou) is casual.',
      sourceLanguage: 'japanese',
      targetLanguage: 'english'
    },
    { 
      id: 29, 
      phrase: 'お願いします (Onegai shimasu)', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 75,
      notes: 'Used when making a request or asking for something.',
      sourceLanguage: 'japanese',
      targetLanguage: 'english'
    },
    { 
      id: 30, 
      phrase: 'すみません (Sumimasen)', 
      translation: 'Excuse me/I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 85,
      notes: 'Versatile expression used to say "excuse me", "I\'m sorry", or "thank you" depending on context.',
      sourceLanguage: 'japanese',
      targetLanguage: 'english'
    },
    
    // Mandarin Chinese phrases
    { 
      id: 31, 
      phrase: '你好 (Nǐ hǎo)', 
      translation: 'Hello', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 90,
      notes: 'The most common greeting in Mandarin Chinese.',
      sourceLanguage: 'mandarin',
      targetLanguage: 'english'
    },
    { 
      id: 32, 
      phrase: '你好吗？ (Nǐ hǎo ma?)', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 75,
      notes: 'A common way to ask how someone is doing.',
      sourceLanguage: 'mandarin',
      targetLanguage: 'english'
    },
    { 
      id: 33, 
      phrase: '谢谢 (Xièxiè)', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 95,
      notes: 'The standard way to say thank you in Mandarin.',
      sourceLanguage: 'mandarin',
      targetLanguage: 'english'
    },
    { 
      id: 34, 
      phrase: '请 (Qǐng)', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 80,
      notes: 'Used when making a request or offering something.',
      sourceLanguage: 'mandarin',
      targetLanguage: 'english'
    },
    { 
      id: 35, 
      phrase: '对不起 (Duìbùqǐ)', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 70,
      notes: 'Used to apologize for mistakes or inconveniences.',
      sourceLanguage: 'mandarin',
      targetLanguage: 'english'
    },
    
    // Portuguese phrases
    { 
      id: 36, 
      phrase: 'Bom dia', 
      translation: 'Good morning', 
      tags: ['Greetings', 'Morning', 'Beginner'], 
      proficiency: 85,
      notes: 'Used as a greeting in the morning until noon.',
      sourceLanguage: 'portuguese',
      targetLanguage: 'english'
    },
    { 
      id: 37, 
      phrase: 'Como está?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 70,
      notes: 'Formal way to ask how someone is doing. "Como vai?" is more casual.',
      sourceLanguage: 'portuguese',
      targetLanguage: 'english'
    },
    { 
      id: 38, 
      phrase: 'Obrigado/Obrigada', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 90,
      notes: 'Use "obrigado" if you\'re male and "obrigada" if you\'re female.',
      sourceLanguage: 'portuguese',
      targetLanguage: 'english'
    },
    { 
      id: 39, 
      phrase: 'Por favor', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 95,
      notes: 'Used to make requests polite, similar to Spanish.',
      sourceLanguage: 'portuguese',
      targetLanguage: 'english'
    },
    { 
      id: 40, 
      phrase: 'Desculpe', 
      translation: 'Sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 75,
      notes: 'Used for minor apologies or to get attention. "Sinto muito" is for more serious apologies.',
      sourceLanguage: 'portuguese',
      targetLanguage: 'english'
    },
    
    // Russian phrases
    { 
      id: 41, 
      phrase: 'Здравствуйте (Zdravstvuyte)', 
      translation: 'Hello', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 60,
      notes: 'Formal greeting. "Привет" (Privet) is the informal version.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 42, 
      phrase: 'Как дела? (Kak dela?)', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Beginner'], 
      proficiency: 65,
      notes: 'The common way to ask how someone is doing.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 43, 
      phrase: 'Спасибо (Spasibo)', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 80,
      notes: 'Basic way to express thanks in Russian.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 44, 
      phrase: 'Пожалуйста (Pozhaluysta)', 
      translation: 'Please/You\'re welcome', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 70,
      notes: 'Like German "bitte", this can mean both "please" and "you\'re welcome".',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    { 
      id: 45, 
      phrase: 'Извините (Izvinite)', 
      translation: 'I\'m sorry/Excuse me', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 55,
      notes: 'Formal way to apologize or get someone\'s attention.',
      sourceLanguage: 'russian',
      targetLanguage: 'english'
    },
    
    // Korean phrases
    { 
      id: 46, 
      phrase: '안녕하세요 (Annyeong haseyo)', 
      translation: 'Hello', 
      tags: ['Greetings', 'Beginner'], 
      proficiency: 75,
      notes: 'Standard greeting in Korean. "안녕" (Annyeong) is casual.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 47, 
      phrase: '어떻게 지내세요? (Eotteoke jinaeseyo?)', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions', 'Intermediate'], 
      proficiency: 50,
      notes: 'Formal way to ask how someone has been doing.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 48, 
      phrase: '감사합니다 (Gamsahamnida)', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 85,
      notes: 'Formal way to say thank you. "고마워" (Gomawo) is casual.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 49, 
      phrase: '주세요 (Juseyo)', 
      translation: 'Please give me', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 70,
      notes: 'Used when asking for something. Add the item before "주세요".',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    },
    { 
      id: 50, 
      phrase: '죄송합니다 (Joesonghamnida)', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 65,
      notes: 'Formal apology. "미안해" (Mianhae) is the casual version.',
      sourceLanguage: 'korean',
      targetLanguage: 'english'
    }
  ]);
  
  // Handle showing notes for a phrase
  const handleViewNotes = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsNotesDialogOpen(true);
  };

  // Handle editing a phrase
  const handleEdit = (phrase: any) => {
    setSelectedPhrase(phrase);
    // Initialize edit state with phrase values
    setEditedPhrase(phrase.phrase);
    setEditedTranslation(phrase.translation);
    setEditedNotes(phrase.notes || "");
    setSelectedTags(phrase.tags || []);
    setSourceLanguage(phrase.sourceLanguage || "");
    setTargetLanguage(phrase.targetLanguage || "");
    setIsEditDialogOpen(true);
  };

  // Language management functions
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceLanguageInput(value);
    
    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSourceLanguages(filtered);
    } else {
      setFilteredSourceLanguages([]);
    }
  };
  
  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetLanguageInput(value);
    
    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTargetLanguages(filtered);
    } else {
      setFilteredTargetLanguages([]);
    }
  };
  
  const setLanguage = (type: 'source' | 'target', value: string) => {
    if (type === 'source') {
      setSourceLanguage(value);
      setSourceLanguageInput('');
      setFilteredSourceLanguages([]);
    } else {
      setTargetLanguage(value);
      setTargetLanguageInput('');
      setFilteredTargetLanguages([]);
    }
  };
  
  const handleLanguageKeyDown = (type: 'source' | 'target', e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const value = type === 'source' ? sourceLanguageInput : targetLanguageInput;
      if (value) {
        setLanguage(type, value);
      }
    }
  };

  // Tag management functions
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = SAMPLE_TAGS.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };
  
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    // Check if we've reached the maximum tags limit
    if (selectedTags.length >= 3) return;
    
    // If tag doesn't exist in selected tags, add it
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    
    setTagInput('');
    setFilteredSuggestions([]);
  };
  
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault(); // Prevent form submission
      addTag(tagInput);
    }
  };
  
  // Form validation states
  const [formErrors, setFormErrors] = useState({
    phrase: false,
    translation: false,
    sourceLanguage: false,
    targetLanguage: false
  });
  
  // Handle form validation
  const validateForm = () => {
    const errors = {
      phrase: !editedPhrase.trim(),
      translation: !editedTranslation.trim(),
      sourceLanguage: !sourceLanguage,
      targetLanguage: !targetLanguage
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Handle form submission - UI only, no real saving
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // If validation passes, close the dialog
      setIsEditDialogOpen(false);
    }
  };
  
  // Filter and sort the phrases
  const getFilteredAndSortedPhrases = () => {
    // First, filter the phrases
    let filtered = phrases.filter(phrase => {
      // Search term filter (case-insensitive) - only check phrase and translation
      const matchesSearch = searchTerm === "" || 
        phrase.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.translation.toLowerCase().includes(searchTerm.toLowerCase());
        
      // Tag filter (case-insensitive)
      const matchesTag = tagFilter === "all" || 
        (phrase.tags && phrase.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase()));
        
      return matchesSearch && matchesTag;
    });
    
    // Then, sort the filtered phrases
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "alphabetical":
          return a.phrase.localeCompare(b.phrase);
        case "proficiency-high":
          return b.proficiency - a.proficiency;
        case "proficiency-low":
          return a.proficiency - b.proficiency;
        case "recent":
        default:
          // For demo purposes, we'll use the id as a proxy for "recent"
          // In a real app, this would use a timestamp
          return b.id - a.id;
      }
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Phrases</h1>
        <Link href="/add-phrase">
          <Button>
            Add Phrase
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                placeholder="Search phrases or translations" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-1/4">
            <Select 
              defaultValue="all" 
              value={tagFilter}
              onValueChange={setTagFilter}
            >
              <SelectTrigger id="tag">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {SAMPLE_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag.toLowerCase()}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-1/4">
            <Select 
              defaultValue="recent" 
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="proficiency-high">Proficiency (High to Low)</SelectItem>
                <SelectItem value="proficiency-low">Proficiency (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Phrases List */}
      <Card className="mb-6">
        <div className="divide-y divide-gray-200">
          {getFilteredAndSortedPhrases().length > 0 ? (
            <>
              {getFilteredAndSortedPhrases()
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((phrase) => (
                  <PhraseCard
                    key={phrase.id}
                    phrase={phrase.phrase}
                    translation={phrase.translation}
                    tags={phrase.tags}
                    proficiency={phrase.proficiency}
                    notes={phrase.notes}
                    sourceLanguage={phrase.sourceLanguage}
                    targetLanguage={phrase.targetLanguage}
                    onEdit={() => handleEdit(phrase)}
                    onDelete={() => {}}
                    onSpeak={() => {}}
                    onViewNotes={() => handleViewNotes(phrase)}
                  />
                ))}
              
              {/* Pagination */}
              {getFilteredAndSortedPhrases().length > itemsPerPage && (
                <div className="w-full p-4 flex justify-center items-center border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({length: Math.min(3, Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage))}, (_, i) => {
                        const pageNum = currentPage === 1 ? i + 1 : 
                                       currentPage === Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage) ? 
                                       Math.max(1, Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage) - 2) + i :
                                       currentPage - 1 + i;
                        
                        if (pageNum <= Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage)) {
                          return (
                            <Button
                              key={i}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage)}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage))}
                      disabled={currentPage === Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage)}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No phrases match your filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm("");
                  setTagFilter("all");
                  setSortOption("recent");
                  setCurrentPage(1);
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-primary">{selectedPhrase?.phrase}</span> 
              <span className="text-sm font-normal text-gray-500">({selectedPhrase?.translation})</span>
            </DialogTitle>
            <DialogDescription>
              Details about this phrase
            </DialogDescription>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Languages:</h3>
              <div className="flex gap-2 items-center">
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase && selectedPhrase.sourceLanguage ? 
                    selectedPhrase.sourceLanguage.charAt(0).toUpperCase() + selectedPhrase.sourceLanguage.slice(1) :
                    "Unknown"
                  }
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase && selectedPhrase.targetLanguage ? 
                    selectedPhrase.targetLanguage.charAt(0).toUpperCase() + selectedPhrase.targetLanguage.slice(1) :
                    "Unknown"
                  }
                </Badge>
              </div>
            </div>
            <h3 className="text-sm font-medium mb-2">Notes:</h3>
            <p className="text-gray-700">{selectedPhrase?.notes}</p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Phrase</DialogTitle>
            <DialogDescription>
              Make changes to your phrase below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
              {/* Row 1: Phrase & Source Language */}
              <div className="sm:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-phrase">Phrase</Label>
                  <Input 
                    id="edit-phrase"
                    name="phrase"
                    value={editedPhrase}
                    onChange={(e) => {
                      setEditedPhrase(e.target.value);
                      if (formErrors.phrase) {
                        setFormErrors({...formErrors, phrase: false});
                      }
                    }}
                    placeholder="Enter phrase to learn"
                    className={formErrors.phrase ? "border-red-500" : ""}
                  />
                  {formErrors.phrase && (
                    <p className="text-sm text-red-500">Phrase is required</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-sourceLanguage">Language</Label>
                  <div className="relative">
                    <Input 
                      id="edit-sourceLanguage"
                      placeholder="Type or select language"
                      value={sourceLanguageInput}
                      onChange={(e) => {
                        handleSourceLanguageChange(e);
                        if (formErrors.sourceLanguage) {
                          setFormErrors({...formErrors, sourceLanguage: false});
                        }
                      }}
                      onKeyDown={(e) => handleLanguageKeyDown('source', e)}
                      className={formErrors.sourceLanguage && !sourceLanguage ? "border-red-500" : ""}
                    />
                    {sourceLanguageInput && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setLanguage('source', sourceLanguageInput)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}

                    {/* Source language suggestions */}
                    {filteredSourceLanguages.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        <ul className="divide-y divide-gray-200">
                          {filteredSourceLanguages.map((language) => (
                            <li
                              key={language.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setLanguage('source', language.id);
                                if (formErrors.sourceLanguage) {
                                  setFormErrors({...formErrors, sourceLanguage: false});
                                }
                              }}
                            >
                              {language.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {sourceLanguage && (
                    <div className="mt-2">
                      <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 transition-colors duration-200">
                        {LANGUAGES.find(l => l.id === sourceLanguage)?.name || sourceLanguage}
                        <button
                          type="button"
                          onClick={() => {
                            setSourceLanguage("");
                            setFormErrors({...formErrors, sourceLanguage: true});
                          }}
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                  {formErrors.sourceLanguage && !sourceLanguage && (
                    <p className="text-sm text-red-500">Source language is required</p>
                  )}
                </div>
              </div>

              {/* Row 2: Translation & Target Language */}
              <div className="sm:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-translation">Translation</Label>
                  <Input 
                    id="edit-translation"
                    name="translation"
                    value={editedTranslation}
                    onChange={(e) => {
                      setEditedTranslation(e.target.value);
                      if (formErrors.translation) {
                        setFormErrors({...formErrors, translation: false});
                      }
                    }}
                    placeholder="Enter translation in your language"
                    className={formErrors.translation ? "border-red-500" : ""}
                  />
                  {formErrors.translation && (
                    <p className="text-sm text-red-500">Translation is required</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-targetLanguage">Language</Label>
                  <div className="relative">
                    <Input 
                      id="edit-targetLanguage"
                      placeholder="Type or select language"
                      value={targetLanguageInput}
                      onChange={(e) => {
                        handleTargetLanguageChange(e);
                        if (formErrors.targetLanguage) {
                          setFormErrors({...formErrors, targetLanguage: false});
                        }
                      }}
                      onKeyDown={(e) => handleLanguageKeyDown('target', e)}
                      className={formErrors.targetLanguage && !targetLanguage ? "border-red-500" : ""}
                    />
                    {targetLanguageInput && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setLanguage('target', targetLanguageInput)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}

                    {/* Target language suggestions */}
                    {filteredTargetLanguages.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        <ul className="divide-y divide-gray-200">
                          {filteredTargetLanguages.map((language) => (
                            <li
                              key={language.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setLanguage('target', language.id);
                                if (formErrors.targetLanguage) {
                                  setFormErrors({...formErrors, targetLanguage: false});
                                }
                              }}
                            >
                              {language.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {targetLanguage && (
                    <div className="mt-2">
                      <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 transition-colors duration-200">
                        {LANGUAGES.find(l => l.id === targetLanguage)?.name || targetLanguage}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetLanguage("");
                            setFormErrors({...formErrors, targetLanguage: true});
                          }}
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                  {formErrors.targetLanguage && !targetLanguage && (
                    <p className="text-sm text-red-500">Target language is required</p>
                  )}
                </div>
              </div>

              {/* Row 3: Notes & Tags */}
              <div className="sm:col-span-2">
                <Label htmlFor="edit-notes">Notes (optional)</Label>
                <Textarea 
                  id="edit-notes"
                  name="notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add explanations, context, or example sentences."
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="edit-tags">Tags (optional, max 3)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} className="px-2 py-1 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 transition-colors duration-200">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    id="edit-tags"
                    placeholder={selectedTags.length >= 3 ? "Maximum 3 tags reached" : "Type to add a tag..."}
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    className="pr-8"
                    disabled={selectedTags.length >= 3}
                  />
                  {tagInput && selectedTags.length < 3 && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => addTag(tagInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Tag suggestions */}
                  {filteredSuggestions.length > 0 && selectedTags.length < 3 && (
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      <ul className="divide-y divide-gray-200">
                        {filteredSuggestions.map((tag) => (
                          <li
                            key={tag}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
