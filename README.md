# ⚛️ Online Code Editor - React Frontend

This is the frontend of the Online Code Editor built using React and Vite. It supports writing, running, and viewing output of Python, JavaScript, and C++ code using a Monaco editor and custom UI.

## ✨ Features

- Monaco-based code editor
- Output panel with layout toggle
- Dark mode support
- Persistent language preference via `localStorage`
- API calls to Flask backend to run code

## 🖼️ UI Snapshot

> Add a screenshot here if you have one!

## 📁 Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   ├── App.jsx
│   └── index.css
├── vite.config.js
├── package.json
└── README.md
```

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/abaiml/CodeEditor-React-Frontend.git
cd online-editor-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

App runs on: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy (Netlify)

- Push the repo to GitHub
- Connect the repo to [Netlify](https://netlify.com)
- Set build command: `npm run build`
- Set publish directory: `dist/`

## 🌐 Environment

Make sure your backend (Render) CORS allows this Netlify domain:
```js
CORS(app, origins=["https://your-site.netlify.app"])
```

## 📄 License

MIT License
