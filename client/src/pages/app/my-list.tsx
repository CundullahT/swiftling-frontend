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
import { useState, useEffect } from "react";
import { Link } from "wouter";


export default function MyList() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");

  // State for modals
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPronunciationDialogOpen, setIsPronunciationDialogOpen] = useState(false);
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
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recent");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Use an effect to scroll to top whenever the page changes
  useEffect(() => {
    // For smoother behavior, use smooth scrolling that matches the app navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Log for debugging
    console.log(`Page changed to ${currentPage}, scrolling to top`);
  }, [currentPage]);
  
  // Simpler page setter function
  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Custom setter for search term that also resets pagination
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    changePage(1); // Reset to page 1 when search changes
  };
  
  // Custom setter for tag filter that also resets pagination
  const handleTagFilterChange = (value: string) => {
    setTagFilter(value);
    changePage(1); // Reset to page 1 when filter changes
  };
  
  // Custom setter for sort option that also resets pagination
  const handleSortOptionChange = (value: string) => {
    setSortOption(value);
    changePage(1); // Reset to page 1 when sort changes
  };

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
    /* The rest of your phrases example data */
    // For brevity, we're not including all 50 phrases in this snippet
  ]);
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    phrase: false,
    translation: false,
    sourceLanguage: false,
    targetLanguage: false,
  });
  
  // Handle adding and removing tags
  const handleTagAdd = () => {
    if (tagInput.trim() && selectedTags.length < 3 && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput("");
      setFilteredSuggestions([]);
    }
  };
  
  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      const filtered = SAMPLE_TAGS.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) && 
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
    } else {
      setFilteredSuggestions([]);
    }
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    } else if (e.key === 'Backspace' && tagInput === "" && selectedTags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      handleTagRemove(selectedTags[selectedTags.length - 1]);
    }
  };
  
  // Language selection
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceLanguageInput(value);
    
    if (value.trim()) {
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSourceLanguages(filtered.slice(0, 5)); // Show max 5 suggestions
    } else {
      setFilteredSourceLanguages([]);
    }
  };
  
  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetLanguageInput(value);
    
    if (value.trim()) {
      const filtered = LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTargetLanguages(filtered.slice(0, 5)); // Show max 5 suggestions
    } else {
      setFilteredTargetLanguages([]);
    }
  };
  
  const handleLanguageKeyDown = (type: 'source' | 'target', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'source') {
        setLanguage('source', sourceLanguageInput);
      } else {
        setLanguage('target', targetLanguageInput);
      }
    }
  };
  
  const setLanguage = (type: 'source' | 'target', value: string) => {
    const matchedLanguage = LANGUAGES.find(lang => 
      lang.name.toLowerCase() === value.toLowerCase()
    );
    
    if (matchedLanguage) {
      if (type === 'source') {
        setSourceLanguage(matchedLanguage.id);
        setSourceLanguageInput(matchedLanguage.name);
        setFilteredSourceLanguages([]);
        
        if (formErrors.sourceLanguage) {
          setFormErrors({...formErrors, sourceLanguage: false});
        }
      } else {
        setTargetLanguage(matchedLanguage.id);
        setTargetLanguageInput(matchedLanguage.name);
        setFilteredTargetLanguages([]);
        
        if (formErrors.targetLanguage) {
          setFormErrors({...formErrors, targetLanguage: false});
        }
      }
    } else if (value.trim()) {
      // If it's a new language not in our predefined list
      const newLang = value.trim().toLowerCase();
      if (type === 'source') {
        setSourceLanguage(newLang);
        setSourceLanguageInput(value);
        setFilteredSourceLanguages([]);
        
        if (formErrors.sourceLanguage) {
          setFormErrors({...formErrors, sourceLanguage: false});
        }
      } else {
        setTargetLanguage(newLang);
        setTargetLanguageInput(value);
        setFilteredTargetLanguages([]);
        
        if (formErrors.targetLanguage) {
          setFormErrors({...formErrors, targetLanguage: false});
        }
      }
    }
  };
  
  // Filter and sort phrases
  const getFilteredAndSortedPhrases = () => {
    let result = [...phrases];
    
    // Apply tag filter
    if (tagFilter !== "all") {
      result = result.filter(phrase => 
        phrase.tags && phrase.tags.includes(tagFilter)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(phrase => 
        phrase.phrase.toLowerCase().includes(lowercasedTerm) || 
        phrase.translation.toLowerCase().includes(lowercasedTerm) ||
        (phrase.tags && phrase.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))) ||
        (phrase.notes && phrase.notes.toLowerCase().includes(lowercasedTerm)) ||
        (phrase.sourceLanguage && phrase.sourceLanguage.toLowerCase().includes(lowercasedTerm)) ||
        (phrase.targetLanguage && phrase.targetLanguage.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "alphabetical":
        result.sort((a, b) => a.phrase.localeCompare(b.phrase));
        break;
      case "proficiency-high":
        result.sort((a, b) => b.proficiency - a.proficiency);
        break;
      case "proficiency-low":
        result.sort((a, b) => a.proficiency - b.proficiency);
        break;
      case "recent":
      default:
        // For demo, we'll keep the original order as "recent"
        result.sort((a, b) => b.id - a.id);
        break;
    }
    
    return result;
  };
  
  // Get the current page items
  const getCurrentPageItems = () => {
    return getFilteredAndSortedPhrases().slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    );
  };
  
  // Handle pronunciation (just a placeholder)
  const playPronunciation = (text: string, language: string, isOriginal: boolean) => {
    if (isOriginal) {
      setIsPlayingOriginal(true);
      setTimeout(() => setIsPlayingOriginal(false), 2000);
    } else {
      setIsPlayingTranslation(true);
      setTimeout(() => setIsPlayingTranslation(false), 2000);
    }
    
    console.log(`Playing "${text}" in ${language}`);
  };
  
  // Handle edit
  const handleEdit = (phrase: any) => {
    setSelectedPhrase(phrase);
    setEditedPhrase(phrase.phrase);
    setEditedTranslation(phrase.translation);
    setEditedNotes(phrase.notes || "");
    setSelectedTags(phrase.tags || []);
    setSourceLanguage(phrase.sourceLanguage || "");
    setSourceLanguageInput(phrase.sourceLanguage || "");
    setTargetLanguage(phrase.targetLanguage || "");
    setTargetLanguageInput(phrase.targetLanguage || "");
    setIsEditDialogOpen(true);
  };
  
  // Handle view notes
  const handleViewNotes = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsNotesDialogOpen(true);
  };
  
  // Handle pronunciation dialog
  const handlePronunciation = (phrase: any) => {
    setSelectedPhrase(phrase);
    setIsPronunciationDialogOpen(true);
  };
  
  // Handle delete (placeholder)
  const handleDelete = (id: number) => {
    console.log(`Deleting phrase with ID: ${id}`);
    // In a real app, we would delete from the database
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    const errors = {
      phrase: !editedPhrase.trim(),
      translation: !editedTranslation.trim(),
      sourceLanguage: !sourceLanguage,
      targetLanguage: !targetLanguage,
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      return; // Stop if there are errors
    }
    
    // In a real app, this would update the phrase in the database
    console.log("Updating phrase:", {
      id: selectedPhrase?.id,
      phrase: editedPhrase,
      translation: editedTranslation,
      notes: editedNotes,
      tags: selectedTags,
      sourceLanguage,
      targetLanguage,
    });
    
    // Close the dialog
    setIsEditDialogOpen(false);
  };

  // Pagination Controls Component
  const PaginationControls = ({ position }: { position: 'top' | 'bottom' }) => {
    const totalPages = Math.ceil(getFilteredAndSortedPhrases().length / itemsPerPage);
    if (getFilteredAndSortedPhrases().length <= itemsPerPage) return null;
    
    return (
      <div className={`w-full p-4 flex justify-center items-center ${position === 'bottom' ? 'border-t' : 'border-b'} border-primary/10 bg-primary/5`}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* First/Previous buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
              className="hidden sm:flex"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center min-w-0"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({length: Math.min(3, totalPages)}, (_, i) => {
                const pageNum = currentPage === 1 ? i + 1 : 
                              currentPage === totalPages ? 
                              Math.max(1, totalPages - 2) + i :
                              currentPage - 1 + i;
                
                if (pageNum <= totalPages) {
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => changePage(pageNum)}
                      className="w-9 h-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Next/Last buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center min-w-0"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden sm:flex"
            >
              Last
            </Button>
          </div>
          
          {/* Page indicator for small screens */}
          <div className="text-sm text-gray-500 w-full text-center sm:hidden mt-2">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Phrases</h1>
          <p className="text-gray-500 mt-1">Manage your saved phrases and translations</p>
        </div>
        <Link href="/add-phrase">
          <Button className="w-full md:w-auto">
            Add New Phrase
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Search & Filter</h2>
            <div className="relative">
              <Input
                placeholder="Search phrases..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tag-filter" className="mb-2 block text-sm">Filter by Tag</Label>
              <Select 
                value={tagFilter} 
                onValueChange={handleTagFilterChange}
              >
                <SelectTrigger id="tag-filter" className="w-full">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {SAMPLE_TAGS.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort-option" className="mb-2 block text-sm">Sort by</Label>
              <Select 
                value={sortOption} 
                onValueChange={handleSortOptionChange}
              >
                <SelectTrigger id="sort-option" className="w-full">
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
            <Button 
              variant="outline" 
              size="icon"
              className="h-10 w-10 shrink-0 self-end"
              title="Clear all filters and sorting"
              onClick={() => {
                handleSearchTermChange("");
                handleTagFilterChange("all");
                handleSortOptionChange("recent");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Phrases List with pagination at top and bottom */}
      <Card className="mb-6">
        <div className="divide-y divide-gray-200">
          {getFilteredAndSortedPhrases().length > 0 ? (
            <>
              {/* Top pagination */}
              <PaginationControls position="top" />
              
              {/* Phrases list */}
              <div className="divide-y divide-gray-200">
                {getCurrentPageItems().map((phrase) => (
                  <div key={phrase.id} className="p-3 sm:p-4">
                    <PhraseCard
                      phrase={phrase.phrase}
                      translation={phrase.translation}
                      tags={phrase.tags}
                      proficiency={phrase.proficiency}
                      notes={phrase.notes}
                      sourceLanguage={phrase.sourceLanguage}
                      targetLanguage={phrase.targetLanguage}
                      onEdit={() => handleEdit(phrase)}
                      onDelete={() => handleDelete(phrase.id)}
                      onSpeak={() => handlePronunciation(phrase)}
                      onViewNotes={() => handleViewNotes(phrase)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Bottom pagination */}
              <PaginationControls position="bottom" />
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No phrases match your filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  handleSearchTermChange("");
                  handleTagFilterChange("all");
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
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Status:</h3>
              <div>
                {(selectedPhrase?.proficiency || 0) > 80 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                    Learned
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    In&nbsp;Progress
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium mb-2">Notes:</h3>
            <p className="text-gray-700">{selectedPhrase?.notes}</p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Pronunciation Dialog */}
      <Dialog open={isPronunciationDialogOpen} onOpenChange={setIsPronunciationDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                      {selectedPhrase?.phrase}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPhrase?.sourceLanguage && 
                        selectedPhrase.sourceLanguage.charAt(0).toUpperCase() + 
                        selectedPhrase.sourceLanguage.slice(1)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    disabled={isPlayingOriginal}
                    onClick={() => selectedPhrase && 
                      playPronunciation(
                        selectedPhrase.phrase, 
                        selectedPhrase.sourceLanguage || 'en',
                        true
                      )
                    }
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
                      {selectedPhrase?.translation}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPhrase?.targetLanguage && 
                        selectedPhrase.targetLanguage.charAt(0).toUpperCase() + 
                        selectedPhrase.targetLanguage.slice(1)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-10 w-10"
                    disabled={isPlayingTranslation}
                    onClick={() => selectedPhrase && 
                      playPronunciation(
                        selectedPhrase.translation, 
                        selectedPhrase.targetLanguage || 'en',
                        false
                      )
                    }
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
                                setSourceLanguage(language.id);
                                setSourceLanguageInput(language.name);
                                setFilteredSourceLanguages([]);
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
                    placeholder="Enter translation"
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
                                setTargetLanguage(language.id);
                                setTargetLanguageInput(language.name);
                                setFilteredTargetLanguages([]);
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
                  {formErrors.targetLanguage && !targetLanguage && (
                    <p className="text-sm text-red-500">Target language is required</p>
                  )}
                </div>
              </div>
              
              {/* Row 3: Tags */}
              <div className="sm:col-span-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (up to 3)</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white">
                    {/* Selected tags */}
                    {selectedTags.map(tag => (
                      <div key={tag} className="flex items-center gap-1 bg-primary/10 text-primary-700 px-2 py-1 rounded-full">
                        <span>{tag}</span>
                        <button 
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="text-primary-700 hover:text-primary-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Tag input */}
                    {selectedTags.length < 3 && (
                      <div className="relative">
                        <Input 
                          id="edit-tags"
                          value={tagInput}
                          onChange={handleTagInputChange}
                          onKeyDown={handleTagKeyDown}
                          placeholder="Add a tag..."
                          className="border-0 h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        
                        {/* Tag suggestions */}
                        {filteredSuggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                            <ul className="divide-y divide-gray-200">
                              {filteredSuggestions.map((tag) => (
                                <li
                                  key={tag}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setSelectedTags([...selectedTags, tag]);
                                    setTagInput("");
                                    setFilteredSuggestions([]);
                                  }}
                                >
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Press Enter to add a tag. Backspace to remove the last tag.</p>
                </div>
              </div>
              
              {/* Row 4: Notes */}
              <div className="sm:col-span-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes (optional)</Label>
                  <Textarea 
                    id="edit-notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add any notes or context about this phrase..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}