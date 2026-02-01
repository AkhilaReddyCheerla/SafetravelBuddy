// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const EMERGENCY_CONTACTS = [
  { name: "Mom", phone: "91XXXXXXXX01" },
  { name: "Dad", phone: "91XXXXXXXX02" },
  { name: "Sister/Brother", phone: "91XXXXXXXX03" },
  { name: "Friend", phone: "91XXXXXXXX04" },
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

  // ---------- EMERGENCY SOS ----------
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

  // ---------- RENDER SECTIONS ----------
  const renderRegister = () => (
    <div className="card glass card-auth">
      <h2 className="card-title gradient-text">Create your SafeSpace</h2>
      <p className="card-subtitle">
        One secure account to keep your journeys and SOS ready anytime.
      </p>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          placeholder="Create a strong password"
        />
      </div>
      <button className="btn primary-btn wide-btn" onClick={handleRegister}>
        ✨ Create account
      </button>
      <p className="card-footer-text">
        Already have an account?{" "}
        <span className="link-text" onClick={() => setMode("login")}>
          Login instead
        </span>
      </p>
    </div>
  );

  const renderLogin = () => (
    <div className="card glass card-auth">
      <h2 className="card-title gradient-text">Welcome back, guardian</h2>
      <p className="card-subtitle">
        Sign in to keep your SOS and trusted contacts just one tap away.
      </p>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>
      <button className="btn success-btn wide-btn" onClick={handleLogin}>
        🔓 Login securely
      </button>
      <p className="card-footer-text">
        New here?{" "}
        <span className="link-text" onClick={() => setMode("register")}>
          Create your account
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
          <div className="sos-header-row">
            <div>
              <h2 className="card-title">Emergency SOS</h2>
              <p className="card-subtitle">
                One shining button. One tap. Your location and SOS are ready to send.
              </p>
            </div>
            <div className="sos-status-pill">
              <span className="status-dot" />
              SOS ready
            </div>
          </div>

          <div className="sos-circle-wrapper">
            <div className="sos-circle-glow" />
            <button
              className={`sos-circle-btn ${loadingLocation ? "disabled" : ""}`}
              onClick={handleEmergencySOS}
              disabled={loadingLocation}
            >
              <span className="sos-circle-icon">🚨</span>
              <span className="sos-circle-text">
                {loadingLocation ? "Preparing..." : "Tap to alert"}
              </span>
            </button>
          </div>

          <p className="sos-small-text">
            We’ll open WhatsApp with your live location and SOS text ready to send.
          </p>
        </div>

        {/* Emergency Contacts Section */}
        <div className="card glass card-contacts">
          <h3 className="card-title small-title">
            👨‍👩‍👧 Quick SOS to Saved Contacts
          </h3>
          <p className="card-subtitle small-subtitle">
            Send the same SOS to someone you trust with just one tap.
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
                🚀 SOS to {c.name}
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

      {/* Right side: Safety tips + quote */}
      <div className="home-side">
        <div className="card glass card-tips">
          <h3 className="card-title small-title">💡 Top 5 Safety Tips</h3>
          <ul className="tips-list">
            <li>
              Share your trip and SOS contacts with at least one trusted person.
            </li>
            <li>
              Keep your phone charged and carry a small power bank.
            </li>
            <li>
              Avoid posting your exact live location on social media.
            </li>
            <li>
              If something feels wrong, leave and alert someone you trust.
            </li>
            <li>
              Save local emergency numbers before you start your journey.
            </li>
          </ul>
        </div>

        <div className="card glass card-quote">
          <p className="quote-text">
            “Courage is not the absence of fear, it’s moving **with** safety and support
            beside you.”
          </p>
          <p className="quote-tagline">SafeTravelBuddy · Stay aware, stay strong</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-root">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* HEADER */}
      <div className="app-header">
        <div className="logo-area">
          <span className="logo-mark">🛡️</span>
          <div>
            <h1 className="app-title">SafeTravelBuddy</h1>
            <p className="app-subtitle">Premium one-tap SOS for safer journeys</p>
          </div>
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
              <h2 className="hero-heading">Safety is your superpower.</h2>
              <p>
                Build your circle of trust, save your contacts once, and keep an
                emergency alert ready for every journey.
              </p>
            </div>
            {renderRegister()}
          </div>
        )}
        {mode === "login" && (
          <div className="center-layout">
            <div className="hero-text">
              <h2 className="hero-heading">Welcome back, stay alert.</h2>
              <p>
                Sign in and keep your SOS and trusted contacts just one shining
                button away.
              </p>
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
