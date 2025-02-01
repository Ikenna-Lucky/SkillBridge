import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";

const Header = () => {
  const { userData } = useContext(AppContent);

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <div className="mb-6">
        <img
          src={assets.logo1}
          className="rounded-full max-h-32 sm:w-36 sm:h-36 object-cover"
          alt=""
        />
      </div>
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Ciao {userData ? userData.name : "Scholars"}!
        <img src={assets.hand_wave} className="w-8  aspect-square" alt="" />
      </h1>
      <h2 className="text-4xl sm:text-5xl font-semibold mb-4">
        Welcome To SkillBridge
      </h2>
      <p className="mb-8 max-w-md">
        Let's start with a quick product tour and we will have you up and
        running in no time!
      </p>
      <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all duration-200">
        Get Started
      </button>
    </div>
  );
};

export default Header;
