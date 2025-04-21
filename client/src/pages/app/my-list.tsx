import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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

  // State for modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    phrase: string;
    translation: string;
    notes: string;
  } | null>(null);

  // Example phrases data with notes
  const [phrases] = useState([
    { 
      id: 1, 
      phrase: 'Buenos días', 
      translation: 'Good morning', 
      tags: ['Greetings', 'Morning', 'Beginner'], 
      proficiency: 85,
      notes: 'Used as a morning greeting until around noon. The informal version is just "Hola".'
    },
    { 
      id: 2, 
      phrase: '¿Cómo estás?', 
      translation: 'How are you?', 
      tags: ['Greetings', 'Questions'], 
      proficiency: 70,
      notes: 'Informal way to ask how someone is doing. For formal situations use "¿Cómo está usted?"'
    },
    { 
      id: 3, 
      phrase: 'Gracias', 
      translation: 'Thank you', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 95,
      notes: 'The standard way to say thank you. You can add "muchas" before it for "thank you very much".'
    },
    { 
      id: 4, 
      phrase: 'Por favor', 
      translation: 'Please', 
      tags: ['Common phrases', 'Beginner'], 
      proficiency: 90,
      notes: 'Used to make polite requests. Can be placed at the beginning or end of a sentence.'
    },
    { 
      id: 5, 
      phrase: 'Lo siento', 
      translation: 'I\'m sorry', 
      tags: ['Common phrases', 'Expressions', 'Beginner'], 
      proficiency: 60,
      notes: 'Used to apologize. For more serious apologies, you can say "Lo siento mucho" (I\'m very sorry).'
    }
  ]);
  
  // Handle showing notes for a phrase
  const handleViewNotes = (phrase: string, translation: string, notes: string) => {
    setSelectedPhrase({ phrase, translation, notes });
    setIsDialogOpen(true);
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
              onEdit={() => {}}
              onDelete={() => {}}
              onSpeak={() => {}}
              onViewNotes={() => handleViewNotes(phrase.phrase, phrase.translation, phrase.notes)}
            />
          ))}
        </div>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-primary">{selectedPhrase?.phrase}</span> 
              <span className="text-sm font-normal text-gray-500">({selectedPhrase?.translation})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium mb-2">Notes:</h3>
            <p className="text-gray-700">{selectedPhrase?.notes}</p>
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
