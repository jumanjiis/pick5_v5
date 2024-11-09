import React from 'react';
import { Mail, Twitter, AlertCircle } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Contact Us</h1>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Mail className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Email Support</h2>
              </div>
              <p className="text-purple-200 mb-4">
                For any queries or assistance, reach out to us at:
              </p>
              <a 
                href="mailto:support@pick5.in"
                className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                support@pick5.in
              </a>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Twitter className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Follow Us</h2>
              </div>
              <p className="text-purple-200 mb-4">
                Follow us on X (formerly Twitter) for updates and announcements:
              </p>
              <a 
                href="https://twitter.com/pick5India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-lg text-blue-200 hover:bg-blue-500/30 transition-colors"
              >
                @pick5India
              </a>
            </div>

            <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Support Hours</h2>
                  <p className="text-purple-200">
                    Our support team is available Monday through Saturday, 9:00 AM to 6:00 PM IST.
                    We typically respond to all inquiries within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;