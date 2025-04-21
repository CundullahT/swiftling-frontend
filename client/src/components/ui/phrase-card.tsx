import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Info, Trash2, Volume2 } from "lucide-react";
// Simple component with no utilities needed

interface PhraseCardProps {
  phrase: string;
  translation: string;
  category?: string; // Keep for backward compatibility
  tags?: string[];
  proficiency?: number; // Keep for backward compatibility
  learned?: boolean;
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
  learned,
  notes,
  sourceLanguage,
  targetLanguage,
  onEdit,
  onDelete,
  onSpeak,
  onViewNotes
}: PhraseCardProps) {
  // Determine status based on learned flag or proficiency (for backward compatibility)
  const isLearned = learned !== undefined ? learned : (proficiency || 0) > 80;

  return (
    <div className="px-4 py-4 sm:px-6 border-b border-primary/10">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 max-w-full sm:max-w-[60%]">
          <p className="text-lg font-medium text-primary line-clamp-2 overflow-hidden break-words">{phrase}</p>
          <p className="text-md text-secondary/70 line-clamp-2 overflow-hidden break-words">{translation}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tags section for desktop - fixed width column */}
          <div className="hidden sm:block w-[180px]">
            {tags && tags.length > 0 ? (
              <div className="flex flex-row flex-wrap gap-1 mb-0.5">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 text-accent-foreground border-accent/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : category ? (
              <div className="flex">
                <Badge 
                  variant="outline" 
                  className="bg-accent/10 hover:bg-accent/20 text-xs text-center px-2 py-0.5 text-accent-foreground border-accent/20"
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
            <p className="mr-2 font-medium">Status:</p>
            {isLearned ? (
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
      </div>
    </div>
  );
}

export default PhraseCard;
