import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeTest() {
  const { theme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "dark":
        return <Moon className="h-5 w-5 text-blue-400" />;
      case "system":
        return <Monitor className="h-5 w-5 text-gray-500" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-500" />;
    }
  };

  const getThemeDescription = () => {
    switch (theme) {
      case "light":
        return "Light theme is active - UI optimized for bright environments";
      case "dark":
        return "Dark theme is active - UI optimized for low-light environments";
      case "system":
        return "System theme is active - automatically follows your OS preference";
      default:
        return "System theme is active - automatically follows your OS preference";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getThemeIcon()}
          <span>Theme Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Theme: {theme}</p>
          <p className="text-xs text-muted-foreground">{getThemeDescription()}</p>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs">
              Test: This card should change appearance when you switch themes.
              Light = bright colors, Dark = dark colors, System = follows your OS.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 