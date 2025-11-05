# 🎴 RecallCards - Modern Flashcard Learning Platform

<div align="center">

![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?style=for-the-badge&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)

**A beautiful, modern flashcard application built with React and Vite**

[🌐 Live Website](https://recallcards.net) • [🔧 Backend Repo](https://github.com/ErfanTagh/flashcard-backend)

</div>

---

## ✨ Features

- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and shadcn/ui components
- 🔐 **Auth0 Authentication** - Secure login and user management
- 📝 **Create Flashcards** - Add terms and definitions with a clean form
- 🎲 **Review Mode** - Interactive 3D flip cards for studying
- 📊 **Progress Tracking** - Monitor your learning journey
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🚀 **Fast Performance** - Built with Vite for lightning-fast development
- 🎯 **SPA Routing** - Smooth navigation with React Router

## 🛠️ Tech Stack

| Category             | Technology           |
| -------------------- | -------------------- |
| **Framework**        | React 18.2           |
| **Build Tool**       | Vite 5.4             |
| **Styling**          | Tailwind CSS 3.4     |
| **UI Components**    | shadcn/ui, Radix UI  |
| **Icons**            | Lucide React         |
| **Authentication**   | Auth0                |
| **Routing**          | React Router DOM 6.3 |
| **State Management** | React Hooks          |
| **Deployment**       | Docker, Nginx        |

## 🎯 Key Components

### 🏠 **Home Page**

- Landing page for unauthenticated users
- Dashboard with action cards for authenticated users
- Welcome section with personalized greeting

### ➕ **Add Card**

- Clean form with validation
- Real-time character counter
- Toast notifications for feedback
- Preview card before submission

### 📚 **Review Cards**

- Interactive 3D flip animation
- Click to reveal definitions
- Next card button for continuous review
- Beautiful card-based UI

### 👤 **Profile**

- User information display
- Auth0 integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/ErfanTagh/flashcard-frontend.git
   cd flashcard-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Docker Deployment

1. **Build Docker image**

   ```bash
   docker build -t flashcard-frontend .
   ```

2. **Run with Docker Compose**
   ```bash
   cd ../flashcard-backend
   docker compose up -d frontend
   ```

## 📁 Project Structure

```
flashcard-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ModernNavbar.tsx # Navigation bar
│   ├── Components/          # Feature components
│   │   ├── AddFlashcard.jsx # Add card form
│   │   ├── Flashcard.jsx    # Review cards
│   │   └── ...
│   ├── views/               # Page components
│   │   └── views/
│   │       ├── Home.jsx     # Landing/Dashboard
│   │       └── Profile.jsx   # User profile
│   ├── hooks/               # Custom React hooks
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/                 # Utility functions
│   │   └── utils.ts         # Helper functions
│   ├── config/              # Configuration
│   │   └── api.js           # API URL builder
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .github/                 # GitHub Actions workflows
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration
├── tailwind.config.js      # Tailwind CSS config
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## 🎨 Design System

The project uses a custom design system with Tailwind CSS:

- **Colors**: HSL-based color palette with light/dark mode support
- **Components**: shadcn/ui components for consistency
- **Icons**: Lucide React for modern iconography
- **Typography**: Custom font stack with Ubuntu

### Theme Colors

- **Primary**: Purple (`262 83% 58%`)
- **Accent**: Pink (`340 82% 65%`)
- **Background**: Light gray (`220 25% 97%`)
- **Foreground**: Dark gray (`220 15% 20%`)

## 🔧 Configuration

### Vite Proxy

The development server proxies API requests:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true
    }
  }
}
```

### Auth0 Setup

Update `App.jsx` with your Auth0 credentials:

```javascript
<Auth0Provider
  domain="dev-43bumhcy.us.auth0.com"
  clientId="your-client-id"
  redirectUri={window.location.origin}
  audience="recallcards"
>
```

## 📦 Available Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

## 🔄 CI/CD

Automated deployment via GitHub Actions:

- **Trigger**: Push to `main` or `master`
- **Actions**: Pull code, rebuild Docker container, restart services
- **Workflow**: `.github/workflows/deploy.yml`

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Rebuild without cache
docker compose build --no-cache frontend
docker compose up -d --force-recreate frontend
```

## 📝 License

This project is open source and available for personal use.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ and ☕ for learners everywhere**

[⭐ Star this repo](https://github.com/ErfanTagh/flashcard-frontend) • [🌐 Visit Website](https://recallcards.net)

**Start learning today - it's free! 🎉**

</div>
