import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageButtonProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  className?: string;
  onClick?: () => void;
}

export function LanguageButton({ 
  name, 
  icon, 
  description, 
  className, 
  onClick 
}: LanguageButtonProps) {
  return (
    <div 
      className={cn(
        "relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-primary-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <Button variant="link" className="focus:outline-none p-0 h-auto">
          <span className="absolute inset-0" aria-hidden="true"></span>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500 truncate">{description}</p>
        </Button>
      </div>
    </div>
  );
}

export default LanguageButton;
