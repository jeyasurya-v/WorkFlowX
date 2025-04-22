import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">PipelineRadar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/auth/login" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium hover-lift"
              >
                Sign in
              </Link>
              <Link 
                to="/auth/register" 
                className="bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium hover-lift"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 transform skew-y-3 -z-10 h-[120%] -mt-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-5">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl leading-tight">
                Monitor your CI/CD pipelines with precision
              </h1>
              <p className="mt-6 text-xl text-gray-500 max-w-3xl">
                PipelineRadar gives you real-time insights into your DevOps workflows, helping you identify bottlenecks and optimize your delivery pipeline.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-y-4 gap-x-6">
                <Link
                  to="/auth/register"
                  className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-lg text-base font-medium shadow-sm hover-lift text-center"
                >
                  Get Started — It's Free
                </Link>
                <Link
                  to="/auth/login"
                  className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-base font-medium shadow-sm hover-lift text-center"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required. Start monitoring your pipelines today.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6 xl:col-span-7">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 right-4 w-72 h-72 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 -left-20 w-72 h-72 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
                
                {/* Dashboard mockup */}
                <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
                  <div className="bg-gray-800 h-6 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <img 
                    src="https://placehold.co/800x500/f8fafc/1e293b?text=PipelineRadar+Dashboard" 
                    alt="PipelineRadar Dashboard" 
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold gradient-text sm:text-4xl">
              Everything you need to monitor your pipelines
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              PipelineRadar provides comprehensive tools to visualize, analyze, and optimize your CI/CD workflows.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-y-16 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col feature-card">
              <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                <svg className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real-time Analytics</h3>
              <p className="mt-3 text-base text-gray-500">
                Monitor your pipelines in real-time with comprehensive dashboards and instant alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col feature-card">
              <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                <svg className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Performance Optimization</h3>
              <p className="mt-3 text-base text-gray-500">
                Identify bottlenecks and optimize your pipeline performance with actionable insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col feature-card">
              <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                <svg className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Team Collaboration</h3>
              <p className="mt-3 text-base text-gray-500">
                Share insights with your team and collaborate effectively on pipeline improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to optimize your CI/CD pipelines?
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Join thousands of teams who use PipelineRadar to improve their DevOps workflows.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth/register"
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg text-base font-medium shadow-sm inline-block hover-lift"
              >
                Create Free Account
              </Link>
              <Link
                to="/auth/login"
                className="bg-transparent border border-white text-white hover:bg-gray-800 px-8 py-3 rounded-lg text-base font-medium shadow-sm inline-block hover-lift"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required. Get started in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <span className="text-xl font-bold text-gray-900">PipelineRadar</span>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center md:text-right text-base text-gray-500">
                &copy; {new Date().getFullYear()} PipelineRadar. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
