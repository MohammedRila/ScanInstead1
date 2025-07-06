import { QrCode } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <QrCode className="h-6 w-6 text-primary" />
              <h4 className="text-xl font-bold">ScanInstead</h4>
            </div>
            <p className="text-slate-400 mb-4">
              Modernize door-to-door interactions with QR-based digital pitches. 
              Get organized submissions without the interruption.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Product</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 ScanInstead. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
