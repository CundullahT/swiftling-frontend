import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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


export default function MyPhrases() {
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
  
  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recent");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Phrases data - empty array to show empty state
  const [phrases, setPhrases] = useState<any[]>([]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <GuardedLink href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </GuardedLink>
          <h1 className="text-3xl font-semibold text-secondary bg-gradient-to-r from-primary/90 to-secondary bg-clip-text text-transparent">My Phrases</h1>
        </div>
        <GuardedLink href="/add-phrase">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Add Phrase
          </Button>
        </GuardedLink>
      </div>

      {/* Show empty state when no phrases */}
      {phrases.length === 0 ? (
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
                  <ArrowRight className="h-4 w-4 mr-2" />
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
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {SAMPLE_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
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

          {/* Phrases Grid - only show when there are phrases */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                onEdit={() => console.log('Edit phrase:', phrase.id)}
                onDelete={() => console.log('Delete phrase:', phrase.id)}
                onSpeak={() => console.log('Speak phrase:', phrase.id)}
                onViewNotes={() => console.log('View notes:', phrase.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}