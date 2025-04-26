import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bgImage from "../assets/homepage.jpg";   // ← import it

export default function LandingPage() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden m-0 p-0">
      {/* background via imported asset */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* overlay + content */}
      <div className="relative z-10 w-full h-full bg-black bg-opacity-60 flex items-start justify-start pt-32 pl-10">
        <div className="text-white max-w-2xl space-y-6">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold"
            initial={{ y: -50, opacity: 0 }}
            animate={loaded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1 }}
          >
            Welcome to Chama Yetu
          </motion.h1>
          <motion.p
            className="text-xl md:text-3xl"
            initial={{ y: 30, opacity: 0 }}
            animate={loaded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          >
            A smart way to manage your group savings, contributions, and loans.
          </motion.p>
          <motion.div
            className="space-x-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={loaded ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1 }}
          >
            <button
              onClick={() => navigate("/about")}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-all duration-300"
            >
              Learn More
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-all duration-300"
            >
              Register
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
