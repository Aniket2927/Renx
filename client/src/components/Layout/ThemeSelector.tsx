import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

const themes = [
  { id: "light", name: "Light", color: "hsl(210, 40%, 95%)" },
  { id: "dark", name: "Dark", color: "hsl(222, 84%, 5%)" },
  { id: "system", name: "System", color: "hsl(217, 33%, 17%)" },
] as const;

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Palette size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id as any)}
            className="flex items-center space-x-2"
          >
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: themeOption.color }}
            />
            <span className={theme === themeOption.id ? "font-medium" : ""}>
              {themeOption.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
