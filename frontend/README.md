# SafeTravelBuddy – Women's Safety SOS App

SafeTravelBuddy is a full‑stack web application that helps users send a one‑tap SOS alert with their live location to trusted contacts via WhatsApp.

## ✨ Features

- One‑tap SOS button that prepares an emergency WhatsApp message with a Google Maps link to the user’s current location  
- Option to send SOS to general WhatsApp or directly to specific contacts (Mom, Dad, Sister/Brother, Friend)  
- Secure user registration and login using JWT authentication  
- Premium dark UI with glassmorphism cards and a glowing circular SOS button  
- Safety tips panel with top 5 travel safety tips  
- Motivational quote section to give confidence during travel  

## 🧱 Tech Stack

**Frontend**

- React (Vite)  
- HTML5, CSS3 (dark glassmorphism design)  
- Browser Geolocation API  
- WhatsApp deep links (`https://wa.me/...`)  

**Backend**

- Java 17  
- Spring Boot (REST APIs)  
- JWT authentication (`/api/auth/register`, `/api/auth/login`, `/api/user/me`)  
- Maven for build and dependency management  

**Other**

- Git & GitHub for version control  
- Netlify (optional) for deploying the frontend (manual upload of `dist` folder)  

## 🚀 Getting Started (Local Setup)

### Prerequisites

- Java 17+  
- Maven  
- Node.js and npm  
- Git  

### 1. Clone the repository

```bash
git clone https://github.com/AkhilaReddyCheerla/SafetravelBuddy.git
cd SafetravelBuddy
2. Run the backend (Spring Boot)
bash
cd backend
mvn clean install
mvn spring-boot:run
Backend runs at:

text
http://localhost:8081
3. Run the frontend (React + Vite)
Open a new terminal:

bash
cd frontend
npm install
npm run dev
Frontend runs at (Vite default):

text
http://localhost:5173
Make sure your frontend uses:

js
const API_BASE = "http://localhost:8081";
🔐 Main API Endpoints
POST /api/auth/register – Register a new user

POST /api/auth/login – Login and receive a JWT token

GET /api/user/me – Get current logged‑in user (requires Authorization: Bearer <token>)

🧪 SOS Flow
User logs in to the application

Clicks the glowing SOS button

Browser requests current location via the Geolocation API

App builds a WhatsApp URL with emergency message + Google Maps link

WhatsApp opens with the message pre‑filled, ready to send

📚 What I Learned
Connecting a React frontend with a Spring Boot backend

Implementing JWT‑based authentication and protected routes

Using the browser Geolocation API and deep links

Designing a modern, premium‑looking UI instead of a basic student UI

Basic deployment using Netlify for the frontend

🗺️ Future Enhancements
Save emergency contacts per user in the database

SMS integration for true multi‑contact one‑tap alerts

Deploy backend to a public cloud (e.g., Render) and connect from Netlify

Add more safety tips and regional emergency numbers

👤 Author
Akhila Cheerla – Full‑Stack Developer in progress

LinkedIn:https://www.linkedin.com/in/akhila-cheerla-b91250305/