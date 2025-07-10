import { Link } from "wouter";
import { QrCode } from "lucide-react";
import { DarkModeToggle } from "./dark-mode-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 px-3 mx-auto max-w-7xl md:h-16 md:px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2 shadow-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ScanInstead
            </h1>
          </Link>

          <div className="flex items-center space-x-6">
            <nav className="hidden sm:flex space-x-8">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Home
              </Link>
              <Link href="/role-selection" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Create QR
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <DarkModeToggle />
              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md">
                <Link href="/role-selection">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}