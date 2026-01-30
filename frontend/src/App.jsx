// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const EMERGENCY_CONTACTS = [
  { name: "Mom", phone: "REMOVED" },
  { name: "Dad", phone: "REMOVED" },
  { name: "Sister/Brother", phone: "REMOVED" },
  { name: "Friend", phone: "REMOVED" },
];

function App() {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // {name, email}

  // "register" | "login" | "home"
  const [mode, setMode] = useState("register");

  const API_BASE = "http://localhost:8081";

  // On first load, if token exists, try auto-login -> go to home
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    axios
      .get(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUser(res.data);
        setIsLoggedIn(true);
        setMode("home");
      })
      .catch(() => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setMode("register");
      });
  }, []);

  // ---------- REGISTER ----------
  const handleRegister = async () => {
    try {
      if (!registerName || !registerEmail || !registerPassword) {
        alert("Please fill all register fields.");
        return;
      }

      const body = {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      };

      const res = await axios.post(`${API_BASE}/api/auth/register`, body);
      console.log("Register success:", res.data);
      alert("Register success. Please login.");
      setMode("login");
      setLoginEmail(registerEmail);
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      alert("Register failed, check console.");
    }
  };

  // ---------- LOGIN ----------
  const handleLogin = async () => {
    try {
      if (!loginEmail || !loginPassword) {
        alert("Please fill both email and password.");
        return;
      }

      const body = {
        email: loginEmail,
        password: loginPassword,
      };

      const res = await axios.post(`${API_BASE}/api/auth/login`, body);
      console.log("Login success:", res.data);

      const token = res.data.token;
      localStorage.setItem("jwtToken", token);

      const meRes = await axios.get(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUser(meRes.data);
      setIsLoggedIn(true);
      setMode("home");

      alert("Login success.");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed, check console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setMode("login");
    alert("Logged out.");
  };

  // ---------- PROTECTED API TEST ----------
  const testProtectedApi = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("No token found. Please login first.");
        return;
      }

      const res = await axios.get(`${API_BASE}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Protected API success:", res.data);
      alert("Protected API success. Check console.");
    } catch (err) {
      console.error("Protected API error:", err.response?.data || err.message);
      alert("Protected API failed. Check console.");
    }
  };

  // ---------- EMERGENCY SOS (generic) ----------
  const buildAndOpenWhatsApp = (contactPhone) => {
    setLoadingLocation(true);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Please login first so we know who you are.");
      setLoadingLocation(false);
      return;
    }

    let userName = "User";

    axios
      .get(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((meRes) => {
        userName = meRes.data.name || "User";
      })
      .catch(() => {
        console.warn("Could not fetch user info for SOS, using generic name.");
      })
      .finally(() => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by this browser.");
          setLoadingLocation(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLoadingLocation(false);

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

            const tripInfo = "Trip info: (source → destination, time).";

            const message = `
EMERGENCY: This is ${userName}. I need immediate help.
My approximate location: ${mapsLink}
${tripInfo}
Please contact me ASAP.
            `.trim();

            const encodedMessage = encodeURIComponent(message);

            let waUrl;
            if (contactPhone) {
              waUrl = `https://wa.me/${contactPhone}?text=${encodedMessage}`;
            } else {
              waUrl = `https://wa.me/?text=${encodedMessage}`;
            }

            window.open(waUrl, "_blank");
          },
          (error) => {
            setLoadingLocation(false);
            console.error("Error getting location:", error);
            alert("Unable to get location. Please check location permissions.");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          }
        );
      });
  };

  const handleEmergencySOS = () => {
    buildAndOpenWhatsApp(null);
  };

  const handleEmergencyToContact = (contact) => {
    buildAndOpenWhatsApp(contact.phone);
  };

  // ---------- RENDER MODES ----------

  const renderRegister = () => (
    <div className="card glass card-auth">
      <h2 className="card-title">📝 Create account</h2>
      <p className="card-subtitle">
        Register to use SafeTravelBuddy and protect your journeys.
      </p>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      <button className="btn primary-btn" onClick={handleRegister}>
        Sign up
      </button>
      <p className="card-footer-text">
        Already have an account?{" "}
        <span className="link-text" onClick={() => setMode("login")}>
          Go to Login
        </span>
      </p>
    </div>
  );

  const renderLogin = () => (
    <div className="card glass card-auth">
      <h2 className="card-title">🔐 Login</h2>
      <p className="card-subtitle">
        Login to trigger SOS alerts and manage your safety.
      </p>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      <button className="btn success-btn" onClick={handleLogin}>
        Login
      </button>
      <p className="card-footer-text">
        Don&apos;t have an account?{" "}
        <span className="link-text" onClick={() => setMode("register")}>
          Go to Register
        </span>
      </p>
    </div>
  );

  const renderHome = () => (
    <div className="home-layout">
      {/* Left side: SOS + contacts */}
      <div className="home-main">
        {/* SOS Section */}
        <div className="card glass card-sos">
          <h2 className="card-title">🚨 Emergency SOS</h2>
          <p className="card-subtitle">
            In an emergency, press this button. We will get your location (with
            your permission), build an SOS message, and open WhatsApp with the
            message ready to send.
          </p>
          <button
            className={`btn sos-btn ${loadingLocation ? "disabled" : ""}`}
            onClick={handleEmergencySOS}
            disabled={loadingLocation}
          >
            {loadingLocation ? "Preparing SOS..." : "🚨 EMERGENCY SOS"}
          </button>
        </div>

        {/* Emergency Contacts Section */}
        <div className="card glass card-contacts">
          <h3 className="card-title small-title">
            👨‍👩‍👧 Quick SOS to Saved Contacts
          </h3>
          <p className="card-subtitle small-subtitle">
            One tap on a contact sends the same SOS and live location to that
            person via WhatsApp.
          </p>
          <div className="contacts-grid">
            {EMERGENCY_CONTACTS.map((c) => (
              <button
                key={c.phone}
                className={`btn contact-btn ${
                  loadingLocation ? "disabled" : ""
                }`}
                onClick={() => handleEmergencyToContact(c)}
                disabled={loadingLocation}
              >
                SOS to {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Protected API Test */}
        <div className="protected-test">
          <button className="btn warning-btn" onClick={testProtectedApi}>
            🔄 Test Protected API (/api/user/me)
          </button>
        </div>
      </div>

      {/* Right side: Safety tips */}
      <div className="home-side">
        <div className="card glass card-tips">
          <h3 className="card-title small-title">💡 Top 5 Safety Tips</h3>
          <ul className="tips-list">
            <li>
              Always share your itinerary and SOS contacts with family before
              you travel.
            </li>
            <li>
              Keep your phone charged and carry a small power bank for
              emergencies.
            </li>
            <li>
              Avoid sharing your exact location publicly on social media while
              you are still there.
            </li>
            <li>
              Trust your instincts: if a situation feels wrong, leave
              immediately and alert someone you trust.
            </li>
            <li>
              Save local emergency numbers and your hotel/host contact in your
              phone.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-root">
      {/* HEADER */}
      <div className="app-header">
        <div className="logo-area">
          <span className="logo-dot" />
          <h1 className="app-title">🛡️ SafeTravelBuddy</h1>
        </div>
        <div className="header-right">
          {isLoggedIn && currentUser ? (
            <>
              <span className="user-info">
                Logged in as {currentUser.name} ({currentUser.email})
              </span>
              <button className="btn ghost-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <span className="user-info muted">Not logged in</span>
          )}
        </div>
      </div>

      {/* MAIN CONTENT BY MODE */}
      <div className="app-body">
        {mode === "register" && (
          <div className="center-layout">
            <div className="hero-text">
              <h2>Protect every journey.</h2>
              <p>
                SafeTravelBuddy lets you send a live-location SOS to your
                trusted contacts in just one tap.
              </p>
            </div>
            {renderRegister()}
          </div>
        )}
        {mode === "login" && (
          <div className="center-layout">
            <div className="hero-text">
              <h2>Welcome back.</h2>
              <p>Login to access your emergency features and stay safer.</p>
            </div>
            {renderLogin()}
          </div>
        )}
        {mode === "home" && renderHome()}
      </div>
    </div>
  );
}

export default App;
