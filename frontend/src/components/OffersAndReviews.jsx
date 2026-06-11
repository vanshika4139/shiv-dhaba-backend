import React from 'react';

const REVIEWS = [
  { id: 1, name: "Rahul Sharma", rating: "⭐⭐⭐⭐⭐", text: "Dal Makhani ka swad ekdum lajawab hai! Asli desi ghee ka maza aa gaya." },
  { id: 2, name: "Priya Verma", rating: "⭐⭐⭐⭐⭐", text: "Shiv Dhaba Thali is pocket-friendly and completely filling. Highly recommended!" }
];

function OffersAndReviews() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-900">
      {/* Running Offers Banner */}
      <div className="bg-gradient-to-r from-red-600 to-[#FF6B01] rounded-2xl p-6 text-center shadow-xl mb-16 transform hover:scale-[1.01] transition-all">
        <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          WEEKEND SPECIAL OFFER ⚡
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-white mt-2">
          Get 20% OFF on orders above ₹300!
        </h3>
        <p className="text-white/80 text-sm mt-1 italic">
          Use Code: <span className="font-mono font-bold text-yellow-300 bg-black/30 px-2 py-0.5 rounded">SHIV20</span> on billing counter.
        </p>
      </div>

      {/* Customer Reviews Section */}
      <div>
        <h3 className="text-2xl md:text-4xl font-black text-[#FFD700] text-center font-serif mb-8 tracking-wide">
          WHAT OUR CUSTOMERS SAY ❤️
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-xl relative overflow-hidden">
              <span className="absolute right-4 top-2 text-6xl text-gray-800 pointer-events-none">”</span>
              <div className="text-yellow-400 text-sm mb-2">{rev.rating}</div>
              <p className="text-gray-300 italic text-sm mb-4">"{rev.text}"</p>
              <h4 className="text-[#FF6B01] font-bold text-sm tracking-wide">- {rev.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OffersAndReviews;
