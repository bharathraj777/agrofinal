import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About AgriSupport 🌾</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
            🌾
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Smart Agriculture Support System</h2>
          <p className="text-gray-600 mt-2">Empowering farmers with technology for sustainable agriculture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">🤖 Our Mission</h3>
            <p className="text-gray-700">
              To provide Indian farmers with intelligent, accessible, and affordable technology solutions that enhance agricultural productivity, profitability, and sustainability.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">🎯 Our Vision</h3>
            <p className="text-gray-700">
              To become the leading digital platform for Indian agriculture, connecting farmers to markets, knowledge, and resources through innovative technology.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              AI-Powered Agriculture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🌾</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Crop Recommendations</h4>
                  <p className="text-gray-600">ML-based suggestions based on soil conditions, weather patterns, and market trends</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">🔍</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Disease Detection</h4>
                  <p className="text-gray-600">AI-powered image analysis for early disease identification and treatment recommendations</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">💰</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Price Predictions</h4>
                  <p className="text-gray-600">Time-series analysis for market price forecasting and optimal selling strategies</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">🧠</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Explainability</h4>
                  <p className="text-gray-600">Transparent ML model insights showing feature importance for recommendations</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏪</span>
              Farmer Marketplace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💼</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Buy & Sell</h4>
                  <p className="text-gray-600">Direct connection between farmers and buyers, cutting out middlemen</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">⭐</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Ratings</h4>
                  <p className="text-gray-600">Standardized quality assessment (A, B, C grades) with transparent pricing</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📍</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Location-based</h4>
                  <p className="text-gray-600">Find and list products by geographic location with precise mapping</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏛️</span>
              Government Schemes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Central & State Schemes</h4>
                  <p className="text-gray-600">Comprehensive database of agricultural schemes and subsidies</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">🔍</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Search & Filter</h4>
                  <p className="text-gray-600">Find relevant schemes by category and eligibility criteria</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📝</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Application Guidance</h4>
                  <p className="text-gray-600">Step-by-step application process with document checklists</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👥</span>
              User Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🔐</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure Authentication</h4>
                  <p className="text-gray-600">JWT-based authentication with refresh token rotation</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Role-based Access</h4>
                  <p className="text-gray-600">Farmer and Admin roles with appropriate permissions</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Profile Management</h4>
                  <p className="text-gray-600">Complete user profiles with location tracking</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Activity Tracking</h4>
                  <p className="text-gray-600">Recommendation history and usage analytics</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 Start Your Smart Agriculture Journey Today!</h3>
          <p className="text-lg mb-6">
            Join thousands of Indian farmers who are already using AgriSupport to optimize their farming practices, increase yields, and maximize profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Technology Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="mb-2">📱</div>
              <div className="font-semibold">React 18</div>
              <div className="text-gray-600">Frontend Framework</div>
            </div>
            <div className="text-center">
              <div className="mb-2">⚛</div>
              <div className="font-semibold">Node.js</div>
              <div className="text-gray-600">Backend Runtime</div>
            </div>
            <div className="text-center">
              <div className="mb-2">🍃</div>
              <div className="font-semibold">MongoDB</div>
              <div className="text-gray-600">Database</div>
            </div>
            <div className="text-center">
              <div className="mb-2">🤖</div>
              <div className="font-semibold">TensorFlow.js</div>
              <div className="text-gray-600">Machine Learning</div>
            </div>
            <div className="text-center">
              <div className="mb-2">🐳</div>
              <div className="font-semibold">Docker</div>
              <div className="text-gray-600">Deployment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
