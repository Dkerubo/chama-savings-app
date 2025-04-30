export default function Hero() {
    return (
        <div className="w-full bg-slate-950">
            <div className="w-full sm:max-w-[85rem] mx-auto flex flex-col items-center justify-center px-4 py-20">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-4xl sm:text-6xl text-white font-bold text-center">
                        Welcome to Chamayetu
                    </h1>
                    <p className="text-lg sm:text-2xl text-white mt-4 text-center">
                        Your one-stop solution for all your needs
                    </p>
                    <div className="flex flex-row gap-2 sm:gap-12 mt-8">
                        <a href="/about" className="transition-all duration-300 flex flex-col items-center justify-center text-sm bg-emerald-500 hover:bg-emerald-600 rounded px-4 py-2 text-white">Learn More</a>
                        <a href="/contact" className="transition-all duration-300 flex flex-col items-center justify-center text-sm bg-emerald-500 hover:bg-emerald-600 rounded px-4 py-2 text-white">Contact Us</a>
                    </div>
                </div>
                <div className="mt-12">
                    <img className="h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] flex-shrink-0" src="/assets/logos/chamayetu-logo-white.png" alt="Logo" />
                </div>
            </div>
        </div>
    )
}