# ✝️ The Well — Catholic Bible Study Companion

**The Well** is a personal Bible study web application built with React and Firebase. Designed for daily Scripture engagement, it is specifically tailored for Catholic users following the annual **Fr. Mike Schmitz "Bible in a Year"** podcast. 

Rather than anchoring notes strictly to dates, **The Well** anchors notes to Scripture coordinates (e.g., `GEN.1.1`), building a lifelong, multi-year chronological web of personal theological commentary.

---

## 🚀 Key Features

* **Complete Catholic Canon**: Full 73-book Catholic Bible reader, including all Deuterocanonical books.
* **Verse-Anchored Note-Taking & Historical Stacking**: Attach notes to precise Book, Chapter, and Verse coordinates. Compare your reflections across multiple years side-by-side.
* **Bible in a Year Alignment**: Integrated 365-day reading plan tracking corresponding to Fr. Mike Schmitz's reading assignments, including supplemental Psalms and Proverbs.
* **Progress Matrix**: Visual tracker for monitoring progress across all 73 books and 365 daily podcast readings.
* **Entity & Theme Wiki**: Create profiles for Biblical people, places, and events, as well as overarching spiritual themes (e.g., *Covenant*, *Grace*), backlinking them directly to verses.
* **Embeddable Widget**: Public widget view (`/widget`) for quick daily reading access and dashboard integration.
* **Secure Cloud Sync**: User authentication and real-time database synchronization via Firebase Auth & Firestore.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Backend & Database**: [Firebase Authentication](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
* **Linter**: [Oxlint](https://github.com/oxc-project/oxc)
* **Styling**: Modern CSS with glassmorphism & dark aesthetic design system

---

## 💻 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harrisbradley/the-well-app.git
   cd the-well-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Firebase project configuration:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

* `npm run dev` — Starts the local Vite development server with HMR.
* `npm run build` — Builds the production bundle to the `dist` directory.
* `npm run preview` — Locally previews the production build.
* `npm run lint` — Runs Oxlint code diagnostics.

---

## 📱 Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Main User Dashboard | Protected |
| `/reader` | Catholic Scripture Reader & Note Editor | Protected |
| `/matrix` | 365-Day & 73-Book Reading Progress Matrix | Protected |
| `/login` | User Authentication Login | Public |
| `/signup` | Account Creation | Public |
| `/widget` | Embeddable Daily Scripture Widget | Public |

---

## 🏠 Homelab & Raspberry Pi Deployment

This application is deployed on a Raspberry Pi (`harrispi`) managed via PM2.

To serve locally after building:
```bash
npm run build
npx serve -s dist -l 4010
```
*(See [homelab.json](file:///C:/Users/hopei/Documents/GitHub/the-well-app/homelab.json) for host runtime details).*
