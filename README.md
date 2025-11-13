🏢 Visitor Management System

A complete Visitor Management System built with
🟦 Node.js (Express + TypeScript) for backend,
📱 React Native / Expo for frontend, and
💬 Signal CLI integration for sending real-time visitor notifications without carrier or SMS fees.

🚀 Features

📸 Capture visitor photos (mobile/web camera)

📝 Enter visitor details, department, and reason

🏷️ Auto-generate A5 visitor ID cards (PDF)

🗺️ Embed venue maps + QR codes (14 fixed locations)

🔔 Notify host via Signal message (free, encrypted)

🧾 View & manage all visitors from the backend

🎨 Beautiful modern UI built with React Native & Expo

🗂️ Project Structure
visitor-management/
│
├── backend/                   # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/       # visitor.controller.ts (handles add + notify)
│   │   ├── models/            # visitor.model.ts (Mongo schema)
│   │   ├── routes/            # visitor.routes.ts (API routes)
│   │   ├── utils/             # generateIdCard.ts (PDF + QR logic)
│   │   ├── index.ts           # Main server file
│   ├── signal-cli/            # Signal CLI binaries
│   ├── package.json
│
├── frontend/                  # React Native / Expo app
│   ├── screens/
│   │   ├── AddVisitorScreen.js
│   ├── api/
│   │   ├── apiClient.js
│   ├── App.js
│   ├── package.json
│
└── README.md

🛠️ Backend Setup (Node.js + MongoDB)
1️⃣ Install Dependencies
cd backend
npm install

2️⃣ Configure MongoDB Connection

Create a .env file in /backend:

MONGO_URI=mongodb://localhost:27017/visitorDB
PORT=5000

3️⃣ Start the Backend
npm run dev


Your backend runs at 👉 http://localhost:5000

💬 Signal CLI Integration (Free Notifications)
1️⃣ Download and Setup Signal CLI

Already included in your project under
backend/signal-cli/

If not, get it from:
👉 https://github.com/AsamK/signal-cli/releases

2️⃣ Register Your Number

In PowerShell:

cd backend/signal-cli/bin
.\signal-cli.bat -u +91XXXXXXXXXX register


Then complete the captcha as instructed.
Finally:

.\signal-cli.bat -u +91XXXXXXXXXX verify <OTP>


✅ You are now registered with Signal CLI.

3️⃣ Test Sending Message
.\signal-cli.bat -u +91YOURNUMBER send -m "Hello from Signal CLI" +91RECIPIENT


If this works, the backend integration will also work.

⚙️ Environment Variables (optional)

For backend, edit /src/controllers/visitor.controller.ts:

const SIGNAL_NUMBER = "+91YOURREGISTEREDNUMBER";
const DEFAULT_HOST_NUMBER = "+91HOSTNUMBER";

📤 Notify Host Setup

When a visitor is added:

The backend generates an ID Card (PDF) with a map and QR.

The user can click “Notify Host” on the app.

The backend calls Signal CLI and sends a free message like this:

🚪 Visitor Alert
👤 Name: Abhey
🏢 Department: Chronosphere
🎯 Reason: Meeting
📅 12/11/2025, 10:45 AM

ID Card: http://localhost:5000/uploads/idcards/69140adab98a445cc9e7d0dc.pdf

📱 Frontend Setup (React Native + Expo)
1️⃣ Install Dependencies
cd frontend
npm install

2️⃣ Start the App
npx expo start


You can open it in:

Expo Go (mobile)

Web browser (for camera simulation)

🧩 API Endpoints
Method	Endpoint	Description
POST	/api/visitors/add	Add new visitor
POST	/api/visitors/notify	Notify host via Signal
GET	/api/visitors	Get all visitors
GET	/api/visitors/:id	Get specific visitor
DELETE	/api/visitors/:id	Delete visitor
🧾 Example .env
MONGO_URI=mongodb://localhost:27017/visitorDB
PORT=5000
SIGNAL_CLI_PATH=D:\visitor-management\backend\signal-cli\bin\signal-cli.bat
SIGNAL_NUMBER=+91XXXXXXXXXX
DEFAULT_HOST_NUMBER=+91XXXXXXXXXX

🎯 Future Enhancements

Department-based host auto-mapping

Web dashboard for visitor analytics

QR-based check-in validation

Push notifications for mobile hosts

🧑‍💻 Author

Harsha Vardan
💼 Full-stack Developer (Node.js + Kotlin + React Native)
📧 Contact via Signal
