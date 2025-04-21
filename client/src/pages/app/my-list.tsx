import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
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
import { Search } from "lucide-react";
import { PhraseCard } from "@/components/ui/phrase-card";
import { SAMPLE_TAGS } from "@/lib/constants";
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

  // Example phrases data with notes
  const [phrases] = useState([
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
    setIsEditDialogOpen(true);
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
                placeholder="Search phrases" 
                className="pl-10" 
              />
            </div>
          </div>
          <div className="sm:w-1/4">
            <Select defaultValue="all">
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
            <Select defaultValue="recent">
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
          {phrases.map((phrase) => (
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
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Languages:</h3>
              <div className="flex gap-2 items-center">
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase?.sourceLanguage?.charAt(0).toUpperCase() + selectedPhrase?.sourceLanguage?.slice(1)}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="px-2 py-1 bg-primary-500/10 text-primary-700">
                  {selectedPhrase?.targetLanguage?.charAt(0).toUpperCase() + selectedPhrase?.targetLanguage?.slice(1)}
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
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
            {/* Row 1: Phrase & Source Language */}
            <div className="sm:col-span-3">
              <Label htmlFor="edit-phrase">Phrase</Label>
              <Input 
                id="edit-phrase"
                name="phrase"
                defaultValue={selectedPhrase?.phrase}
                placeholder="Enter phrase to learn"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="edit-sourceLanguage">Language</Label>
              <div className="relative">
                <Input 
                  id="edit-sourceLanguage"
                  placeholder="Type or select language"
                  defaultValue={selectedPhrase?.sourceLanguage}
                />
              </div>
            </div>

            {/* Row 2: Translation & Target Language */}
            <div className="sm:col-span-3">
              <Label htmlFor="edit-translation">Translation</Label>
              <Input 
                id="edit-translation"
                name="translation"
                defaultValue={selectedPhrase?.translation}
                placeholder="Enter translation in your language"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="edit-targetLanguage">Language</Label>
              <div className="relative">
                <Input 
                  id="edit-targetLanguage"
                  placeholder="Type or select language"
                  defaultValue={selectedPhrase?.targetLanguage}
                />
              </div>
            </div>

            {/* Row 3: Notes & Tags */}
            <div className="sm:col-span-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea 
                id="edit-notes"
                name="notes"
                defaultValue={selectedPhrase?.notes}
                placeholder="Add explanations, context, or example sentences."
                rows={3}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="edit-tags">Tags (optional, max 3)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedPhrase?.tags?.map(tag => (
                  <Badge key={tag} className="px-2 py-1 bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 transition-colors duration-200">
                    {tag}
                    <button
                      type="button"
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
                  placeholder="Type to add a tag..."
                  className="pr-8"
                />
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
