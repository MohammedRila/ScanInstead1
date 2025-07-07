import { QrCode, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ScanInstead
              </h4>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Transform door-to-door interactions with intelligent QR-based digital pitches. 
              Get professional submissions delivered directly to your inbox.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for modern homeowners</span>
            </div>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-6 text-white">Product</h5>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">How it Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-6 text-white">Support</h5>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform block">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 ScanInstead. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-sm text-gray-400">Version 1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
