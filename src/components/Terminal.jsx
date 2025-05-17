import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";

export default function TerminalComponent({ wsUrl }) {
  const terminalRef = useRef(null);
  const xterm = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    xterm.current = new Terminal({
      cols: 80,
      rows: 24,
      cursorBlink: true,
    });

    xterm.current.open(terminalRef.current);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      xterm.current.write(event.data);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Send keystrokes from terminal to backend
    xterm.current.onData((data) => {
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(data);
      }
    });

    return () => {
      ws.current.close();
      xterm.current.dispose();
    };
  }, [wsUrl]);

  return <div ref={terminalRef} style={{ width: "100%", height: "400px" }} />;
}
