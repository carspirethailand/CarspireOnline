import React, { useState, useEffect, useRef } from "react";
import {
  Car,
  LogOut,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  User,
  Settings,
  ChevronDown
} from "lucide-react";

const CarspireOnline = () => {
  const [currentPage, setCurrentPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [briefNews, setBriefNews] = useState([]);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [briefDate, setBriefDate] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

  useEffect(() => {
    const closeMenu = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    if (email === "admin@carspire.com") {
      setIsAdmin(true);
      setCurrentUser({ name: "Admin", email });
    } else {
      setCurrentUser({ name: "User", email });
    }
    setCurrentPage("menu");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setCurrentPage("login");
  };

  const fetchTodaysBrief = async () => {
    setLoadingBrief(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Generate 5 automotive news items for today as JSON."
                  }
                ]
              }
            ]
          })
        }
      );
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const json = JSON.parse(text.match(/\[[\s\S]*\]/)[0]);
      setBriefNews(json);
    } catch {
      setBriefNews([
        {
          title: "Tesla cuts Model Y price",
          summary: "Tesla lowers pricing amid competition",
          source: "EV Insider",
          time: "3h ago"
        }
      ]);
    }
    setLoadingBrief(false);
  };

  /* -------------------- PAGES -------------------- */

  const MagicWrapper = ({ children }) => (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20"></div>
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    return (
      <MagicWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-6">
              CarspireOnline
            </h1>
            <input
              className="w-full p-3 border rounded-xl mb-4"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={() => handleLogin(email)}
              className="w-full bg-indigo-600 text-white p-3 rounded-xl"
            >
              Login
            </button>
          </div>
        </div>
      </MagicWrapper>
    );
  };

  const MenuPage = () => (
    <MagicWrapper>
      <nav className="bg-white/80 backdrop-blur-xl p-4 flex justify-between">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <Car /> CarspireOnline
        </h1>

        <div ref={profileMenuRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">
              {isAdmin ? "A" : "U"}
            </div>
            <ChevronDown />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg w-48">
              <button
                onClick={() => setCurrentPage("brief")}
                className="block w-full text-left p-3 hover:bg-gray-100"
              >
                Today's Brief
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-3 text-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="p-8 grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setCurrentPage("brief")}
          className="bg-indigo-600 text-white p-6 rounded-xl"
        >
          <Calendar className="mb-2" /> Today’s Brief
        </button>
        <div className="bg-purple-600 text-white p-6 rounded-xl">
          <Users className="mb-2" /> Community
        </div>
        <div className="bg-pink-600 text-white p-6 rounded-xl">
          <TrendingUp className="mb-2" /> Trending
        </div>

        {isAdmin && (
          <div className="bg-red-600 text-white p-6 rounded-xl col-span-full">
            <Shield /> Admin Panel
          </div>
        )}
      </div>
    </MagicWrapper>
  );

  const BriefPage = () => {
    useEffect(() => {
      setBriefDate(new Date().toDateString());
      fetchTodaysBrief();
    }, []);

    return (
      <MagicWrapper>
        <nav className="p-4 bg-white/80 backdrop-blur-xl">
          <button onClick={() => setCurrentPage("menu")}>← Back</button>
        </nav>

        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-2">{briefDate}</h2>

          {loadingBrief ? (
            <p>Loading...</p>
          ) : (
            briefNews.map((n, i) => (
              <div
                key={i}
                className="bg-white/80 rounded-xl p-5 mb-4 shadow"
              >
                <h3 className="font-bold">{n.title}</h3>
                <p>{n.summary}</p>
                <div className="text-sm text-gray-500 flex justify-between mt-2">
                  <span>{n.source}</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </MagicWrapper>
    );
  };

  /* -------------------- ROUTER -------------------- */

  if (!isLoggedIn) return <LoginPage />;
  if (currentPage === "menu") return <MenuPage />;
  if (currentPage === "brief") return <BriefPage />;

  return null;
};

export default CarspireOnline;
