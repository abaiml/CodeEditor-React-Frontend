import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, theme, language }) {
  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 17,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}
