import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { PhraseCard } from "@/components/ui/phrase-card";
import { CATEGORIES } from "@/lib/constants";
import { useState } from "react";
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

  // Example phrases data
  const [phrases] = useState([
    { id: 1, phrase: 'Buenos días', translation: 'Good morning', category: 'Greetings', proficiency: 85 },
    { id: 2, phrase: '¿Cómo estás?', translation: 'How are you?', category: 'Greetings', proficiency: 70 },
    { id: 3, phrase: 'Gracias', translation: 'Thank you', category: 'Common phrases', proficiency: 95 },
    { id: 4, phrase: 'Por favor', translation: 'Please', category: 'Common phrases', proficiency: 90 },
    { id: 5, phrase: 'Lo siento', translation: 'I\'m sorry', category: 'Common phrases', proficiency: 60 }
  ]);

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
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
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
              category={phrase.category}
              proficiency={phrase.proficiency}
              onEdit={() => {}}
              onDelete={() => {}}
              onSpeak={() => {}}
            />
          ))}
        </div>
      </Card>

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
