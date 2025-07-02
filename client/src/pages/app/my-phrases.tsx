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
                    onEdit={() => {
                      setSelectedPhrase(phrase);
                      setIsEditDialogOpen(true);
                    }}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-primary">{selectedPhrase?.originalPhrase}</span>
              <span className="text-sm font-normal text-gray-500">({selectedPhrase?.meaning})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Languages:</h3>
              <div className="flex gap-2 items-center">
                <Badge className="px-2 py-1 bg-primary/10 text-primary">
                  {selectedPhrase?.originalLanguage?.charAt(0).toUpperCase() + selectedPhrase?.originalLanguage?.slice(1) || "Unknown"}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="px-2 py-1 bg-primary/10 text-primary">
                  {selectedPhrase?.meaningLanguage?.charAt(0).toUpperCase() + selectedPhrase?.meaningLanguage?.slice(1) || "Unknown"}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Phrase</DialogTitle>
            <DialogDescription>
              Update your phrase information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-phrase">Phrase</Label>
              <Input
                id="edit-phrase"
                defaultValue={selectedPhrase?.originalPhrase}
                placeholder="Enter phrase..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-meaning">Meaning</Label>
              <Input
                id="edit-meaning"
                defaultValue={selectedPhrase?.meaning}
                placeholder="Enter meaning..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                defaultValue={selectedPhrase?.notes || ""}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Phrase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this phrase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedPhrase?.originalPhrase}</p>
              <p className="text-gray-600">{selectedPhrase?.meaning}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Phrase</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}