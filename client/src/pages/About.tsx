import { Link } from 'react-router-dom';
import {
  CheckBadgeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: <CheckBadgeIcon className="h-10 w-10 text-emerald-600" />,
    title: 'Trusted Platform',
    description: 'Used by thousands of groups to manage billions in collective savings.',
  },
  {
    icon: <UserGroupIcon className="h-10 w-10 text-emerald-600" />,
    title: 'Community Focused',
    description: 'Designed specifically for African savings groups and investment clubs.',
  },
  {
    icon: <ChartBarIcon className="h-10 w-10 text-emerald-600" />,
    title: 'Financial Growth',
    description: 'Tools to help your group save, invest, and grow together.',
  },
  {
    icon: <ShieldCheckIcon className="h-10 w-10 text-emerald-600" />,
    title: 'Secure & Reliable',
    description: "Bank-level security protecting your group's financial data.",
  },
];

const stats = [
  { value: '10,000+', label: 'Groups' },
  { value: '500M+', label: 'Managed' },
  { value: '100+', label: 'Countries' },
  { value: '24/7', label: 'Support' },
];

const team = [
  {
    name: 'James Ngaugi',
    role: 'Founder & CEO',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=500&q=80',
    bio: 'Former banker with 15 years experience in microfinance.',
  },
  {
    name: 'Wanjiru Kamau',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=500&q=80',
    bio: 'Fintech expert focused on secure, scalable solutions.',
  },
  {
    name: 'David Omondi',
    role: 'Head of Community',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=500&q=80',
    bio: 'Works directly with groups to understand their needs.',
  },
];

export default function About() {
  return (
    <div className="bg-emerald-500">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About Chamayetu</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            The most trusted platform for managing group savings and investments across Africa.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-block bg-white text-emerald-700 font-semibold px-6 py-3 rounded-md hover:bg-emerald-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="inline-block bg-emerald-800 text-white font-semibold px-6 py-3 rounded-md hover:bg-emerald-600 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
              Everything your group needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Trusted by groups worldwide</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-extrabold">{stat.value}</p>
                <p className="mt-2 text-base text-emerald-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Story</h2>
              <p className="mt-4 text-lg text-gray-500">
                Chamayetu was founded in 2023 with a simple mission: to empower communities through better financial management tools.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                After seeing how many groups struggled with manual record-keeping and lack of transparency, we built a platform that makes group finance simple, secure, and accessible to everyone.
              </p>
              <div className="mt-6">
                <Link
                  to="/register"
                  className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-emerald-700 transition"
                >
                  Join Today
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img
                className="rounded-lg shadow-lg"
                src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80"
                alt="Our team"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Meet our leadership</h2>
            <p className="mt-4 text-lg text-gray-500">
              Passionate about financial inclusion and community development
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((person) => (
              <div key={person.name} className="bg-white rounded-lg shadow overflow-hidden">
                <img className="w-full h-56 object-cover" src={person.image} alt={person.name} />
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                  <p className="text-emerald-600">{person.role}</p>
                  <p className="mt-2 text-gray-500">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
