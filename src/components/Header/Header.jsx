import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import userSvg from '../../assets/user.svg'

const Header = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    function logout() {
        auth.signOut();
        navigate("/");
    }
  return (
    <div className="sticky top-0 w-full px-3 sm:px-6 py-3 sm:py-4 bg-primary-600 shadow-md z-50 flex justify-between items-center gap-2 sm:gap-6">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/dashboard" className="text-white font-bold text-[1rem] sm:text-[1.3rem] m-0 hover:text-primary-100 transition-colors duration-300">
            MoneyMap.
          </Link>
        </div>

        {/* Center: Navigation */}
        {user && (
          <div className="hidden sm:flex gap-2 sm:gap-3 flex-1 justify-center">
            <Link 
              to="/dashboard" 
              className="text-[#e3e3e3] font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-500/30 hover:bg-primary-500/50 transition-all duration-300 hover:text-white border border-primary-400/30 hover:border-primary-300/50 whitespace-nowrap"
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/splitwise" 
              className="text-[#e3e3e3] font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-500/30 hover:bg-primary-500/50 transition-all duration-300 hover:text-white border border-primary-400/30 hover:border-primary-300/50 whitespace-nowrap"
            >
              👥 Splitwise
            </Link>
          </div>
        )}

        {/* Mobile Navigation (Center) */}
        {user && (
          <div className="sm:hidden flex gap-1 flex-1 justify-center">
            <Link 
              to="/dashboard" 
              className="text-[#e3e3e3] font-medium text-xs px-2 py-1.5 rounded-full bg-primary-500/30 hover:bg-primary-500/50 transition-all duration-300 hover:text-white border border-primary-400/30 hover:border-primary-300/50"
              title="Dashboard"
            >
              📊
            </Link>
            <Link 
              to="/splitwise" 
              className="text-[#e3e3e3] font-medium text-xs px-2 py-1.5 rounded-full bg-primary-500/30 hover:bg-primary-500/50 transition-all duration-300 hover:text-white border border-primary-400/30 hover:border-primary-300/50"
              title="Splitwise"
            >
              👥
            </Link>
          </div>
        )}

        {/* Right: Logout */}
        {user ? (
            <p
            className="text-[#e3e3e3] font-medium text-xs sm:text-base m-0 cursor-pointer hover:text-white transition-all duration-300 flex items-center gap-1 sm:gap-3 bg-primary-500/20 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary-400/30 hover:border-primary-300/50 flex-shrink-0"
            onClick={logout}
            title="Logout"
            >
            <span>
                <img
                src={user.photoURL ? user.photoURL : userSvg}
                width={user.photoURL ? "28" : "20"}
                className="rounded-full"
                alt="User avatar"
                />
            </span>
            <span className="text-xs sm:text-base">Logout</span>
            </p>
        ) : (
            <></>
        )}
    </div>

  )
}

export default Header