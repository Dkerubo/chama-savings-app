import { Link } from 'react-router-dom';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon } from './SocialIcons'; // You'll need to create these or use Heroicons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center">
              <img
                className="h-12 w-auto"
                src="/chamayetu-logo-white.png"
                alt="Chamayetu"
              />
              <span className="ml-2 text-xl font-bold">Chamayetu</span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              The most trusted platform for managing group savings and investments across Africa.
            </p>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <LinkedInIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Quick Links
            </h3>
            <div className="mt-4 space-y-2">
              <Link to="/about" className="text-gray-400 hover:text-white block text-sm">
                About Us
              </Link>
              <Link to="/features" className="text-gray-400 hover:text-white block text-sm">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white block text-sm">
                Pricing
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white block text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Resources
            </h3>
            <div className="mt-4 space-y-2">
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Documentation
              </a>
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Help Center
              </a>
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Community
              </a>
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Blog
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Legal
            </h3>
            <div className="mt-4 space-y-2">
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white block text-sm">
                Security
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Chamayetu. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;