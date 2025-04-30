export default function Home(){
    return <div className="relative flex flex-col sm:flex-row min-h-screen bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500">
    <div className="text-white w-full sm:w-1/2">
        <div className="flex flex-col gap-8 items-start justify-start w-full h-full px-4 sm:ps-12 py-20">
        <h1>Test</h1>
        <p>Test Paragraph</p>
        </div>
    </div>
    <img className="absolute object-cover" src="/assets/hero/homepage.png" alt="Chama Yetu" style={{width: "100%"}}/>
    </div>
}