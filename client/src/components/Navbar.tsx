export default function Navbar(){
    return (
        <header className="w-full bg-slate-950">
            <div className="w-full sm:max-w-[85rem] mx-auto flex flex-row justify-between items-center px-4 py-2">
            <div className="navbar__logo">
                <img className="h-[50px] w-[161px] flex-shrink-0" src="/assets/logos/chamayetu-logo-white.png" alt="Logo" />
            </div>
            <div className="flex flex-row gap-2 sm:gap-12 text-white">
            <div className="flex flex-row gap-2 text-white">
                <a href="/" className="transition-all duration-300 px-4 py-2 text-white hover:text-emerald-500">Home</a>
                <a href="/about" className="transition-all duration-300 px-4 py-2 text-white hover:text-emerald-500">About</a>
                <a href="/contact" className="transition-all duration-300 px-4 py-2 text-white hover:text-emerald-500">Contact</a>
            </div>
            <div className="flex flex-row gap-2 text-white">
                <a href="/login" className="transition-all duration-300 flex flex-col items-center justify-center text-sm bg-emerald-500 hover:bg-emerald-600 rounded px-4 py-2 text-white">Login</a>
                <a href="/register" className="transition-all duration-300 flex flex-col items-center justify-center text-sm bg-emerald-500 hover:bg-emerald-600 rounded px-4 py-2 text-white">Register</a>
            </div>
            </div>
            </div>
        </header>
    )
}