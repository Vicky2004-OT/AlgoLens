import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Database, Search, Scale, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import StatTicker from '../components/StatTicker.jsx';

const Home = () => {
  const features = [
    {
      icon: Database,
      title: 'Dataset Studio',
      description: 'Create, upload, and customize datasets with realistic bias patterns',
      link: '/dataset'
    },
    {
      icon: Search,
      title: 'What-If Analyzer',
      description: 'Explore how changing applicant attributes affects decisions',
      link: '/analyzer'
    },
    {
      icon: Scale,
      title: 'Fairness Metrics',
      description: 'Comprehensive analysis using industry-standard fairness measures',
      link: '/metrics'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Title */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="gradient-text">AlgoLens</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 text-shadow">
                Exposing Hidden Bias in AI Decisions
              </p>
            </div>

            {/* Call to Action */}
            <div className="mb-16 animate-slide-up">
              <Link
                to="/playground"
                className="inline-flex items-center accent-button text-lg px-8 py-4 glow"
              >
                Start Exploring
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Animated Stats Ticker */}
            <div className="mb-16">
              <StatTicker />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore Algorithmic Fairness
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Understand how bias enters AI systems and learn techniques to build fairer algorithms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group"
              >
                <div className="stat-card h-full hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-accent-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-accent-primary transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-accent-primary group-hover:text-accent-secondary transition-colors">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="px-4 py-20 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              All Tools & Features
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Bias Playground', desc: 'Interactive bias simulation', link: '/playground' },
              { icon: Database, title: 'Dataset Studio', desc: 'Create custom datasets', link: '/dataset' },
              { icon: Search, title: 'What-If Analyzer', desc: 'Scenario testing', link: '/analyzer' },
              { icon: Scale, title: 'Fairness Metrics', desc: 'Comprehensive analysis', link: '/metrics' },
              { icon: MessageSquare, title: 'AI Explainer', desc: 'Learn from AI', link: '/explainer' },
              { icon: FileText, title: 'Bias Report', desc: 'Generate reports', link: '/report' }
            ].map((item, index) => (
              <Link
                key={item.title}
                to={item.link}
                className="glass-card p-6 hover:scale-105 transition-all duration-300 text-center group"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
                    <item.icon className="w-6 h-6 text-accent-primary" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-accent-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
