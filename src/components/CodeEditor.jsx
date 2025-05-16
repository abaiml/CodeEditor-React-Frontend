import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, theme }) {
  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme={theme}
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 18,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}
