import { Link } from 'react-router-dom';
import { CheckBadgeIcon, UserGroupIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AboutUs = () => {
  const features = [
    {
      icon: <CheckBadgeIcon className="h-10 w-10 text-blue-600" />,
      title: "Trusted Platform",
      description: "Used by thousands of groups to manage billions in collective savings."
    },
    {
      icon: <UserGroupIcon className="h-10 w-10 text-blue-600" />,
      title: "Community Focused",
      description: "Designed specifically for African savings groups and investment clubs."
    },
    {
      icon: <ChartBarIcon className="h-10 w-10 text-blue-600" />,
      title: "Financial Growth",
      description: "Tools to help your group save, invest, and grow together."
    },
    {
      icon: <ShieldCheckIcon className="h-10 w-10 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Bank-level security protecting your group's financial data."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Groups" },
    { value: "500M+", label: "Managed" },
    { value: "100+", label: "Countries" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-700 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">About Chamayetu</span>
                  </h1>
                  <p className="mt-3 text-base text-blue-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    The most trusted platform for managing group savings and investments across Africa.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/contact"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything your group needs
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full shadow">
                    <div className="-mt-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                        {feature.icon}
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 text-center">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-500 text-center">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by groups worldwide
            </h2>
          </div>
          <div className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div className="flex items-center">
                  <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                </div>
                <p className="mt-2 text-base font-medium text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white overflow-hidden lg:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Chamayetu was founded in 2023 with a simple mission: to empower communities through better financial management tools. 
              </p>
              <p className="mt-3 text-lg text-gray-500">
                After seeing how many groups struggled with manual record-keeping and lack of transparency, we built a platform that makes group finance simple, secure, and accessible to everyone.
              </p>
              <div className="mt-8">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Join Today
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-10 -mx-4 relative lg:mt-0">
              <img
                className="relative mx-auto rounded-lg shadow-xl"
                src="/team-meeting.jpg"
                alt="Our team"
                width={490}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-center">Meet our leadership</h2>
            <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl mx-auto text-center">
              <p className="text-xl text-gray-500">
                Passionate about financial inclusion and community development
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "James Mwangi",
                  role: "Founder & CEO",
                  image: "/james-mwangi.jpg",
                  bio: "Former banker with 15 years experience in microfinance."
                },
                {
                  name: "Wanjiru Kamau",
                  role: "CTO",
                  image: "/wanjiru-kamau.jpg",
                  bio: "Fintech expert focused on secure, scalable solutions."
                },
                {
                  name: "David Omondi",
                  role: "Head of Community",
                  image: "/david-omondi.jpg",
                  bio: "Works directly with groups to understand their needs."
                }
              ].map((person) => (
                <div key={person.name} className="bg-white rounded-lg shadow overflow-hidden">
                  <img className="w-full h-56 object-cover" src={person.image} alt={person.name} />
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                    <p className="text-blue-600">{person.role}</p>
                    <p className="mt-2 text-gray-500">{person.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;