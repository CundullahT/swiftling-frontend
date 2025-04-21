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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_TAGS } from "@/lib/constants";
import { X, Plus } from "lucide-react";

export default function AddPhrase() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  const [, setLocation] = useLocation();
  const [multiplePhrasesValue, setMultiplePhrasesValue] = useState("");
  
  // Tags state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Handle form submission - would connect to API in real implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save phrase logic would go here
    setLocation("/my-list");
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
  
  // Handle multiple phrases submission
  const handleMultipleSubmit = () => {
    // Process and save multiple phrases logic would go here
    setLocation("/my-list");
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Phrase</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="phrase">Phrase</Label>
                <Input 
                  id="phrase"
                  name="phrase"
                  placeholder="Enter phrase in foreign language"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="translation">Translation</Label>
                <Input 
                  id="translation"
                  name="translation"
                  placeholder="Enter translation in your language"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  placeholder="Add any notes or context about this phrase"
                  rows={3}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Add explanations, context, or example sentences.
                </p>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="tags">Tags (optional, max 3)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} className="px-2 py-1 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20">
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
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    disabled={selectedTags.length >= 3}
                    className="pr-8"
                  />
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
                  {filteredSuggestions.length > 0 && (
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
