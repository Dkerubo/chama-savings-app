import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
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

      {/* Who We Are Section */}
      <section className="bg-white py-16 px-6 sm:px-20 text-center">
        <h3 className="text-3xl font-bold text-emerald-800 mb-6">Who We Are</h3>
        <p className="text-lg max-w-4xl mx-auto text-gray-700 leading-relaxed">
          At <strong>Chama Yetu</strong>, we believe in the power of community finance. We are a team of innovators, dreamers, and doers who understand the challenges of traditional group savings. That’s why we created a modern platform where trust meets transparency. Whether you're a small chama in a village or an urban investment club, our tools are designed to help you grow, manage, and thrive—together.
        </p>
      </section>

{/* Why Choose Us Section */}
<section className="bg-emerald-50 py-16 px-6 sm:px-20">
  <h3 className="text-3xl font-bold text-center text-emerald-800 mb-12">Why Choose Chama Yetu?</h3>
  <div className="grid md:grid-cols-3 gap-10 text-center">
    {[
      {
        icon: "💼",
        title: "All-in-One Platform",
        description:
          "From contributions to loans and investments, manage all your chama operations in one secure place.",
      },
      {
        icon: "📱",
        title: "Easy to Use",
        description:
          "User-friendly interface built for both admins and members, accessible anytime from any device.",
      },
      {
        icon: "🔒",
        title: "Secure & Transparent",
        description:
          "Data encryption and activity logs ensure transparency and trust within your group.",
      },
      {
        icon: "📊",
        title: "Real-Time Reports",
        description:
          "Stay updated with automated summaries and financial reports that help you make informed decisions.",
      },
      {
        icon: "🤝",
        title: "Member Empowerment",
        description:
          "Equip members with tools to understand their finances, vote, and stay engaged.",
      },
      {
        icon: "🌍",
        title: "Built for African Chamas",
        description:
          "Tailored to fit the unique culture and dynamics of African savings groups and investment clubs.",
      },
    ].map((feature, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300"
      >
        <div className="text-4xl mb-4">{feature.icon}</div>
        <h4 className="text-xl font-semibold text-emerald-800 mb-2">
          {feature.title}
        </h4>
        <p className="text-gray-700 text-sm">{feature.description}</p>
      </div>
    ))}
  </div>
</section>

      {/* Call to Action */}
      <section className="bg-emerald-700 py-16 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Take Your Chama to the Next Level?</h3>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Join thousands of members already managing their finances the smart way with Chama Yetu.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-emerald-700 hover:bg-emerald-100 font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300"
        >
          Get Started
        </Link>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 px-6 sm:px-20">
        <h3 className="text-3xl font-bold text-center text-emerald-800 mb-12">What Our Users Say</h3>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              name: "Sarah K.",
              comment:
                "Chama Yetu has made it so easy to track our group contributions. No more spreadsheets or confusion!",
            },
            {
              name: "James M.",
              comment:
                "The transparency and accountability features are amazing. Every member knows what's happening.",
            },
            {
              name: "Linet O.",
              comment:
                "As a treasurer, this app has saved me hours of work. Everything is automated and secure.",
            },
          ].map((t, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md text-gray-800 text-left"
            >
              <p className="italic text-lg mb-4">“{t.comment}”</p>
              <p className="font-semibold text-emerald-700">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

{/* Blog Articles Section */}
<section className="bg-white py-16 px-6 sm:px-20">
  <h3 className="text-3xl font-bold text-center text-emerald-800 mb-12">Get Updated on Entrepreneurship, Growing, Investment groups</h3>
  <div className="grid md:grid-cols-3 gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth md:overflow-visible">
    {[
      {
        title: "How to Start and Grow a Successful Chama",
        description:
          "Learn the foundations of starting a chama, building trust among members, and managing finances transparently.",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Top 5 Investment Ideas for Small Groups",
        description:
          "Explore smart and low-risk investment opportunities perfect for small savings groups.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Why Digital Tools Are the Future of Group Savings",
        description:
          "Find out how going digital can increase accountability, improve communication, and reduce manual errors in chama management.",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
      },
      // {
      //   title: "Women-Led Chamas Making Waves",
      //   description:
      //     "A spotlight on how women in rural and urban areas are transforming their communities through chama savings.",
      //   image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      // },
      // {
      //   title: "Managing Loans in Your Chama Responsibly",
      //   description:
      //     "Effective ways to set up lending rules, track repayments, and ensure your group loan system thrives.",
      //   image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
      // },
      // {
      //   title: "Financial Literacy: A Key to Chama Growth",
      //   description:
      //     "Educating members about financial principles boosts the success rate of group savings initiatives.",
      //   image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      // },
    ].map((post, idx) => (
      <div
        key={idx}
        className="min-w-[280px] md:min-w-0 bg-gray-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 snap-start"
      >
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <h4 className="text-xl font-semibold text-emerald-800 mb-2">
            {post.title}
          </h4>
          <p className="text-gray-700 text-sm">{post.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>

    </div>
  );
}
