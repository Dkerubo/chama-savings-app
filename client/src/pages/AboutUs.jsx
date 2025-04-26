// src/pages/AboutUs.jsx
import React from "react";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-6 sm:px-10 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
      >
        <h1 className="text-5xl font-extrabold text-green-700 mb-6 text-center animate-pulse">
          About Chama Yetu
        </h1>
        <motion.p
          className="text-gray-700 text-xl mb-6 leading-relaxed"
          whileHover={{ scale: 1.02 }}
        >
          <strong>Chama Yetu</strong> is a digital solution built to empower community-based
          savings and lending groups. We understand the power of unity and the
          impact that collective financial planning can have.
        </motion.p>
        <motion.p
          className="text-gray-700 text-xl mb-6 leading-relaxed"
          whileHover={{ scale: 1.02 }}
        >
          Whether you're managing a neighborhood chama, an office welfare group,
          or a rural self-help circle, Chama Yetu provides the tools to track
          contributions, disburse loans, and stay transparent.
        </motion.p>
        <motion.p
          className="text-gray-700 text-xl mb-6 leading-relaxed"
          whileHover={{ scale: 1.02 }}
        >
          Our mission is simple: <strong>make community finance accessible, secure, and seamless.</strong>
        </motion.p>
        <motion.p
          className="text-gray-700 text-xl leading-relaxed"
          whileHover={{ scale: 1.02 }}
        >
          Join us in revolutionizing the way groups save, borrow, and grow — together.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AboutUs;


