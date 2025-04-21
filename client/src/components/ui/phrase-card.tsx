import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Info, Trash2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhraseCardProps {
  phrase: string;
  translation: string;
  category?: string; // Keep for backward compatibility
  tags?: string[];
  proficiency: number;
  notes?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSpeak?: () => void;
  onViewNotes?: () => void;
}

export function PhraseCard({
  phrase,
  translation,
  category,
  tags,
  proficiency,
  notes,
  onEdit,
  onDelete,
  onSpeak,
  onViewNotes
}: PhraseCardProps) {
  // Determine the color based on proficiency
  const getProficiencyColor = () => {
    if (proficiency > 80) return 'bg-green-500';
    if (proficiency > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p className="text-lg font-medium text-primary">{phrase}</p>
          <p className="text-md text-gray-500">{translation}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-slate-100">
                {tag}
              </Badge>
            ))
          ) : category ? (
            <Badge variant="outline" className="bg-slate-100">
              {category}
            </Badge>
          ) : null}
          <div className="flex-shrink-0 flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSpeak}
              className="mr-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Speak"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            {notes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onViewNotes}
                className="mr-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="View Notes"
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="mr-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <div className="flex items-center">
            <p className="mr-2">Proficiency:</p>
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div 
                className={cn("h-2.5 rounded-full", getProficiencyColor())} 
                style={{ width: `${proficiency}%` }}
              ></div>
            </div>
            <span className="ml-2">{proficiency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhraseCard;
