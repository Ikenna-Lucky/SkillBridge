import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContent);

  const navigate = useNavigate();

  const inputRefs = React.useRef([]);

  //To automatically move to the next input field when inputting a number
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  //to automatically move backwards when the backspace key is keyed down
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index) {
      inputRefs.current[index - 1].focus();
    }
  };

  //To be able to paste the text copied
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault(); //Tp prevent the page from reloading after submission
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );
      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/"); // Not necessary to add
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedIn, userData]);

  return (
    <div className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-blue-200 to-blue-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-80 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>
        <div
          className="flex justify-between mb-8 items-center"
          onPaste={handlePaste}
        >
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-9 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md"
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
