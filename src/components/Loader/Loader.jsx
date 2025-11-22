import React from "react";

function Loader() {
  return (
    <div className="fixed top-0 left-0 w-screen h-[90vh] flex items-center justify-center bg-white z-50">
      <div className="relative w-20 h-20">
        <div className="absolute rounded-full border-4 border-theme animate-ripple w-0 h-0 top-9 left-9 opacity-0" />
        <div className="absolute rounded-full border-4 border-theme animate-ripple-delay w-0 h-0 top-9 left-9 opacity-0" />
      </div>
    </div>
  );
}

export default Loader;
