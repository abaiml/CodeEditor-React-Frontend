import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import ProgramSelector from "./components/ProgramSelector";
import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import { HiOutlineSwitchHorizontal, HiOutlineSwitchVertical } from "react-icons/hi";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("vs-dark");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState(() => {
  return localStorage.getItem("selectedLanguage") || "python";
});

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

  const handleRun = async () => {
    setIsRunning(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/run", {
        code: code,
        language: language,
      });
      setOutput(response.data.output);
    } catch (err) {
      setOutput("Error: " + err.message);
    } finally {
      setIsRunning(false);
    }
};

  const handleClear = () => {
    setOutput("");
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleLayout = () => {
    setIsVerticalLayout((prev) => !prev);
  };

  useEffect(() => {
    setCode(templates[language] || "");
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} h-screen w-screen p-4 flex flex-col overflow-hidden`}>

      {/* Header Section */}
      <div className="flex flex-col gap-2 flex-none">
        <h1 className="text-3xl font-bold">Online Code Editor</h1>
        <h3 className="text-lg font-bold">{language} Compiler</h3>
      </div>

      {/* Main layout with Sidebar + Editor/Output */}
      <div className="flex flex-row w-full h-full gap-2 mt-2 overflow-hidden ">
        
        {/* Sidebar */}
        <div className={`w-16 h-full flex flex-col items-center rounded ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}>
          <ProgramSelector selected={language} onSelect={setLanguage} isDarkMode={isDarkMode} />
        </div>

        {/* Editor + Output */}
        <div className={`flex ${isVerticalLayout ? "flex-col" : "flex-row"} w-full h-full gap-2 overflow-hidden `}>
          
          {/* Code Editor */}
          <div
            className={`
              ${isVerticalLayout ? "w-full flex-[2]" : "w-2/3 h-full"}
              flex flex-col border rounded overflow-hidden
              ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}
              transition-all duration-700 ease-in-out
            `}
          >
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between p-3 rounded-t`}>
              
              <h2 className="text-md font-bold">main.{language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'py'}</h2>
             
              <div className="flex gap-2">
                {/* Toggle Layout Button */}
                <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 flex items-center gap-2" onClick={handleToggleLayout}>
                  {isVerticalLayout ? <HiOutlineSwitchHorizontal size={20} /> : <HiOutlineSwitchVertical size={20} />}
                </button>

                {/* Toggle Theme Button */}
                <button className="px-3 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-all duration-300 text-white flex items-center gap-2" onClick={handleToggleTheme}>
                  {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                </button>
                <button className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  onClick={handleRun}
                  disabled={isRunning}>
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
            <div className="flex-grow overflow-auto">
              <CodeEditor code={code} setCode={setCode} theme={theme} />
            </div>
          </div>

          {/* Output Console */}
          <div
            className={`
              ${isVerticalLayout ? "w-full flex-[1]" : "w-1/3 h-full"}
              flex flex-col border rounded
              ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"}
              transition-all duration-700 ease-in-out
            `}
          >
            <div className={`${isDarkMode ? "bg-gray-800" : "bg-gray-200"} flex justify-between items-center p-3 rounded-t`}>
              <h2 className="font-semibold">Output</h2>
              <button className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleClear}>Clear</button>
            </div>
            <div className="flex-grow ">
              <OutputConsole output={output} isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
