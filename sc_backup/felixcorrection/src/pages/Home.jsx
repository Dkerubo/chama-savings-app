import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden pt-20"> {/* Added pt-20 to account for navbar height */}
      {/* Full-page background image - fixed positioning */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/homepage.jpg')" }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* Content */}
      <div className="h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="md:w-1/2 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-blue-300">Chamayetu</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Empowering your financial future through collaborative savings and investments.
            </p>
            
            {/* Buttons Group - removed arrow icon */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              >
                Learn More
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-white hover:bg-opacity-20 transition-all duration-200 border-opacity-50 hover:border-opacity-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-gray-100 transition-all duration-200"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;