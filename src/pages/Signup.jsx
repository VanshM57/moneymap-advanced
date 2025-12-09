import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "../components/Header/Header";
import { toast } from "react-toastify";
import Loader from "../components/Loader/Loader";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [flag, setFlag] = useState(false);
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const createUserDocument = async (user) => {
    setLoading(true);
    // Check if user is null or undefined
    if (!user) return;
    
    // Create a reference to the user document in Firestore
    // using the user's unique ID (uid)
    const userRef = doc(db, "users", user.uid);
    // Check if the user document already exists
    // If it does not exist, create a new document with user details
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
        // If user document does not exist, create it
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        // Set the user document with the provided details
        await setDoc(userRef, {
          name: displayName ? displayName : name,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
        setLoading(false);
      }
    }
  };

  const signUpWithEmail = async (e) => {
    setLoading(true);
    e.preventDefault();
    if(!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    try {
      // create user and store in firebase authentication
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      // use to store user data in firestore with extra details if we want to add
      await createUserDocument(user);
      toast.success("Successfully Signed Up!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing up with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithEmail = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      navigate("/dashboard");
      toast.success("Logged In Successfully!");
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing in with email and password: ",
        error.message
      );
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    //checking there is provider is available or not
    if (!provider) {
      toast.error("Google provider is not available.");
      setLoading(false);
      return;
    }

    try {
        // Sign in with Google using Firebase Authentication
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("User Authenticated Successfully!");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      console.error("Error signing in with Google: ", error.message);
    }
  };

  return (
    <>
        <Header />
        <div className="flex justify-center items-center w-screen h-[90vh] px-4">
            {flag ? (
            <div className="w-full max-w-md shadow-[0_0_30px_8px_rgba(227,227,227,0.75)] rounded-xl p-8">
                <h2 className="text-center text-xl font-semibold">
                Log In on <span className="text-[var(--theme)]">MoneyMap.</span>
                </h2>
                <form onSubmit={signUpWithEmail}>
                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Email</p>
                    <input
                    type="email"
                    placeholder="JohnDoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Password</p>
                    <input
                    type="password"
                    placeholder="Example123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <button
                    disabled={loading}
                    onClick={signInWithEmail}
                    className="w-full text-[var(--theme)] text-center border border-[var(--theme)] bg-white py-2 my-2 rounded hover:bg-[var(--theme)] hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                    {loading ? "Loading..." : " Log In with Email and Password"}
                </button>
                </form>
                <p className="text-center my-2">or</p>
                <button
                disabled={loading}
                onClick={signInWithGoogle}
                className="w-full bg-[var(--theme)] text-white py-2 my-2 rounded border border-[var(--theme)] hover:bg-white hover:text-[var(--theme)] transition-all duration-300 flex items-center justify-center"
                >
                {loading ? "Loading..." : " Log In with Google"}
                </button>
                <p
                onClick={() => setFlag(!flag)}
                className="text-center mt-2 mb-0 cursor-pointer"
                >
                Or Don't Have An Account? Click Here.
                </p>
            </div>
            ) : (
            <div className="w-full max-w-md shadow-[0_0_30px_8px_rgba(227,227,227,0.75)] rounded-xl p-8">
                <h2 className="text-center text-xl font-semibold">
                Sign Up on <span className="text-[var(--theme)]">MoneyMap.</span>
                </h2>
                <form onSubmit={signUpWithEmail}>
                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Full Name</p>
                    <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Email</p>
                    <input
                    type="email"
                    placeholder="JohnDoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Password</p>
                    <input
                    type="password"
                    placeholder="Example123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <div className="my-4 w-full">
                    <p className="mb-1 text-black">Confirm Password</p>
                    <input
                    type="password"
                    placeholder="Example123"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-b border-black py-2 focus:outline-none placeholder:text-black/50"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full text-[var(--theme)] text-center border border-[var(--theme)] bg-white py-2 my-2 rounded hover:bg-[var(--theme)] hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                    {loading ? "Loading..." : "Sign Up with Email and Password"}
                </button>
                </form>
                <p className="text-center my-2">or</p>
                <button
                disabled={loading}
                onClick={signInWithGoogle}
                className="w-full bg-[var(--theme)] text-white py-2 my-2 rounded border border-[var(--theme)] hover:bg-white hover:text-[var(--theme)] transition-all duration-300 flex items-center justify-center"
                >
                {loading ? "Loading..." : "Sign Up with Google"}
                </button>
                <p
                onClick={() => setFlag(!flag)}
                className="text-center mt-2 mb-0 cursor-pointer"
                >
                Or Have An Account Already? Click Here
                </p>
            </div>
            )}
        </div>
    </>

  );
};

export default Signup;