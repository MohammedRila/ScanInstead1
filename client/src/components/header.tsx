import { Link } from "wouter";
import { QrCode } from "lucide-react";
import { DarkModeToggle } from "./dark-mode-toggle";

export function Header() {
  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ScanInstead</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden sm:flex space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/create" className="text-muted-foreground hover:text-primary transition-colors">
                Create QR
              </Link>
            </nav>
            
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
