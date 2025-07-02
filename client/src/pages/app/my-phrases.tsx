import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Search, ChevronLeft, ChevronRight, BookOpen, PlusCircle } from "lucide-react";
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
import { LANGUAGES } from "@/lib/constants";

import { useState, useEffect } from "react";
import { GuardedLink } from "@/components/ui/guarded-link";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { getConfig } from "@shared/config";

// Define phrase type based on API response
interface Phrase {
  externalPhraseId: string;
  originalPhrase: string;
  originalLanguage: string;
  meaning: string;
  meaningLanguage: string;
  phraseTags: string[];
  status: 'IN_PROGRESS' | 'LEARNED';
  notes?: string;
}

export default function MyPhrases() {
  // Get auth context for tokens
  const { tokens } = useAuth();
  const { toast } = useToast();
  
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  // State for modals
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPronunciationDialogOpen, setIsPronunciationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  
  // Audio states
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingTranslation, setIsPlayingTranslation] = useState(false);
  
  // Edit dialog states
  const [editedPhrase, setEditedPhrase] = useState("");
  const [editedTranslation, setEditedTranslation] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguageInput, setSourceLanguageInput] = useState("");
  const [targetLanguageInput, setTargetLanguageInput] = useState("");
  const [filteredSourceLanguages, setFilteredSourceLanguages] = useState<any[]>([]);
  const [filteredTargetLanguages, setFilteredTargetLanguages] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  const [formErrors, setFormErrors] = useState({
    phrase: false,
    translation: false,
    sourceLanguage: false,
    targetLanguage: false,
    tagLength: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recent");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // API state management
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Fetch phrases from backend
  const fetchPhrases = async () => {
    if (!tokens?.access_token) {
      setError("No authentication token available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Build the phrase service URL
      const config = await import('@shared/config').then(m => m.getConfig());
      const baseUrl = (await config).quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const phrasesUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/phrases`;
      
      console.log('Fetching phrases from:', phrasesUrl);
      
      const response = await fetch(phrasesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.success && Array.isArray(responseData.data)) {
          setPhrases(responseData.data);
        } else {
          setError('Invalid response format from server');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to fetch phrases';
        setError(errorMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch phrases';
      setError(message);
      console.error('Error fetching phrases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch languages from backend
  const fetchLanguages = async () => {
    if (!tokens?.access_token) {
      setIsLoadingLanguages(false);
      return;
    }

    try {
      setIsLoadingLanguages(true);

      // Build the phrase service URL for languages
      const config = await import('@shared/config').then(m => m.getConfig());
      const baseUrl = (await config).quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const languagesUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/quiz-languages`;
      
      console.log('Fetching languages from:', languagesUrl);
      
      const response = await fetch(languagesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setLanguages(result.data);
      } else {
        console.error('Languages fetch failed:', result.message);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  // Fetch phrases and languages on component mount
  useEffect(() => {
    fetchPhrases();
    fetchLanguages();
  }, [tokens?.access_token]);

  // Get unique tags from user's phrases (for filtering)
  const allUserTags = Array.from(new Set(phrases.flatMap(phrase => phrase.phraseTags))).sort();

  // Filter and sort phrases based on user selections
  const filteredPhrases = phrases.filter(phrase => {
    // Search filter
    if (searchTerm && !phrase.originalPhrase.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !phrase.meaning.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Language filter
    if (languageFilter && languageFilter !== 'all') {
      const originalLangMatch = phrase.originalLanguage.toLowerCase() === languageFilter.toLowerCase();
      const meaningLangMatch = phrase.meaningLanguage.toLowerCase() === languageFilter.toLowerCase();
      if (!originalLangMatch && !meaningLangMatch) {
        return false;
      }
    }

    // Tag filter
    if (tagFilter && tagFilter !== 'all') {
      if (!phrase.phraseTags.includes(tagFilter)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    // Sort based on selected option
    switch (sortOption) {
      case 'alphabetical':
        return a.originalPhrase.localeCompare(b.originalPhrase);
      case 'proficiency':
        // Sort by status: learned first, then in progress
        if (a.status === 'LEARNED' && b.status === 'IN_PROGRESS') return -1;
        if (a.status === 'IN_PROGRESS' && b.status === 'LEARNED') return 1;
        return 0;
      case 'recent':
      default:
        // Keep original order (assumed to be recent first)
        return 0;
    }
  });

  // Edit dialog handlers
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceLanguageInput(value);
    
    if (value.trim() === '') {
      setFilteredSourceLanguages(LANGUAGES);
      setSourceLanguage('');
    } else {
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSourceLanguages(filtered);
      
      // Check if exact match exists
      const exactMatch = LANGUAGES.find(lang => 
        lang.name.toLowerCase() === value.toLowerCase()
      );
      if (exactMatch) {
        setSourceLanguage(exactMatch.id);
      } else {
        setSourceLanguage('');
      }
    }
  };

  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetLanguageInput(value);
    
    if (value.trim() === '') {
      setFilteredTargetLanguages(LANGUAGES);
      setTargetLanguage('');
    } else {
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTargetLanguages(filtered);
      
      // Check if exact match exists
      const exactMatch = LANGUAGES.find(lang => 
        lang.name.toLowerCase() === value.toLowerCase()
      );
      if (exactMatch) {
        setTargetLanguage(exactMatch.id);
      } else {
        setTargetLanguage('');
      }
    }
  };

  const setLanguage = (type: 'source' | 'target', languageId: string) => {
    const language = LANGUAGES.find(l => l.id === languageId);
    if (language) {
      if (type === 'source') {
        setSourceLanguage(languageId);
        setSourceLanguageInput(language.name);
        setFilteredSourceLanguages([]);
      } else {
        setTargetLanguage(languageId);
        setTargetLanguageInput(language.name);
        setFilteredTargetLanguages([]);
      }
    }
  };

  const handleLanguageKeyDown = (type: 'source' | 'target', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (type === 'source') {
        setFilteredSourceLanguages([]);
      } else {
        setFilteredTargetLanguages([]);
      }
    }
  };

  // Helper function to convert language names to codes
  const convertLanguageNameToCode = (languageName: string): string => {
    // If it's already a valid language code, return it
    const existingLang = LANGUAGES.find(l => l.id === languageName);
    if (existingLang) {
      return languageName;
    }
    
    // Try to find by name (case insensitive)
    const langByName = LANGUAGES.find(l => 
      l.name.toLowerCase() === languageName.toLowerCase()
    );
    
    if (langByName) {
      return langByName.id;
    }
    
    // Handle common variations and mappings
    const nameToCodeMap: { [key: string]: string } = {
      'turkish': 'tr',
      'french': 'fr',
      'english': 'en',
      'spanish': 'es',
      'german': 'de',
      'italian': 'it',
      'portuguese': 'pt',
      'russian': 'ru',
      'chinese': 'zh-CN',
      'japanese': 'ja',
      'korean': 'ko',
      'arabic': 'ar',
      'hindi': 'hi',
      'dutch': 'nl',
      'swedish': 'sv',
      'norwegian': 'no',
      'danish': 'da',
      'finnish': 'fi',
      'polish': 'pl',
      'czech': 'cs',
      'hungarian': 'hu',
      'romanian': 'ro',
      'bulgarian': 'bg',
      'greek': 'el',
      'hebrew': 'he',
      'thai': 'th',
      'vietnamese': 'vi',
      'indonesian': 'id',
      'malay': 'ms',
      'filipino': 'tl',
      'ukrainian': 'uk',
      'croatian': 'hr',
      'serbian': 'sr',
      'slovenian': 'sl',
      'slovak': 'sk',
      'estonian': 'et',
      'latvian': 'lv',
      'lithuanian': 'lt'
    };
    
    const lowerName = languageName.toLowerCase();
    if (nameToCodeMap[lowerName]) {
      return nameToCodeMap[lowerName];
    }
    
    // As a last resort, return the original value
    console.warn(`Unknown language name: ${languageName}, returning as-is`);
    return languageName;
  };

  // Tag handling functions
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      // Filter suggestions based on input using allUserTags
      const filtered = allUserTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered);
    } else {
      // Show all available tags when input is empty
      const availableTagsFiltered = allUserTags.filter(tag => !selectedTags.includes(tag));
      setFilteredSuggestions(availableTagsFiltered);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Check if tag length is within limits (3-16 characters)
    if (trimmedTag.length < 3 || trimmedTag.length > 16) {
      setFormErrors({
        ...formErrors,
        tagLength: true
      });
      return;
    }
    
    // Check if we've reached the maximum tags limit
    if (selectedTags.length >= 3) return;
    
    if (!selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setTagInput("");
      setFilteredSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    if (formErrors.tagLength) {
      setFormErrors({...formErrors, tagLength: false});
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Escape') {
      setFilteredSuggestions([]);
      setIsTagInputFocused(false);
    }
  };

  // Delete phrase handler
  const handleDeletePhrase = async () => {
    if (!selectedPhrase?.externalPhraseId) {
      toast({
        title: "Error",
        description: "Unable to delete phrase: missing phrase ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tokens = authService.getTokens();
      if (!tokens) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to delete phrases",
          variant: "destructive",
        });
        return;
      }

      const config = await getConfig();
      const baseUrl = config.quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const url = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/delete-phrase?phrase-id=${selectedPhrase.externalPhraseId}`;

      console.log('Delete request URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);

      if (response.status === 204) {
        // Success - no response body expected
        toast({
          title: "Success",
          description: "Phrase deleted successfully",
        });

        // Remove the phrase from local state
        setPhrases(phrases.filter(p => p.externalPhraseId !== selectedPhrase.externalPhraseId));
        
        setIsDeleteDialogOpen(false);
        setSelectedPhrase(null);
      } else {
        // Error response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete phrase (${response.status})`;
        
        console.error('Delete error:', errorData);
        
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete request failed:', error);
      const message = error instanceof Error ? error.message : 'Network error occurred';
      
      toast({
        title: "Delete Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = {
      phrase: !editedPhrase.trim(),
      translation: !editedTranslation.trim(),
      sourceLanguage: !sourceLanguage,
      targetLanguage: !targetLanguage,
      tagLength: false
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }

    if (!selectedPhrase || !tokens?.access_token) {
      console.error('No phrase selected or no auth token available');
      return;
    }

    try {
      setIsSubmitting(true);

      // Build the phrase service URL for update with phrase-id query parameter
      const config = await import('@shared/config').then(m => m.getConfig());
      const baseUrl = (await config).quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const updateUrl = `${baseUrl}/swiftling-phrase-service/api/v1/phrase/update-phrase?phrase-id=${selectedPhrase.externalPhraseId}`;

      // Prepare request body
      const requestBody = {
        externalPhraseId: selectedPhrase.externalPhraseId,
        originalPhrase: editedPhrase.trim(),
        originalLanguage: sourceLanguage,
        meaning: editedTranslation.trim(),
        meaningLanguage: targetLanguage,
        phraseTags: selectedTags,
        notes: editedNotes.trim() || undefined
      };

      console.log('Updating phrase with:', requestBody);

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Phrase updated successfully:', result);

        // Show success message
        toast({
          title: "Success",
          description: "Phrase updated successfully!",
        });

        // Close dialog and refresh phrases
        setIsEditDialogOpen(false);
        await fetchPhrases(); // Refresh the phrases list
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update phrase: ${response.status}`;
        console.error('Failed to update phrase:', errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating phrase:', error);
      const message = error instanceof Error ? error.message : 'Failed to update phrase';
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize edit form when dialog opens
  const handleEditOpen = (phrase: Phrase) => {
    setSelectedPhrase(phrase);
    setEditedPhrase(phrase.originalPhrase);
    setEditedTranslation(phrase.meaning);
    setEditedNotes(phrase.notes || "");
    setSelectedTags(phrase.phraseTags || []);
    setTagInput("");

    console.log('Edit dialog - phrase languages from backend:', {
      originalLanguage: phrase.originalLanguage,
      meaningLanguage: phrase.meaningLanguage
    });

    // Convert language names to codes if needed
    const sourceLanguageCode = convertLanguageNameToCode(phrase.originalLanguage);
    const targetLanguageCode = convertLanguageNameToCode(phrase.meaningLanguage);
    
    console.log('Edit dialog - converted to codes:', {
      sourceLanguageCode,
      targetLanguageCode
    });
    
    setSourceLanguage(sourceLanguageCode);
    setTargetLanguage(targetLanguageCode);
    
    // Set input values
    const sourceLang = LANGUAGES.find(l => l.id === sourceLanguageCode);
    const targetLang = LANGUAGES.find(l => l.id === targetLanguageCode);
    setSourceLanguageInput(sourceLang?.name || sourceLanguageCode);
    setTargetLanguageInput(targetLang?.name || targetLanguageCode);
    
    // Reset errors and suggestions
    setFormErrors({
      phrase: false,
      translation: false,
      sourceLanguage: false,
      targetLanguage: false,
      tagLength: false
    });
    setFilteredSuggestions([]);
    setIsTagInputFocused(false);
    
    setIsEditDialogOpen(true);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent leading-tight py-1">My Phrases</h1>
        <GuardedLink href="/add-phrase">
          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Phrase</span>
          </Button>
        </GuardedLink>
      </div>

      {/* Show loading state */}
      {isLoading ? (
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-secondary/70">Loading your phrases...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        /* Show error state */
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Error Loading Phrases</h3>
              <p className="text-secondary/70 mb-6 max-w-md">
                {error}
              </p>
              <Button 
                onClick={fetchPhrases}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : phrases.length === 0 ? (
        /* Show empty state when no phrases */
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">No Phrases Added Yet</h3>
              <p className="text-secondary/70 mb-6 max-w-md">
                Start building your language learning collection by adding your first phrase. You can organize them with tags and track your progress!
              </p>
              <GuardedLink href="/add-phrase">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Phrase
                </Button>
              </GuardedLink>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filter Section - only show when there are phrases */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search phrases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {isLoadingLanguages ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        languages.map((language) => (
                          <SelectItem key={language} value={language.toLowerCase()}>
                            {language}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allUserTags.length === 0 ? (
                        <SelectItem value="no-tags" disabled>No tags available</SelectItem>
                      ) : (
                        allUserTags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                      <SelectItem value="proficiency">Proficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phrases List - only show when there are phrases */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredPhrases.map((phrase) => (
                  <PhraseCard
                    key={phrase.externalPhraseId}
                    phrase={phrase.originalPhrase}
                    translation={phrase.meaning}
                    tags={phrase.phraseTags}
                    learned={phrase.status === 'LEARNED'}
                    notes={phrase.notes}
                    sourceLanguage={phrase.originalLanguage}
                    targetLanguage={phrase.meaningLanguage}
                    onEdit={() => handleEditOpen(phrase)}
                    onDelete={() => {
                      setSelectedPhrase(phrase);
                      setIsDeleteDialogOpen(true);
                    }}
                    onSpeak={() => {
                      setSelectedPhrase(phrase);
                      setIsPronunciationDialogOpen(true);
                    }}
                    onViewNotes={() => {
                      setSelectedPhrase(phrase);
                      setIsNotesDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-primary">{selectedPhrase?.originalPhrase}</span>
              <span className="text-sm font-normal text-gray-500">({selectedPhrase?.meaning})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Languages:</h3>
              <div className="flex gap-2 items-center">
                <Badge className="px-2 py-1 bg-primary/10 text-primary">
                  {selectedPhrase && selectedPhrase.originalLanguage ? selectedPhrase.originalLanguage.charAt(0).toUpperCase() + selectedPhrase.originalLanguage.slice(1) : "Unknown"}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="px-2 py-1 bg-primary/10 text-primary">
                  {selectedPhrase && selectedPhrase.meaningLanguage ? selectedPhrase.meaningLanguage.charAt(0).toUpperCase() + selectedPhrase.meaningLanguage.slice(1) : "Unknown"}
                </Badge>
              </div>
            </div>
            {selectedPhrase?.phraseTags && selectedPhrase.phraseTags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedPhrase.phraseTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {selectedPhrase?.notes && (
              <>
                <h3 className="text-sm font-medium mb-2">Notes:</h3>
                <p className="text-gray-700">{selectedPhrase.notes}</p>
              </>
            )}
            {!selectedPhrase?.notes && (
              <p className="text-gray-500 italic">No notes available for this phrase.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Phrase</DialogTitle>
            <DialogDescription>
              Make changes to your phrase below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-5 overflow-y-auto h-[50vh] max-h-[50vh] sm:h-auto sm:max-h-full px-1 py-2">
              <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-4">
                {/* Row 1: Phrase & Source Language */}
                <div className="sm:col-span-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phrase">Phrase to Learn</Label>
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
                    <Label htmlFor="edit-sourceLanguage">Language of the Phrase</Label>
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
                        onFocus={() => {
                          setFilteredSourceLanguages(LANGUAGES);
                          // Auto-scroll to bring the input into view
                          setTimeout(() => {
                            const element = document.getElementById('edit-sourceLanguage');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        onBlur={() => {
                          // Small delay to allow clicking on dropdown items
                          setTimeout(() => setFilteredSourceLanguages([]), 200);
                        }}
                        onKeyDown={(e) => handleLanguageKeyDown('source', e)}
                        className={formErrors.sourceLanguage && !sourceLanguage ? "border-red-500" : ""}
                      />

                      {/* Source language suggestions */}
                      {filteredSourceLanguages.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
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
                    <Label htmlFor="edit-translation">Meaning of the Phrase</Label>
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
                      placeholder="Enter meaning in your language"
                      className={formErrors.translation ? "border-red-500" : ""}
                    />
                    {formErrors.translation && (
                      <p className="text-sm text-red-500">Translation is required</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="edit-targetLanguage">Language of the Meaning</Label>
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
                        onFocus={() => {
                          setFilteredTargetLanguages(LANGUAGES);
                          // Auto-scroll to bring the input into view
                          setTimeout(() => {
                            const element = document.getElementById('edit-targetLanguage');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        onBlur={() => {
                          // Small delay to allow clicking on dropdown items
                          setTimeout(() => setFilteredTargetLanguages([]), 200);
                        }}
                        onKeyDown={(e) => handleLanguageKeyDown('target', e)}
                        className={formErrors.targetLanguage && !targetLanguage ? "border-red-500" : ""}
                      />

                      {/* Target language suggestions */}
                      {filteredTargetLanguages.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
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
                      placeholder={selectedTags.length >= 3 ? "Maximum tags reached" : "Type or select a tag..."}
                      value={tagInput}
                      onChange={(e) => {
                        handleTagInputChange(e);
                        if (formErrors.tagLength) {
                          setFormErrors({...formErrors, tagLength: false});
                        }
                      }}
                      onFocus={() => {
                        const availableTagsFiltered = allUserTags.filter(tag => !selectedTags.includes(tag));
                        setFilteredSuggestions(availableTagsFiltered);
                        setIsTagInputFocused(true);
                        // Auto-scroll to bring the input into view
                        setTimeout(() => {
                          const element = document.getElementById('edit-tags');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
                      onBlur={() => {
                        // Small delay to allow clicking on dropdown items
                        setTimeout(() => setIsTagInputFocused(false), 200);
                      }}
                      onKeyDown={handleTagKeyDown}
                      disabled={selectedTags.length >= 3}
                      className={`pr-8 ${formErrors.tagLength ? "border-red-500" : ""}`}
                    />
                    {formErrors.tagLength && (
                      <p className="text-sm text-red-500">Tags must be between 3-16 characters</p>
                    )}
                    {tagInput && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => addTag(tagInput)}
                        disabled={selectedTags.length >= 3}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Tag suggestions */}
                    {filteredSuggestions.length > 0 && selectedTags.length < 3 && isTagInputFocused && (
                      <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-40 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
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
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pronunciation Dialog */}
      <Dialog open={isPronunciationDialogOpen} onOpenChange={setIsPronunciationDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Pronunciation <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
            </DialogTitle>
            <DialogDescription>
              This feature will allow you to listen to phrase pronunciations in a future update
            </DialogDescription>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-6">
              {/* Original phrase pronunciation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Original Phrase</h3>
                    <p className="text-lg mt-1 text-gray-800">
                      {selectedPhrase?.originalPhrase}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPhrase?.originalLanguage && 
                        selectedPhrase.originalLanguage.charAt(0).toUpperCase() + 
                        selectedPhrase.originalLanguage.slice(1)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    disabled={isPlayingOriginal}
                    onClick={() => {
                      setIsPlayingOriginal(true);
                      // TODO: Add actual TTS functionality
                      setTimeout(() => setIsPlayingOriginal(false), 2000);
                    }}
                    title="Pronunciation feature coming soon"
                  >
                    {isPlayingOriginal ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <span className="text-lg">🔊</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 italic">Pronunciation will be available in a future update</p>
              </div>

              {/* Translation pronunciation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">Translation</h3>
                    <p className="text-lg mt-1 text-gray-800">
                      {selectedPhrase?.meaning}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPhrase?.meaningLanguage && 
                        selectedPhrase.meaningLanguage.charAt(0).toUpperCase() + 
                        selectedPhrase.meaningLanguage.slice(1)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    disabled={isPlayingTranslation}
                    onClick={() => {
                      setIsPlayingTranslation(true);
                      // TODO: Add actual TTS functionality
                      setTimeout(() => setIsPlayingTranslation(false), 2000);
                    }}
                    title="Pronunciation feature coming soon"
                  >
                    {isPlayingTranslation ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <span className="text-lg">🔊</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 italic">Pronunciation will be available in a future update</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Phrase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this phrase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePhrase}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Phrase'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}