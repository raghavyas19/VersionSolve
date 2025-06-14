import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Trophy, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Play,
  BookOpen,
  Award,
  TrendingUp,
  Globe,
  Shield,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Code2,
      title: "Multi-Language Support",
      description: "Code in C++, Java, Python, JavaScript and more with real-time compilation",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Run your code instantly with detailed performance metrics and AI insights",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Trophy,
      title: "Competitive Programming",
      description: "Join contests, solve challenges, and climb the global leaderboard",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Coders", icon: Users },
    { number: "500+", label: "Problems", icon: BookOpen },
    { number: "50+", label: "Contests", icon: Trophy },
    { number: "99.9%", label: "Uptime", icon: Shield }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Software Engineer at Google",
      content: "This platform helped me ace my coding interviews. The AI feedback is incredibly detailed!",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "CS Student at MIT",
      content: "The best online judge I've used. Clean interface, fast execution, and great problem variety.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Competitive Programmer",
      content: "Contest experience is seamless. Real-time leaderboards and instant verdicts make it exciting!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VersionSolve
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/problems" className="hover:text-blue-400 transition-colors">Problems</Link>
            <Link to="/contests" className="hover:text-blue-400 transition-colors">Contests</Link>
            <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link>
            <Link to="/compiler" className="hover:text-blue-400 transition-colors">Compiler</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              Code. Compete. Conquer.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master programming with our advanced online judge platform. 
              Solve problems, join contests, and get AI-powered code reviews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/problems"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Solving</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/compiler"
                className="group px-8 py-4 border-2 border-gray-400 rounded-full text-lg font-semibold hover:border-white hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Try Compiler</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`transition-all duration-1000 delay-${index * 200} transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                >
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-400 group-hover:text-purple-400 transition-colors" />
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 bg-black bg-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to excel in competitive programming and software development
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-10 border border-gray-700 hover:border-gray-500 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500"></div>
                <feature.icon className="h-12 w-12 mb-6 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" />
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Feature Demo */}
          <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4 text-white">AI-Powered Code Review</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get instant feedback on your code quality, optimization suggestions, 
                  and complexity analysis powered by advanced AI algorithms.
                </p>
                <div className="space-y-3">
                  {[
                    "Code quality scoring (1-10)",
                    "Time & space complexity analysis",
                    "Optimization recommendations",
                    "Style and best practices review"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-600">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold">AI Review Results</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code Quality:</span>
                    <span className="text-green-400 font-semibold">8/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Complexity:</span>
                    <span className="text-blue-400">O(n log n)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Space Complexity:</span>
                    <span className="text-blue-400">O(1)</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
                    <p className="text-blue-300 text-xs">
                      💡 Consider using a hash map for O(n) time complexity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Loved by Developers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of developers who trust our platform for their coding journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700 hover:border-gray-500 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Start Coding?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of passionate developers and take your programming skills to the next level.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                to="/"
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/problems"
                  className="px-8 py-4 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Browse Problems</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-gray-900 bg-opacity-80 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code2 className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">VersionSolve</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The ultimate platform for competitive programming and coding practice.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <div className="space-y-2">
                <Link to="/problems" className="block text-gray-400 hover:text-white transition-colors">Problems</Link>
                <Link to="/contests" className="block text-gray-400 hover:text-white transition-colors">Contests</Link>
                <Link to="/leaderboard" className="block text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
                <Link to="/compiler" className="block text-gray-400 hover:text-white transition-colors">Online Compiler</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Discord</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">GitHub</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Forum</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 VersionSolve. All rights reserved. Built with ❤️ for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;