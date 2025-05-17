import CodeEditor from "./components/CodeEditor";
import ProgramSelector from "./components/ProgramSelector";
import TerminalComponent from "./components/Terminal";
import { useEffect, useState, useRef, forwardRef } from "react";
import "./index.css";
import { HiOutlineSwitchHorizontal, HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function App() {
  const [code, setCode] = useState("");
  const [theme, setTheme] = useState("vs-dark");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "python";
  });

  // Ref for TerminalComponent to call run method
  const terminalRef = useRef(null);

  const templates = {
    python: `print("Hello, Python!")`,
    javascript: `console.log("Hello, JavaScript!");`,
    cpp: `#include<iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}`,
  };

  useEffect(() => {
    setCode(templates[language] || "");
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleLayout = () => {
    setIsVerticalLayout((prev) => !prev);
  };

  // When Run button clicked, call terminal's method to send run command
  const handleRun = () => {
    if (terminalRef.current && code.trim()) {
      setIsRunning(true);
      terminalRef.current.runCode({
        code,
        language,
        onFinish: () => setIsRunning(false), // callback to reset isRunning
      });
    }
  };

  // WebSocket URL for terminal backend
  const wsUrl = "ws://codeeditor-production-0337.up.railway.app/ws";

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-screen w-screen p-4 flex flex-col overflow-hidden`}>

      {/* Header */}
      <div className="flex flex-col gap-2 flex-none">
        <h1 className="text-3xl font-bold">Online Code Editor</h1>
        <h3 className="text-lg font-bold">{language} Compiler</h3>
      </div>

      {/* Main layout: Sidebar + Editor + Terminal */}
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
              width: isVerticalLayout ? "100%" : "60%",
              height: isVerticalLayout ? "50%" : "100%",
            }}
          >
            {/* Sticky header with buttons */}
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between p-3 rounded-t z-10 sticky top-0`}>
              <h2 className="text-md font-bold">main.{language === "javascript" ? "js" : language === "cpp" ? "cpp" : "py"}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleLayout}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center gap-2"
                >
                  {isVerticalLayout ? <HiOutlineSwitchHorizontal size={20} /> : <HiOutlineSwitchVertical size={20} />}
                </button>
                <button
                  onClick={handleToggleTheme}
                  className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white flex items-center gap-2"
                >
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

            {/* Code Editor Area */}
            <div className="flex-grow overflow-auto min-h-0">
              <CodeEditor code={code} setCode={setCode} theme={theme} />
            </div>
          </div>

          {/* Terminal */}
          <div
            className={`flex flex-col border rounded
              ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}
              transition-all duration-700 ease-in-out
            `}
            style={{
              width: isVerticalLayout ? "100%" : "40%",
              height: isVerticalLayout ? "50%" : "100%",
            }}
          >
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between items-center p-3 rounded-t`}>
              <h2 className="font-semibold">Terminal</h2>
              {/* Optionally add clear/reset buttons here */}
            </div>
            <div className="flex-grow overflow-auto">
              <TerminalComponent ref={terminalRef} wsUrl={wsUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
