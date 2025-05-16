export default function OutputConsole({ output, isDarkMode }) {
  return (
    <div className={`h-full w-full ${isDarkMode ? 'bg-black text-green-400' : 'bg-white text-green-800'} p-2 mr-10 font-mono overflow-auto border rounded`}>
      <pre>{output}</pre>
    </div>
  );
}

