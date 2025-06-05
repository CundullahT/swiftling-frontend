import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Search, ChevronLeft, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
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
import { GuardedLink } from "@/components/ui/guarded-link";

export default function MyList() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  // State for modals
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPronunciationDialogOpen, setIsPronunciationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
  
  // Audio states
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingTranslation, setIsPlayingTranslation] = useState(false);

  // Edit dialog states
  const [editedPhrase, setEditedPhrase] = useState("");
  const [editedTranslation, setEditedTranslation] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Language selection states for edit dialog
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguageInput, setSourceLanguageInput] = useState("");
  const [targetLanguageInput, setTargetLanguageInput] = useState("");
  const [filteredSourceLanguages, setFilteredSourceLanguages] = useState<typeof LANGUAGES>([]);
  const [filteredTargetLanguages, setFilteredTargetLanguages] = useState<typeof LANGUAGES>([]);

  // Phrases data - empty array to show empty state
  const [phrases, setPhrases] = useState<any[]>([]);

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    phrase: false,
    translation: false,
    sourceLanguage: false,
    targetLanguage: false,
    tagLength: false
  });

  // Handler functions
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (value: string) => {
    setTagFilter(value);
    setCurrentPage(1);
  };

  const handleLanguageFilterChange = (value: string) => {
    setLanguageFilter(value);
    setCurrentPage(1);
  };

  const handleSortOptionChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  // Filter and sort function
  const getFilteredAndSortedPhrases = () => {
    return phrases.filter(phrase => {
      const matchesSearch = phrase.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           phrase.translation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = tagFilter === "all" || phrase.tags?.includes(tagFilter);
      const matchesLanguage = languageFilter === "all" || 
                             phrase.sourceLanguage === languageFilter || 
                             phrase.targetLanguage === languageFilter;
      return matchesSearch && matchesTag && matchesLanguage;
    }).sort((a, b) => {
      switch (sortOption) {
        case "alphabetical":
          return a.phrase.localeCompare(b.phrase);
        case "proficiency":
          return b.proficiency - a.proficiency;
        case "recent":
        default:
          return b.id - a.id;
      }
    });
  };

  // Dialog handlers
  const handleEdit = (phrase: any) => {
    setSelectedPhrase(phrase);
    setEditedPhrase(phrase.phrase);
    setEditedTranslation(phrase.translation);
    setEditedNotes(phrase.notes || "");
    setSelectedTags(phrase.tags || []);
    setSourceLanguage(phrase.sourceLanguage || "");
    setTargetLanguage(phrase.targetLanguage || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirmation = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsDeleteDialogOpen(true);
  };

  const handlePronunciation = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsPronunciationDialogOpen(true);
  };

  const handleViewNotes = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsNotesDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedPhrase) {
      setPhrases(phrases.filter(p => p.id !== selectedPhrase.id));
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setIsEditDialogOpen(false);
  };

  // Tag management functions
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput("");
      setFilteredSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.length > 0) {
      const filtered = SAMPLE_TAGS.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && selectedTags.length < 3) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  // Language input handlers
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceLanguageInput(value);
    
    if (value.length > 0) {
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
    
    if (value.length > 0) {
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTargetLanguages(filtered);
    } else {
      setFilteredTargetLanguages([]);
    }
  };

  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'source' | 'target') => {
    // Handle language selection on Enter key
  };

  const playPronunciation = (text: string, language: string, isOriginal: boolean) => {
    // Handle text-to-speech functionality
  };

  const setLanguage = (language: any, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceLanguage(language.value);
      setSourceLanguageInput(language.name);
      setFilteredSourceLanguages([]);
    } else {
      setTargetLanguage(language.value);
      setTargetLanguageInput(language.name);
      setFilteredTargetLanguages([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">My Phrases</h1>
        <p className="text-secondary/70">Manage and review your saved phrases</p>
      </div>

      {/* Empty state when no phrases exist */}
      {phrases.length === 0 ? (
        <Card className="mb-6">
          <div className="pt-8 pb-8 px-6">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">No Phrases Added Yet</h3>
              <p className="text-secondary/70 mb-6 max-w-md">
                You haven't added any phrases to your learning list yet. Start building your vocabulary by adding your first phrase!
              </p>
              <GuardedLink href="/add-phrase">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Add Your First Phrase
                </Button>
              </GuardedLink>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Search and Filter Controls */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search phrases..."
                    value={searchTerm}
                    onChange={(e) => handleSearchTermChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tag Filter */}
                <Select value={tagFilter} onValueChange={handleTagFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {SAMPLE_TAGS.map((tag) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Language Filter */}
                <Select value={languageFilter} onValueChange={handleLanguageFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.value} value={language.value}>{language.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortOption} onValueChange={handleSortOptionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="proficiency">Proficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters button */}
              {(searchTerm || tagFilter !== "all" || languageFilter !== "all" || sortOption !== "recent") && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSearchTermChange("");
                      handleTagFilterChange("all");
                      handleLanguageFilterChange("all");
                      handleSortOptionChange("recent");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                </div>
              )}
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
                        onDelete={() => handleDeleteConfirmation(phrase)}
                        onSpeak={() => handlePronunciation(phrase)}
                        onViewNotes={() => handleViewNotes(phrase)}
                      />
                    ))}
                  
                  {/* Pagination */}
                  {getFilteredAndSortedPhrases().length > itemsPerPage && (
                    <div className="w-full p-4 flex justify-center items-center border-t border-primary/10 bg-primary/5">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="hidden sm:flex"
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center min-w-0"
                          >
                            <ChevronLeft className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Previous</span>
                          </Button>
                          
                          <div className="flex items-center gap-1">
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
                            className="flex items-center min-w-0"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 sm:ml-1" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage))}
                            disabled={currentPage === Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage)}
                            className="hidden sm:flex"
                          >
                            Last
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-500 w-full text-center sm:hidden mt-2">
                          Page {currentPage} of {Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage)}
                        </div>
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
                      handleSearchTermChange("");
                      handleTagFilterChange("all");
                      handleLanguageFilterChange("all");
                      handleSortOptionChange("recent");
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-secondary">Notes</DialogTitle>
            <DialogDescription className="text-secondary/70">
              Notes for "{selectedPhrase?.phrase}" → "{selectedPhrase?.translation}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-secondary/60">
              <span className="font-medium">{selectedPhrase?.sourceLanguage && selectedPhrase?.sourceLanguage in LANGUAGES ? LANGUAGES.find(lang => lang.value === selectedPhrase.sourceLanguage)?.name : selectedPhrase?.sourceLanguage}</span>
              <span>→</span>
              <span className="font-medium">{selectedPhrase?.targetLanguage && selectedPhrase?.targetLanguage in LANGUAGES ? LANGUAGES.find(lang => lang.value === selectedPhrase.targetLanguage)?.name : selectedPhrase?.targetLanguage}</span>
            </div>
            
            {selectedPhrase?.tags && selectedPhrase.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedPhrase.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="bg-secondary/5 rounded-lg p-4">
              <p className="text-secondary text-sm leading-relaxed">
                {selectedPhrase?.notes || "No notes available for this phrase."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pronunciation Dialog */}
      <Dialog open={isPronunciationDialogOpen} onOpenChange={setIsPronunciationDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-secondary">Practice Pronunciation</DialogTitle>
            <DialogDescription className="text-secondary/70">
              Listen to the pronunciation and practice speaking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Original phrase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary/70">
                  {selectedPhrase?.sourceLanguage && selectedPhrase?.sourceLanguage in LANGUAGES ? LANGUAGES.find(lang => lang.value === selectedPhrase.sourceLanguage)?.name : selectedPhrase?.sourceLanguage}
                </span>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-lg font-medium text-secondary mb-3">{selectedPhrase?.phrase}</p>
                <Button
                  onClick={() => selectedPhrase && playPronunciation(selectedPhrase.phrase, selectedPhrase.sourceLanguage || '', true)}
                  variant="outline"
                  size="sm"
                  disabled={isPlayingOriginal}
                  className="w-full"
                >
                  {isPlayingOriginal ? "Playing..." : "🔊 Play Pronunciation"}
                </Button>
              </div>
            </div>

            {/* Translation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary/70">
                  {selectedPhrase?.targetLanguage && selectedPhrase?.targetLanguage in LANGUAGES ? LANGUAGES.find(lang => lang.value === selectedPhrase.targetLanguage)?.name : selectedPhrase?.targetLanguage}
                </span>
              </div>
              <div className="bg-accent/5 rounded-lg p-4">
                <p className="text-lg font-medium text-secondary mb-3">{selectedPhrase?.translation}</p>
                <Button
                  onClick={() => selectedPhrase && playPronunciation(selectedPhrase.translation, selectedPhrase.targetLanguage || '', false)}
                  variant="outline"
                  size="sm"
                  disabled={isPlayingTranslation}
                  className="w-full"
                >
                  {isPlayingTranslation ? "Playing..." : "🔊 Play Pronunciation"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Phrase Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-secondary">Edit Phrase</DialogTitle>
            <DialogDescription className="text-secondary/70">
              Update your phrase and its details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phrase Input */}
            <div className="space-y-2">
              <Label htmlFor="phrase" className="text-sm font-medium text-secondary">
                Phrase *
              </Label>
              <Input
                id="phrase"
                value={editedPhrase}
                onChange={(e) => {
                  setEditedPhrase(e.target.value);
                  setFormErrors(prev => ({ ...prev, phrase: false }));
                }}
                className={formErrors.phrase ? "border-red-500" : ""}
                placeholder="Enter the phrase"
              />
              {formErrors.phrase && (
                <p className="text-red-500 text-xs">Please enter a phrase</p>
              )}
            </div>

            {/* Source Language */}
            <div className="space-y-2 relative">
              <Label htmlFor="sourceLanguage" className="text-sm font-medium text-secondary">
                Source Language *
              </Label>
              <Input
                id="sourceLanguage"
                value={sourceLanguageInput}
                onChange={handleSourceLanguageChange}
                onFocus={() => {
                  setFormErrors(prev => ({ ...prev, sourceLanguage: false }));
                  if (sourceLanguageInput.length > 0) {
                    setFilteredSourceLanguages(LANGUAGES.filter(lang => 
                      lang.name.toLowerCase().includes(sourceLanguageInput.toLowerCase())
                    ));
                  } else {
                    setFilteredSourceLanguages(LANGUAGES);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setFilteredSourceLanguages([]), 150);
                }}
                onKeyDown={(e) => handleLanguageKeyDown(e, 'source')}
                className={formErrors.sourceLanguage ? "border-red-500" : ""}
                placeholder="Search for a language..."
              />

              {filteredSourceLanguages.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredSourceLanguages.map((language) => (
                    <div
                      key={language.value}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => setLanguage(language, 'source')}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{language.icon}</span>
                        <span>{language.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sourceLanguage && (
                <div className="flex items-center text-sm text-secondary/70 mt-1">
                  <span className="mr-2">{LANGUAGES.find(lang => lang.value === sourceLanguage)?.icon}</span>
                  <span>Selected: {LANGUAGES.find(lang => lang.value === sourceLanguage)?.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSourceLanguage("");
                      setSourceLanguageInput("");
                      setFormErrors(prev => ({ ...prev, sourceLanguage: false }));
                    }}
                    className="ml-2 h-auto p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {formErrors.sourceLanguage && !sourceLanguage && (
                <p className="text-red-500 text-xs">Please select a source language</p>
              )}
            </div>

            {/* Translation Input */}
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-sm font-medium text-secondary">
                Translation *
              </Label>
              <Input
                id="translation"
                value={editedTranslation}
                onChange={(e) => {
                  setEditedTranslation(e.target.value);
                  setFormErrors(prev => ({ ...prev, translation: false }));
                }}
                className={formErrors.translation ? "border-red-500" : ""}
                placeholder="Enter the translation"
              />
              {formErrors.translation && (
                <p className="text-red-500 text-xs">Please enter a translation</p>
              )}
            </div>

            {/* Target Language */}
            <div className="space-y-2 relative">
              <Label htmlFor="targetLanguage" className="text-sm font-medium text-secondary">
                Target Language *
              </Label>
              <Input
                id="targetLanguage"
                value={targetLanguageInput}
                onChange={handleTargetLanguageChange}
                onFocus={() => {
                  setFormErrors(prev => ({ ...prev, targetLanguage: false }));
                  if (targetLanguageInput.length > 0) {
                    setFilteredTargetLanguages(LANGUAGES.filter(lang => 
                      lang.name.toLowerCase().includes(targetLanguageInput.toLowerCase())
                    ));
                  } else {
                    setFilteredTargetLanguages(LANGUAGES);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setFilteredTargetLanguages([]), 150);
                }}
                onKeyDown={(e) => handleLanguageKeyDown(e, 'target')}
                className={formErrors.targetLanguage ? "border-red-500" : ""}
                placeholder="Search for a language..."
              />

              {filteredTargetLanguages.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredTargetLanguages.map((language) => (
                    <div
                      key={language.value}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => setLanguage(language, 'target')}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{language.icon}</span>
                        <span>{language.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {targetLanguage && (
                <div className="flex items-center text-sm text-secondary/70 mt-1">
                  <span className="mr-2">{LANGUAGES.find(lang => lang.value === targetLanguage)?.icon}</span>
                  <span>Selected: {LANGUAGES.find(lang => lang.value === targetLanguage)?.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTargetLanguage("");
                      setTargetLanguageInput("");
                      setFormErrors(prev => ({ ...prev, targetLanguage: false }));
                    }}
                    className="ml-2 h-auto p-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {formErrors.targetLanguage && !targetLanguage && (
                <p className="text-red-500 text-xs">Please select a target language</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-secondary">Notes</Label>
              <Textarea
                id="notes"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add any notes about this phrase (optional)"
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-secondary">Tags (up to 3)</Label>
              
              {/* Selected tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="h-auto p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag input */}
              {selectedTags.length < 3 && (
                <div className="space-y-2 relative">
                  <Input
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onFocus={() => {
                      setFormErrors(prev => ({ ...prev, tagLength: false }));
                      if (selectedTags.length < 3) {
                        setFilteredSuggestions(SAMPLE_TAGS.filter(tag => 
                          !selectedTags.includes(tag)
                        ));
                      } else {
                        setFilteredSuggestions([]);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        if (selectedTags.length < 3) {
                          setFilteredSuggestions([]);
                        }
                      }, 150);
                    }}
                    onKeyDown={handleTagKeyDown}
                    placeholder={selectedTags.length >= 3 ? "Maximum 3 tags reached" : "Type to search tags or create new..."}
                    disabled={selectedTags.length >= 3}
                    className={formErrors.tagLength ? "border-red-500" : ""}
                  />

                  {formErrors.tagLength && selectedTags.length >= 3 && (
                    <p className="text-red-500 text-xs">Maximum 3 tags allowed. Remove a tag to add another.</p>
                  )}

                  {/* Tag suggestions */}
                  {tagInput.length > 0 && filteredSuggestions.length > 0 && selectedTags.length < 3 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
                      {filteredSuggestions.map((tag) => (
                        <div
                          key={tag}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-secondary">Delete Phrase</DialogTitle>
            <DialogDescription className="text-secondary/70">
              Are you sure you want to delete this phrase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhrase && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-secondary">{selectedPhrase.phrase}</p>
                <p className="text-sm text-secondary/70">{selectedPhrase.translation}</p>
                {selectedPhrase.tags && selectedPhrase.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPhrase.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete Phrase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}