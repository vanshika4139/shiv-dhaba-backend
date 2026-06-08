import React from 'react';

// Isme humne onCartClick prop add kiya hai
function Navbar({ cartCount, onCartClick }) {
  return (
    <nav className="bg-[#121212] text-white border-b border-gray-800 px-6 py-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo / Name */}
        <div className="text-2xl font-black tracking-wider text-[#FF6B01] font-serif cursor-pointer">
          SHIV DHABA <span className="text-[#FFD700]">RESTRO</span>
        </div>

        {/* Desktop Menu Links */}
        <div className="hidden md:flex space-x-8 font-medium tracking-wide">
          <a href="#" className="text-[#FF6B01] hover:text-[#FFD700] transition-colors">Home</a>
          <a href="#" className="hover:text-[#FF6B01] transition-colors">Menu</a>
          <a href="#" className="hover:text-[#FF6B01] transition-colors">About Us</a>
          <a href="#" className="hover:text-[#FF6B01] transition-colors">Contact</a>
        </div>

        {/* Right Actions (Cart Button) */}
        <div className="flex items-center space-x-4">
          {/* Added onClick here to open modal */}
          <div 
            onClick={onCartClick}
            className="relative bg-gray-800 p-2.5 rounded-full hover:bg-gray-700 transition cursor-pointer active:scale-95"
          >
            <span className="text-xl">🛒</span>
            <span className="absolute -top-1 -right-1 bg-[#FF6B01] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold text-white">
              {cartCount}
            </span>
          </div>
          
          <button className="bg-gradient-to-r from-[#FF6B01] to-[#FFD700] text-black font-bold px-5 py-2 rounded-full text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg hidden sm:block">
            Order Now
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;