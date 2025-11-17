import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // In a real app, this would send to backend API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Contact Us 📞</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Send className="w-6 h-6 mr-2 text-green-600" />
            Get in Touch
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="How can we help you?"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="marketplace">Marketplace Issue</option>
                <option value="schemes">Government Scheme Question</option>
                <option value="feedback">Feedback & Suggestions</option>
                <option value="partnership">Partnership Opportunity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0-8 8v8a8 8 0 016 0-8-8z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Send Message'}
            </button>
          </form>

          {/* Submission Status */}
          {submitStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Message sent successfully!</p>
              </div>
              <p className="text-green-700 text-sm mt-2">We'll get back to you within 24 hours.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">Failed to send message</p>
              </div>
              <p className="text-red-700 text-sm mt-2">Please try again or contact us directly at support@agriculture-app.com</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-green-600" />
            Get in Touch
          </h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-gray-600">Mon-Fri: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-500">+91-8080-1234-5678</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-gray-600">support@agriculture-app.com</p>
                <p className="text-gray-500">We respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Office Location</h3>
                <p className="text-gray-600">Agricultural Technology Center, Pune</p>
                <p className="text-gray-500">4th Floor, Tech Hub, Kharadi, Pune - 411014</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Business Hours</h3>
                <div className="text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 2:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How Can We Help You?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🌾</span>
              </div>
              <h3 className="font-semibold text-gray-900">Crop Recommendations</h3>
              <p className="text-gray-600">Get personalized crop suggestions based on your soil and weather conditions</p>
              <button className="mt-3 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-800">
                Learn More
              </button>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900">Disease Detection</h3>
              <p className="text-gray-600">AI-powered plant disease identification and treatment recommendations</p>
              <button className="mt-3 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-800">
                Try Now
              </button>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900">Market Information</h3>
              <p className="text-gray-600">Real-time crop prices and market trends in your area</p>
              <button className="mt-3 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-800">
                View Prices
              </button>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🏛️</span>
              </div>
              <h3 className="font-semibold text-gray-900">Government Schemes</h3>
              <p className="text-gray-600">Browse and apply for agricultural schemes and subsidies</p>
              <button className="mt-3 text-yellow-700 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-800">
                Browse Schemes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;