import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-gray-300 py-12 md:py-16 border-t border-white/10 mt-auto">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white uppercase">GameLord</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Your ultimate destination for the best gaming experiences. Explore, discover, and play.
            </p>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Store</h4>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Browse</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">New Releases</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Top Sellers</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Special Offers</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Support</h4>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link>
            <Link href="/dmca" className="text-sm text-gray-400 hover:text-white transition-colors">DMCA Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">Community</h4>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Forums</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Discord</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Twitter X</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GameLord. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">
            ENGLISH (US)
          </div>
        </div>
      </div>
    </footer>
  );
}
