export default function OutputConsole({ output, isDarkMode }) {
  return (
    <div
      className={`
        w-full max-h-full overflow-auto
        ${isDarkMode ? "bg-black text-green-400" : "bg-white text-green-800"}
        p-2 font-mono border rounded
      `}
    >
      <pre className="whitespace-pre-wrap">{output}</pre>
    </div>
  );
}
