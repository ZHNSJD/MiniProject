export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 bg-hero-pattern bg-cover bg-center h-screen flex items-center ">
      <div className="bg-white/5 backdrop-blur-lg rounded-lg shadow-lg p-8 max-w-md text-center">
      <h1 className="text-4xl font-bold text-white mb-4">
        SoulWave
      </h1>
      <p className="text-lg text-gray-400 text-center mb-6">
        Beyond Words – Let AI Read Your Heart.
      </p> 

      {/* Login & Signup Buttons */}
      <div className="flex gap-10 flex items-center justify-center" >
        <a href="/login" className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
          Login
        </a>
        <a href="/signup" className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
          Sign Up
        </a>
        </div>
      </div> <br></br>
      <footer className="mt-10 text-white text-center">
  <p>&copy; 2025 SoulWave. All rights reserved.</p>
  <p className="mt-2">
    <a href="#" className="underline">Privacy Policy</a> • 
    <a href="#" className="underline">Terms of Service</a>
  </p>
</footer>

    </div>
    
  );
}
