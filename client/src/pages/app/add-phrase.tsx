import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Badge,
  badgeVariants
} from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_TAGS, LANGUAGES } from "@/lib/constants";
import { X, Plus } from "lucide-react";

export default function AddPhrase() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  const [, setLocation] = useLocation();
  const [multiplePhrasesValue, setMultiplePhrasesValue] = useState("");
  
  // Form state
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
  
  // Form validation states
  const [formErrors, setFormErrors] = useState({
    phrase: false,
    translation: false,
    sourceLanguage: false,
    targetLanguage: false,
    tagLength: false
  });
  
  // Handle form validation
  const validateForm = () => {
    const phraseInput = document.getElementById('phrase') as HTMLInputElement;
    const translationInput = document.getElementById('translation') as HTMLInputElement;
    
    const errors = {
      phrase: !phraseInput.value.trim(),
      translation: !translationInput.value.trim(),
      sourceLanguage: !sourceLanguage,
      targetLanguage: !targetLanguage,
      tagLength: false // This is handled directly in the addTag function
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Handle form submission - would connect to API in real implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save phrase logic would go here
      setLocation("/my-list");
    }
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
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Check if tag length is within limits (3-16 characters)
    if (trimmedTag.length < 3 || trimmedTag.length > 16) {
      // Show error for tag length
      setFormErrors({
        ...formErrors,
        tagLength: true
      });
      return;
    }
    
    // Check if we've reached the maximum tags limit
    if (selectedTags.length >= 3) return;
    
    // If tag doesn't exist in selected tags, add it
    if (!selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      // Clear any tag length error
      if (formErrors.tagLength) {
        setFormErrors({
          ...formErrors,
          tagLength: false
        });
      }
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
  
  // Handle multiple phrases submission
  const handleMultipleSubmit = () => {
    // Process and save multiple phrases logic would go here
    setLocation("/my-list");
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">Add New Phrase</h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
              {/* Row 1: Phrase & Source Language */}
              <div className="sm:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="phrase">Phrase</Label>
                  <Input 
                    id="phrase"
                    name="phrase"
                    placeholder="Enter phrase to learn"
                    className={formErrors.phrase ? "border-red-500" : ""}
                    onChange={() => {
                      if (formErrors.phrase) {
                        setFormErrors({...formErrors, phrase: false});
                      }
                    }}
                  />
                  {formErrors.phrase && (
                    <p className="text-sm text-red-500">Phrase is required</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Language</Label>
                  <div className="relative">
                    <Input 
                      id="sourceLanguage"
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
                  <Label htmlFor="translation">Translation</Label>
                  <Input 
                    id="translation"
                    name="translation"
                    placeholder="Enter translation in your language"
                    className={formErrors.translation ? "border-red-500" : ""}
                    onChange={() => {
                      if (formErrors.translation) {
                        setFormErrors({...formErrors, translation: false});
                      }
                    }}
                  />
                  {formErrors.translation && (
                    <p className="text-sm text-red-500">Translation is required</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Language</Label>
                  <div className="relative">
                    <Input 
                      id="targetLanguage"
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
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  placeholder="Add explanations, context, or example sentences."
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="tags">Tags (optional, max 3)</Label>
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
                    id="tags"
                    placeholder={selectedTags.length >= 3 ? "Maximum tags reached" : "Type to add a tag..."}
                    value={tagInput}
                    onChange={(e) => {
                      handleTagInputChange(e);
                      if (formErrors.tagLength) {
                        setFormErrors({...formErrors, tagLength: false});
                      }
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
                  {filteredSuggestions.length > 0 && selectedTags.length < 3 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      <ul className="divide-y divide-gray-200">
                        {filteredSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addTag(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-gray-500">
                  Add up to 3 tags to organize your phrases.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/my-list")}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Add Multiple Phrases</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Enter one phrase per line in the format: 
                <span className="font-medium"> phrase | translation | tags (optional, comma separated) | notes (optional)</span>
              </p>
            </div>
            <Textarea 
              rows={5} 
              placeholder="Buenos días | Good morning | Greetings,Morning,Spanish | Used as a morning greeting until noon"
              value={multiplePhrasesValue}
              onChange={(e) => setMultiplePhrasesValue(e.target.value)}
            />
            <div className="mt-5">
              <Button onClick={handleMultipleSubmit}>Add Phrases</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
