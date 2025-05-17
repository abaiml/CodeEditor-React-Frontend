import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "./components/CodeEditor"; // Your Monaco Editor wrapper
import ProgramSelector from "./components/ProgramSelector";
import "./index.css";
import { HiOutlineSwitchHorizontal, HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "python");
  const [theme, setTheme] = useState("vs-dark");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [ws, setWs] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState("");
  const terminalRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const templates = {
    python: `print("Hello, Python!")`,
    javascript: `console.log("Hello, JavaScript!");`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`,
  };

  // Load default code on language change
  useEffect(() => {
    setCode(templates[language] || "");
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  // Scroll terminal output to bottom on update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Handle WebSocket setup and events
  const handleRun = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }

    setTerminalOutput("");
    setIsRunning(true);

    const socket = new WebSocket("ws://127.0.0.1:8000/ws"); // Change to your backend WS URL

    socket.onopen = () => {
      // Send initial code + language as JSON
      socket.send(JSON.stringify({ code, language }));
    };

    socket.onmessage = (event) => {
  try {
    const json = JSON.parse(event.data);
    if (json.type === "done") {
      // ✅ Execution is done — stop loading
      setLoading(false);
    } else {
      setTerminalOutput((prev) => prev + "\n" + event.data);
    }
  } catch {
    // Plain text (not JSON)
    setTerminalOutput((prev) => prev + "\n" + event.data);
  }
};

    socket.onerror = (error) => {
      setTerminalOutput((prev) => prev + `\nWebSocket error: ${error.message}`);
      setIsRunning(false);
    };

    socket.onclose = () => {
      setTerminalOutput((prev) => prev + "\n\n[Process exited]");
      setIsRunning(false);
    };

    setWs(socket);
  };

  // Handle user input in terminal and send to backend
  const handleTerminalInput = (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const key = e.key;

    if (key === "Backspace") {
      ws.send("\b");
    } else if (key === "Enter") {
      ws.send("\n");
    } else if (key.length === 1) {
      ws.send(key);
    }

    // Prevent default to avoid messing with browser shortcuts or inputs
    e.preventDefault();
  };

  const handleClearTerminal = () => {
    setTerminalOutput("");
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleLayout = () => {
    setIsVerticalLayout((prev) => !prev);
  };

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-screen w-screen p-4 flex flex-col overflow-hidden`}>

      {/* Header */}
      <div className="flex flex-col gap-2 flex-none">
        <h1 className="text-3xl font-bold">Online Code Editor</h1>
        <h3 className="text-lg font-bold">{language} Compiler</h3>
      </div>

      {/* Main layout */}
      <div className="flex flex-row w-full h-full gap-2 mt-2 overflow-hidden">

        {/* Sidebar */}
        <div className={`w-16 h-full flex flex-col items-center rounded ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}>
          <ProgramSelector selected={language} onSelect={setLanguage} isDarkMode={isDarkMode} />
        </div>

        {/* Editor + Terminal */}
        <div className={`flex ${isVerticalLayout ? "flex-col" : "flex-row"} w-full h-full gap-2 overflow-hidden min-h-0`}>

          {/* Code Editor */}
          <div
            className={`flex flex-col border rounded overflow-hidden
              ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}
              transition-all duration-700 ease-in-out
            `}
            style={{
              width: isVerticalLayout ? "100%" : "75%",
              height: isVerticalLayout ? "50%" : "100%",
            }}
          >
            {/* Sticky Header */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between p-3 rounded-t z-10 sticky top-0`}>
              <h2 className="text-md font-bold">main.{language === "javascript" ? "js" : language === "cpp" ? "cpp" : "py"}</h2>
              <div className="flex gap-2">
                <button onClick={handleToggleLayout} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center gap-2">
                  {isVerticalLayout ? <HiOutlineSwitchHorizontal size={20} /> : <HiOutlineSwitchVertical size={20} />}
                </button>
                <button onClick={handleToggleTheme} className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white flex items-center gap-2">
                  {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                </button>
                <button
                  className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">&#9696;</span> Running...
                    </div>
                  ) : (
                    "Run Code"
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Code Editor Area */}
            <div className="flex-grow overflow-auto min-h-0">
              <CodeEditor code={code} setCode={setCode} theme={theme} />
            </div>
          </div>

          {/* Terminal Output */}
          <div
            className={`flex flex-col border rounded
              ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}
              transition-all duration-700 ease-in-out
            `}
            style={{
              width: isVerticalLayout ? "100%" : "25%",
              height: isVerticalLayout ? "50%" : "100%",
            }}
          >
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between items-center p-3 rounded-t`}>
              <h2 className="font-semibold">Terminal</h2>
              <button
                className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleClearTerminal}
                disabled={isRunning}
              >
                Clear
              </button>
            </div>

            <pre
              ref={terminalRef}
              tabIndex={0}
              onKeyDown={handleTerminalInput}
              className="flex-grow overflow-auto p-3 font-mono text-sm whitespace-pre-wrap outline-none"
              style={{ userSelect: "text", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {terminalOutput || "[Output will appear here]"}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}
