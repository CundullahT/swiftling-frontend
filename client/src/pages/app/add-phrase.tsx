import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/constants";

export default function AddPhrase() {
  // Placeholder for auth check - would be tied to a real auth system in future
  const isAuthenticated = true;
  useAuthRedirect(!isAuthenticated, "/login");
  
  const [, setLocation] = useLocation();
  const [multiplePhrasesValue, setMultiplePhrasesValue] = useState("");

  // Handle form submission - would connect to API in real implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save phrase logic would go here
    setLocation("/my-list");
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

              <div className="sm:col-span-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={CATEGORIES[0].toLowerCase()}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input 
                  id="notes"
                  name="notes"
                  placeholder="Add any notes about this phrase"
                />
              </div>

              <div className="sm:col-span-6">
                <Label htmlFor="context">Context (optional)</Label>
                <Textarea 
                  id="context"
                  name="context"
                  placeholder="Brief context or example sentence using this phrase"
                  rows={3}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Brief context or example sentence using this phrase.
                </p>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="add-to-practice" />
                  <div>
                    <Label 
                      htmlFor="add-to-practice" 
                      className="font-medium text-gray-700"
                    >
                      Add to practice list
                    </Label>
                    <p className="text-gray-500 text-sm">
                      This phrase will be added to your practice queue.
                    </p>
                  </div>
                </div>
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
                <span className="font-medium"> phrase | translation | category (optional)</span>
              </p>
            </div>
            <Textarea 
              rows={5} 
              placeholder="Buenos días | Good morning | Greetings"
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
