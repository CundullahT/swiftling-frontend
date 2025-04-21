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
  sourceLanguage?: string;
  targetLanguage?: string;
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
  sourceLanguage,
  targetLanguage,
  onEdit,
  onDelete,
  onSpeak,
  onViewNotes
}: PhraseCardProps) {
  // Determine the color based on proficiency
  const getProficiencyColor = () => {
    if (proficiency > 80) return 'bg-primary';
    if (proficiency > 50) return 'bg-accent';
    return 'bg-destructive';
  };

  return (
    <div className="px-4 py-4 sm:px-6 border-b border-primary/10">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 max-w-full sm:max-w-[65%]">
          <p className="text-lg font-medium text-primary line-clamp-2 overflow-hidden break-words">{phrase}</p>
          <p className="text-md text-secondary/70 line-clamp-2 overflow-hidden break-words">{translation}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tags section for desktop - fixed width column */}
          <div className="hidden sm:block w-32">
            {tags && tags.length > 0 ? (
              <div className="flex flex-col gap-1 mb-0.5">
                {tags.map((tag, index) => (
                  <div key={index} className="flex">
                    <Badge 
                      variant="outline" 
                      className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 mx-auto text-accent-foreground border-accent/20"
                    >
                      {tag}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : category ? (
              <div className="flex">
                <Badge 
                  variant="outline" 
                  className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 mx-auto text-accent-foreground border-accent/20"
                >
                  {category}
                </Badge>
              </div>
            ) : null}
          </div>
          
          {/* Tags section for mobile */}
          <div className="flex sm:hidden flex-wrap gap-1">
            {tags && tags.length > 0 ? (
              tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 text-accent-foreground border-accent/20"
                >
                  {tag}
                </Badge>
              ))
            ) : category ? (
              <Badge 
                variant="outline" 
                className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 text-accent-foreground border-accent/20"
              >
                {category}
              </Badge>
            ) : null}
          </div>
          <div className="flex-shrink-0 flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSpeak}
              className="mr-2 text-primary hover:text-primary/80 hover:bg-primary/10"
              title="Speak"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            {notes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onViewNotes}
                className="mr-2 text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                title="View Notes"
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="mr-2 text-accent hover:text-accent/80 hover:bg-accent/10"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="mt-2 flex items-center text-sm text-secondary/80 sm:mt-0">
          <div className="flex items-center">
            <p className="mr-2 font-medium">Proficiency:</p>
            <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div 
                className={cn("h-2.5 rounded-full", getProficiencyColor())} 
                style={{ width: `${proficiency}%` }}
              ></div>
            </div>
            <span className="ml-2 font-medium text-secondary">{proficiency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhraseCard;
