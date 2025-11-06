import { Mic } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="py-4 container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Voice to Text</h1>
          </div>

          <nav className="flex items-center gap-2">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
