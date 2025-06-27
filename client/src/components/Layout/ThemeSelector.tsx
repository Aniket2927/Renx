import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Monitor, Sun, Moon, ChevronDown } from "lucide-react";

const themes = [
  { id: "light", name: "Light", icon: Sun },
  { id: "dark", name: "Dark", icon: Moon },
  { id: "system", name: "System", icon: Monitor },
] as const;

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  // Get current theme display info
  const currentTheme = themes.find(t => t.id === theme) || themes[1]; // Default to dark
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 px-3 py-2 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <CurrentIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentTheme.name}
          </span>
          <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        {themes.map((themeOption) => {
          const IconComponent = themeOption.icon;
          const isSelected = theme === themeOption.id;
          return (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id as any)}
              className={`flex items-center space-x-2 cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isSelected 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <IconComponent className={`h-4 w-4 ${
                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`} />
              <span className={isSelected ? "font-medium" : ""}>
                {themeOption.name}
              </span>
              {isSelected && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
