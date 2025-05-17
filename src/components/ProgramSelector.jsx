import React from "react";
import { SiPython, SiJavascript, SiCplusplus } from "react-icons/si";

export default function ProgramSelector({ selected, onSelect, isDarkMode }) {
  const languages = [
    { name: "python", icon: <SiPython />, color: "text-blue-400", title: "Python Compiler" },
    { name: "javascript", icon: <SiJavascript />, color: "text-yellow-400", title: "JavaScript Compiler" },
    { name: "cpp", icon: <SiCplusplus />, color: "text-blue-600", title: "C++ Compiler" },
  ];

  return (
    <div className="flex flex-col items-center p-2 rounded-lg h-full w-16 gap-4">
      {languages.map((lang) => (
        <button
          key={lang.name}
          title={lang.title}                 {/* tooltip text */}
          className={`text-2xl p-2 rounded-lg relative transition-all duration-300 ease-in-out
            ${selected === lang.name ? (isDarkMode ? "bg-gray-900" : "bg-white") : ""}
            ${lang.color}
            ${isDarkMode ? "hover:bg-black" : "hover:bg-white"} hover:border-2 hover:p-3`}
          onClick={() => onSelect(lang.name)}
        >
          {lang.icon}
        </button>
      ))}
    </div>
  );
}
