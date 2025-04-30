import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative flex flex-col sm:flex-row min-h-screen bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-700">
      <div className="z-10 text-white w-full sm:w-1/2">
        <div className="flex flex-col gap-6 items-start justify-center w-full h-full px-4 sm:ps-12 py-20 text-left">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg">
            Welcome to Chama Yetu
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold leading-tight drop-shadow-md">
            Group Savings & Investment Platform
          </h2>
          <p className="text-base md:text-lg max-w-xl leading-relaxed">
            A digital solution for managing collective savings, loans, and investments. The Chama Members App solves this by offering a centralized, digital platform where members can track contributions, view group activity, and manage investments securely and transparently.
          </p>
          <Link
            to="/about"
            className="mt-4 inline-block bg-white text-emerald-700 hover:bg-emerald-100 font-semibold py-2 px-6 rounded-full shadow-md transition duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>

      <img
        className="absolute inset-0 w-full h-full object-cover opacity-100 sm:opacity-100"
        src="/assets/hero/homepage.png"
        alt="Chama Yetu"
      />
    </div>
  );
}
