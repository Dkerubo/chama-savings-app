import { useState, useEffect } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const ContactUs = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Explicit typing for formData state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const html = document.documentElement;
    darkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [darkMode]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Dark Mode Toggle */}
      <div className="flex justify-end px-6 py-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm dark:bg-gray-800 bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-700 text-white text-center">
        <div className="max-w-7xl mx-auto py-16 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold"
          >
            Contact Us
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto text-blue-100 dark:text-blue-200">
            Questions or feedback? We’d love to hear from you.
          </p>
        </div>
      </div>

      {/* Contact Info + Form */}
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8 grid gap-12 lg:grid-cols-3 ml-0">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-left"
        >
          <h2 className="text-2xl font-semibold">Get in Touch</h2>
          <p className="text-gray-500 dark:text-gray-300">
            Reach out via any of the following methods:
          </p>

          <div className="space-y-6 text-sm">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium">Address</h3>
                <p>123 Financial Plaza, Nairobi, Kenya</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <PhoneIcon className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium">Phone</h3>
                <p>
                  +254 700 123 456
                  <br />
                  +254 720 123 456
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium">Email</h3>
                <p>
                  info@chamayetu.com
                  <br />
                  support@chamayetu.com
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <ClockIcon className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium">Hours</h3>
                <p>
                  Mon–Fri: 8am – 5pm
                  <br />
                  Sat: 9am – 1pm
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              { id: "name", label: "Full Name" },
              { id: "email", label: "Email", type: "email" },
              { id: "phone", label: "Phone", type: "tel" },
              { id: "subject", label: "Subject" },
            ].map(({ id, label, type = "text" }) => (
              <div key={id} className="col-span-1">
                <label htmlFor={id} className="block text-sm font-medium">
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={formData[id as keyof typeof formData]} // Type-safe access to formData
                  onChange={handleChange}
                  required={id !== "phone"}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-md bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-300 hover:bg-emerald-600"
              >
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-6">Find Us Here</h2>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8085599999996!2d36.82154831475398!3d-1.2923858359807725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d664f5b5c9%3A0x1e3b9b7a8a7b7a8a!2sNairobi%20City%20Centre%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              title="Our Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
