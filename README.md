# 📚 StudyOS — Smart Study Dashboard

A feature-rich, student productivity web application built with **React 19** and **Vite**. StudyOS combines assignment tracking, grade management, focus timing, and expense tracking into a single cohesive dashboard — all without a backend, using localStorage for full offline persistence.

> Built as a web development course project demonstrating React component architecture, the Canvas API, custom hooks, utility-driven design, and responsive UI.

---

## 🖥️ Live Demo

> _Deploy to Vercel and paste your link here_
> `https://smart-study-dashboard.vercel.app`

---

## ✨ Features

### 📋 Assignment Tracker
- Add assignments with name, due date, priority (High / Med / Low), and subject
- Assignments automatically sorted by due date
- **⚠️ Urgent warning** — red highlight when due date is within 48 hours
- Subject color coding across 8 categories (Mathematics, Computer Science, English, History, Science, Art, Physics, Other)
- Filter assignments by subject with one click
- Mark complete with strikethrough animation → archived to a collapsible section
- Delete assignments
- **📈 Weekly Workload Chart** — Canvas bar chart predicting study hours per day for the next 7 days
- **💡 Smart Tips** — rotating evidence-based study tips
- **Export to CSV** — download your full assignment list

### 🎓 Grade Tracker
- Log grades by course with letter grade (A+ → F) or percentage input
- Weighted **GPA calculator** (4.0 scale) — accounts for credit hours per course
- Per-subject GPA breakdown with animated progress bars
- **Canvas trend line chart** — visualizes GPA trajectory across all logged entries
- Subject color tags consistent with the Assignment Tracker

### ⏱️ Pomodoro Timer
- 25-minute focus timer with 5-minute break cycle
- **Canvas circle countdown** — animated arc that drains as time passes
- Start / Pause / Reset controls
- Browser notifications when session ends (with permission)
- Session log — records time and duration of every completed session
- Running total of study minutes

### 💸 Expense Tracker
- Log expenses and income with description, amount, and category
- 8 student-relevant categories: Food, Transport, Books & Supplies, Rent, Health, Entertainment, Tech & Subscriptions, Other
- **Monthly budget** — set a budget and track usage with a color-coded progress bar (green → amber → red)
- **Donut chart (Canvas)** — live spending breakdown by category with percentages
- Balance summary showing surplus or deficit
- Filter by category and by type (expense / income)
- Export to CSV
- All amounts displayed in Indian Rupee (₹) format

### 🌙 Dark / Light Mode
- System-aware toggle persisted across sessions
- All components and charts fully adapt to both themes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Vanilla CSS with CSS custom properties (no CSS framework) |
| Charts | HTML5 Canvas API (no chart libraries) |
| State | React `useState` + custom `useLocalStorage` hook |
| Persistence | Browser `localStorage` (no backend required) |
| Fonts | DM Sans + DM Mono (Google Fonts) |
| Linting | ESLint with React Hooks plugin |

**Zero external UI libraries** — all components, charts, and layouts are built from scratch.

---

## 📁 Project Structure

```
smart-study-dashboard/
│
├── public/
│   └── index.html                  # HTML shell with Google Fonts
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Tab navigation + dark mode toggle
│   │   ├── AddAssignmentForm.jsx   # Assignment creation form
│   │   ├── AssignmentList.jsx      # Filtered list + CSV export
│   │   ├── AssignmentCard.jsx      # Individual card with urgency logic
│   │   ├── GradeTracker.jsx        # GPA calculator + Canvas trend chart
│   │   ├── PomodoroTimer.jsx       # Canvas circle timer + session log
│   │   ├── ExpenseTracker.jsx      # Budget tracker + Canvas donut chart
│   │   ├── WorkloadChart.jsx       # Canvas weekly workload bar chart
│   │   └── SmartTip.jsx            # Rotating study tips
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js      # Custom hook for persistent state
│   │
│   ├── utils/
│   │   ├── subjectColors.js        # Subject palette + GPA conversion logic
│   │   ├── studyTimeCalculator.js  # Urgency detection + workload prediction
│   │   └── priorityColors.js       # Priority level color definitions
│   │
│   ├── App.jsx                     # Root component + tab routing
│   ├── App.css                     # Global styles + light/dark themes
│   └── main.jsx                    # React DOM entry point
│
├── .gitignore
├── eslint.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

Verify your installation:
```bash
node -v
npm -v
```

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smart-study-dashboard.git
cd smart-study-dashboard
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

**4. Open in browser**
```
http://localhost:5173
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with hot reload |
| `npm run build` | Build optimized production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## 🔑 Key Implementation Details

### Custom `useLocalStorage` Hook
All persistent state is managed through a single reusable hook that wraps `useState` and syncs with `localStorage` automatically. Each feature uses a separate key:

| Feature | localStorage Key |
|---|---|
| Assignments | `assignments` |
| Grade entries | `grade-entries` |
| Pomodoro sessions | `pomodoro-sessions` |
| Expense entries | `expense-entries` |
| Monthly budget | `expense-budget` |
| Dark mode preference | `dark-mode` |

### Canvas API Usage
Three components draw directly to `<canvas>` elements with no charting libraries:
- **WorkloadChart** — bar chart with rounded tops and gradient fills
- **PomodoroTimer** — arc-based countdown with track + progress layers
- **GradeTracker** — area + line chart with dots and axis grid lines
- **ExpenseTracker** — donut chart with inner hole and centered text

All canvas drawings handle `devicePixelRatio` for sharp rendering on retina/HiDPI screens.

### Urgency Detection
The `studyTimeCalculator.js` utility computes the millisecond difference between now and the due date. Assignments due within 48 hours receive an `urgent` CSS class; overdue assignments receive an `overdue` class. Both states cascade through the card's border, background, and badge elements.

### Weighted GPA Calculation
```
GPA = Σ(gradePoints × credits) / Σ(credits)
```
Supports both letter grade input (mapped to a 4.0 scale) and percentage input (converted via thresholds to letter grades before mapping).

---

## 📸 Screenshots

> _Add screenshots of each tab here after deployment_

| Assignments | Grade Tracker |
|---|---|
| ![Assignments Tab](screenshots/assignments.png) | ![Grade Tracker](screenshots/grades.png) |

| Pomodoro Timer | Expense Tracker |
|---|---|
| ![Pomodoro](screenshots/pomodoro.png) | ![Expenses](screenshots/expenses.png) |

---

## 🌐 Deployment

This project deploys to **Vercel** in one click:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel auto-detects Vite — click **Deploy**
4. Your app is live at `https://your-project.vercel.app`

Alternatively, build a static bundle and host anywhere:
```bash
npm run build
# Upload the dist/ folder to any static host
```

---

## 🗺️ Roadmap

Planned features for future iterations:

- [ ] Spaced repetition flashcard system (SM-2 algorithm)
- [ ] GitHub-style calendar heatmap of study activity
- [ ] Daily streak and XP gamification system
- [ ] Voice input for assignments (Web Speech API)
- [ ] `.ics` export for Google Calendar / Apple Calendar sync
- [ ] Progressive Web App (PWA) with offline service worker
- [ ] Peer accountability partner via Firebase

---

## 👤 Author

**Naveen Boddepalli**
- GitHub: [@Naveen-Boddepalli](https://github.com/Naveen-boddepalli)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Built with React + Vite · No backend · No UI libraries · 100% Canvas charts
</div>
