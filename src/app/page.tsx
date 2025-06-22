import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Users, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 items-center">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center w-full backdrop-blur-sm bg-white/70 border-b border-gray-200/50">
        <Link href="/" className="flex items-center justify-center group">
          <div className="relative">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PromptPilot
            </span>
            <Sparkles className="absolute -top-1 -right-4 h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:text-blue-600 transition-colors duration-200">
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-indigo-200/25 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1500"></div>
        </div>

        <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">MCP-Powered Prompt Optimization</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-1000">
                Manage, Chain, Execute
              </h1>
              
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl leading-relaxed animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                Optimize and manage AI workflows with intelligent prompt engineering and Model Context Protocol (MCP) to deliver exceptional results.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm mb-8 rounded-lg">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Master AI Workflows
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From beginners to experts, PromptPilot provides the tools and insights 
                to create workflows that consistently deliver amazing results.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Optimization</h3>
                <p className="text-gray-600">
                  AI-powered suggestions to improve your prompts and get better results.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">MCP Integration</h3>
                <p className="text-gray-600">
                  Seamlessly connect with AI tools through Model Context Protocol for enhanced functionality.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Share and discover prompts from a growing community of AI enthusiasts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-gray-500">&copy; 2025 PromptPilot. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:text-blue-600 transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:text-blue-600 transition-colors duration-200">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
} 