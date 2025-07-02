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
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Phrase Column - 30% on desktop */}
        <div className="sm:col-span-4">
          <p className="text-lg font-medium text-primary line-clamp-2 overflow-hidden break-words">{phrase}</p>
        </div>
        
        {/* Translation Column - 35% on desktop */}
        <div className="sm:col-span-4">
          <p className="text-md text-secondary/70 line-clamp-2 overflow-hidden break-words">{translation}</p>
        </div>
        
        {/* Tags Column - 20% on desktop */}
        <div className="sm:col-span-2">
          <div className="flex flex-wrap gap-1">
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
        </div>
        
        {/* Actions Column - 15% on desktop */}
        <div className="sm:col-span-2">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSpeak}
              className="mr-2 text-primary hover:text-primary/80 hover:bg-primary/10"
              title="Speak"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onViewNotes}
              className="mr-2 text-secondary hover:text-secondary/80 hover:bg-secondary/10"
              title="View Notes"
            >
              <Info className="h-5 w-5" />
            </Button>
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
      
      {/* Status Row */}
      <div className="mt-3 pt-2 border-t border-primary/5">
        <div className="flex items-center text-sm text-secondary/80">
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
  );
}

export default PhraseCard;
