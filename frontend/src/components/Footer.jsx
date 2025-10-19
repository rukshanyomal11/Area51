import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-200 py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://www.instagram.com" aria-label="Instagram" className="text-gray-600 hover:text-black">
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a href="https://www.facebook.com" aria-label="Facebook" className="text-gray-600 hover:text-black">
            <FontAwesomeIcon icon={faFacebook} size="lg" />
          </a>
          <a href="https://www.youtube.com" aria-label="YouTube" className="text-gray-600 hover:text-black">
            <FontAwesomeIcon icon={faYoutube} size="lg" />
          </a>
        </div>
        <h3 className="text-2xl font-bold">AREA 51</h3>
        <p className="text-sm mt-2">&copy; 2025 Area 51, a MLA Group. All Rights Reserved.</p>
        <div className="mt-4 space-x-4 text-sm">
          <a href="#" className="hover:text-gray-600">Privacy</a>
          <a href="#" className="hover:text-gray-600">Terms</a>
          <a href="#" className="hover:text-gray-600">Accessibility</a>
          <a href="#" className="hover:text-gray-600">Cookie Preferences</a>
          <a href="#" className="hover:text-gray-600">Do Not Sell or Share My Personal Information</a>
          <a href="#" className="hover:text-gray-600">CA Supply Chain Act</a>
          <a href="#" className="hover:text-gray-600">Forced/Child Labor Act</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;