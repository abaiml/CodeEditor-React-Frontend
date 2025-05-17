import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "./components/CodeEditor";
import ProgramSelector from "./components/ProgramSelector";
import "./index.css";
import { HiOutlineSwitchHorizontal, HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FaSave } from "react-icons/fa";

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
}`
  };

  useEffect(() => {
    setCode(templates[language] || "");
  setTerminalOutput("");         
  localStorage.setItem("selectedLanguage", language);
  }, [language]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.focus();
  }, [ws]);

  const handleRun = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }

    setTerminalOutput("");
    setIsRunning(true);

    const socket = new WebSocket("wss://codeeditor-production-0337.up.railway.app/ws"); // Change if hosted elsewhere
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ code, language }));
    };

    socket.onmessage = (event) => {
  try {
    const json = JSON.parse(event.data);

    if (json.type === "done") {
      // Delay `[Process exited]` so output comes first
      setTimeout(() => {
        setTerminalOutput((prev) => prev + "\n\n[Process exited]");
        setIsRunning(false);
      }, 200); 
    } else if (json.output) {
      setTerminalOutput((prev) => prev + json.output);
    }
  } catch {
    setTerminalOutput((prev) => prev + event.data);
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
  };

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
// Modern browsers: show Save As dialog and write file
const handleSave = async () => {
  try {
    const opts = {
      suggestedName: "my_code.txt",
      types: [
        {
          description: "Text Files",
          accept: { "text/plain": [".txt", ".js", ".py", ".cpp"] },
        },
      ],
    };

    const handle = await window.showSaveFilePicker(opts);
    const writable = await handle.createWritable();
    await writable.write(code); // `code` is your text content
    await writable.close();
    alert("File saved successfully.");
  } catch (err) {
    console.error("Save cancelled or failed:", err);
  }
};


  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-screen w-screen p-4 flex flex-col overflow-hidden`}>
      <div className="flex flex-col gap-2 flex-none">
        <h1 className="text-3xl font-bold">Online Code Editor</h1>
        <h3 className="text-lg font-bold">{language} Compiler</h3>
      </div>

      <div className="flex flex-row w-full h-full gap-2 mt-2 overflow-hidden">
        <div className={`w-16 h-full flex flex-col items-center rounded ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}>
          <ProgramSelector selected={language} onSelect={setLanguage} isDarkMode={isDarkMode} />
        </div>

        <div className={`flex ${isVerticalLayout ? "flex-col" : "flex-row"} w-full h-full gap-2 overflow-hidden min-h-0`}>
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
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between p-3 rounded-t z-10 sticky top-0`}>
              <h2 className="text-md font-bold">main.{language === "javascript" ? "js" : language === "cpp" ? "cpp" : "py"}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="ml-2 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-2"
                >
                  <FaSave size={20} /> Save Code
                </button>
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

            <div className="flex-grow overflow-auto min-h-0">
              <CodeEditor code={code} setCode={setCode} theme={theme} />
            </div>
          </div>

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
              className="terminal flex-grow overflow-auto p-3 font-mono text-sm outline-none"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {terminalOutput || "[Output will appear here]"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
