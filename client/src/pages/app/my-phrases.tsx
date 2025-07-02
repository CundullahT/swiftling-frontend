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

import { useState, useEffect } from "react";
import { GuardedLink } from "@/components/ui/guarded-link";
import { useAuth } from "@/context/auth-context";

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

      // Build the quiz service URL for languages
      const config = await import('@shared/config').then(m => m.getConfig());
      const baseUrl = (await config).quizServiceUrl.replace('/swiftling-user-service/api/v1', '');
      const languagesUrl = `${baseUrl}/swiftling-quiz-service/api/v1/quiz/languages`;
      
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

  // Get unique tags from user's phrases
  const availableTags = Array.from(new Set(phrases.flatMap(phrase => phrase.phraseTags))).sort();

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
                      {availableTags.length === 0 ? (
                        <SelectItem value="no-tags" disabled>No tags available</SelectItem>
                      ) : (
                        availableTags.map((tag) => (
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
                    onEdit={() => console.log('Edit phrase:', phrase.externalPhraseId)}
                    onDelete={() => console.log('Delete phrase:', phrase.externalPhraseId)}
                    onSpeak={() => console.log('Speak phrase:', phrase.externalPhraseId)}
                    onViewNotes={() => console.log('View notes:', phrase.externalPhraseId)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}