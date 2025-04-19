import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-amber-200 mb-4">
              Gift<span className="text-amber-500">Connect</span>
            </h3>
            <p className="text-gray-300 mb-4">
              Simplifying corporate gifting for businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-amber-200 font-semibold mb-4">For Companies</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white">How It Works</a>
                </Link>
              </li>
              <li>
                <Link href="/gifts">
                  <a className="text-gray-300 hover:text-white">Browse Gifts</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Corporate Accounts</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Bulk Orders</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-amber-200 font-semibold mb-4">For Vendors</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth">
                  <a className="text-gray-300 hover:text-white">Join as Vendor</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Vendor Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Success Stories</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Resources</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-amber-200 font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2023 GiftConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
