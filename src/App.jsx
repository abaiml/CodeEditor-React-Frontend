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

  function applyBackspaces(text) {
  const out = [];
  for (const ch of text) {
    if (ch === "\b" || ch === "\x7f" || ch === "\x08") {
        out.pop();
    } else {
      out.push(ch);
    }
  }
  return out.join("");
}
  
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

  const handleRun = () => {
  if (isRunning) return;

  setTerminalOutput("");
  setIsRunning(true);

  // Close any previous socket cleanly
  if (ws) {
    ws.close();
    setWs(null);
  }

  const token = encodeURIComponent(import.meta.env.VITE_WS_TOKEN);
  const WS_URL = `${import.meta.env.VITE_WS_URL}?t=${token}`;
  const socket = new WebSocket(WS_URL);
  setWs(socket);

  // Clear output buffer for incremental updates
  let outputBuffer = "";

  socket.onopen = () => {
    socket.send(JSON.stringify({ code, language }));
    terminalRef.current?.focus();
  };

  socket.onmessage = (event) => {
    try {
      const json = JSON.parse(event.data);

      if (json.type === "done") {
        // Process finished, append exit marker
        setTerminalOutput((prev) => prev + "\n\n[Process exited]");
        setIsRunning(false);
        socket.close();
        setWs(null);
      } else if (json.output) {
        const clean = json.output.replace(/\[Process exited\]/g, "");
        const filtered = applyBackspaces(clean);
        outputBuffer += filtered;
        setTerminalOutput((prev) => prev + filtered);
      }
    } catch {
        const cleanOutput = event.data.replace(/\[Process exited\]/g, "");
        const filtered = applyBackspaces(cleanOutput);
        setTerminalOutput((prev) => prev + filtered);
    }
  };

  socket.onerror = (error) => {
    setIsRunning(false);
    setTerminalOutput((prev) => prev + `\nWebSocket error: ${error.message}`);
    socket.close();
    setWs(null);
  };

  socket.onclose = () => {
    if (isRunning) {
      // Unexpected close during execution
      setTerminalOutput((prev) => {
        if (prev.includes("[Process exited]")) return prev;
        return prev + "\n\n[Process exited]";
      });
      setIsRunning(false);
      setWs(null);
    }
  };
};




  const handleStop = () => {
    if (!isRunning) return;
    if (ws) {
      ws.close();
      setWs(null);
      setIsRunning(false);
      setTerminalOutput((prev) => prev + "\n\n[Execution stopped]");
    }
  };

  const handleTerminalInput = (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    e.preventDefault();
  
    if (e.key === "Backspace") {
      ws.send("\x7f");
    } else if (e.key === "Enter") {
      ws.send("\n");
    } else if (e.key.length === 1) {
      ws.send(e.key);
    }
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

  const handleSave = async () => {
    try {
      const extension = language === "python" ? ".py" : language === "javascript" ? ".js" : ".cpp";
      const opts = {
        suggestedName: `my_code${extension}`,
        types: [
          {
            description: "Code Files",
            accept: {
              "text/plain": [".py", ".js", ".cpp"],
            },
          },
        ],
      };
      const handle = await window.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(code);
      await writable.close();
      alert("File saved successfully.");
    } catch (err) {
      console.error("Save cancelled or failed:", err);
    }
  };

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-screen w-screen p-4 flex flex-col overflow-hidden`}>
      <div className="flex justify-between items-start flex-none mb-2">
        <div>
          <h1 className="text-3xl font-bold">Online Code Editor</h1>
          <h3 className="text-lg font-bold capitalize">{language} Compiler</h3>
        </div>
        <div className="text-sm max-w-xs text-right">
          <div className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {language === "python" && (
              <>
                <p><strong>Tip:</strong> Use <code>input()</code> to take user input.</p>
                <a
                  href="https://www.w3schools.com/python/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-500"
                >
                  Learn Python Basics →
                </a>
              </>
            )}
            {language === "javascript" && (
              <>
                <p><strong>Tip:</strong> Use <code>let</code> and <code>const</code> to declare variables instead of <code>var</code> for better scope control.</p>
                <a
                  href="https://www.w3schools.com/js/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-500"
                >
                  Learn JavaScript Basics →
                </a>
              </>
            )}
            {language === "cpp" && (
              <>
                <p><strong>Tip:</strong> Use <code>cin</code> to read input in C++.</p>
                <a
                  href="https://www.w3schools.com/cpp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-500"
                >
                  Learn C++ Basics →
                </a>
              </>
            )}
          </div>
        </div>
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
                  title="Save"
                >
                  <FaSave size={20} />
                </button>
                <button
                  onClick={handleToggleLayout}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center gap-2"
                  title="Toggle Layout"
                >
                  {isVerticalLayout ? <HiOutlineSwitchHorizontal size={20} /> : <HiOutlineSwitchVertical size={20} />}
                </button>
                <button
                  onClick={handleToggleTheme}
                  className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white flex items-center gap-2"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                </button>
                <button
                  className={`px-3 py-2 rounded ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                  onClick={isRunning ? handleStop : handleRun}
                  title={isRunning ? "Stop" : "Run"}
                >
                  {isRunning ? "Stop Code" : "Run Code"}
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
                title="Clear Terminal"
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
