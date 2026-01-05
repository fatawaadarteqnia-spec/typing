import "./global.css";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import JSZip from "jszip";
import * as Babel from "@babel/standalone";
import { Language, getTranslation } from "./i18n";

interface Project {
  name: string;
  html: string;
  css: string;
  scss: string;
  javascript: string;
  typescript: string;
  libraries: string[];
  theme: "light" | "dark";
  fontSize: number;
  fontFamily: string;
  soundType: "mechanical" | "soft" | "classic";
  soundVolume: number;
  timestamp: number;
}

const DEFAULT_PROJECT: Project = {
  name: "Untitled Project",
  html: '<div class="container">\n  <h1>Welcome to Code Editor</h1>\n  <p>Start coding here...</p>\n</div>',
  css: ".container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n}",
  scss: "",
  javascript: 'console.log("Welcome to the Code Editor!");',
  typescript: "",
  libraries: [],
  theme: "dark",
  fontSize: 14,
  fontFamily: "Fira Code",
  soundType: "mechanical",
  soundVolume: 0.3,
  timestamp: Date.now(),
};

const FONT_FAMILIES = ["Fira Code", "JetBrains Mono", "Source Code Pro", "Courier New"];
const EDITOR_THEMES = ["vs-dark", "vs-light", "hc-black"];
const COMMON_LIBRARIES = [
  { name: "React 18", url: "https://unpkg.com/react@18/umd/react.production.min.js" },
  { name: "React DOM", url: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" },
  { name: "Vue 3", url: "https://unpkg.com/vue@3/dist/vue.global.prod.js" },
  { name: "Bootstrap CSS", url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" },
  { name: "Tailwind CSS", url: "https://cdn.tailwindcss.com" },
  { name: "Axios", url: "https://unpkg.com/axios/dist/axios.min.js" },
  { name: "Lodash", url: "https://unpkg.com/lodash@4/lodash.min.js" },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  
  const [htmlCode, setHtmlCode] = useState(DEFAULT_PROJECT.html);
  const [cssCode, setCssCode] = useState(DEFAULT_PROJECT.css);
  const [scssCode, setScssCode] = useState(DEFAULT_PROJECT.scss);
  const [jsCode, setJsCode] = useState(DEFAULT_PROJECT.javascript);
  const [tsCode, setTsCode] = useState(DEFAULT_PROJECT.typescript);
  const [libraries, setLibraries] = useState<string[]>(DEFAULT_PROJECT.libraries);
  const [selectedLibrary, setSelectedLibrary] = useState("");

  const [fontSize, setFontSize] = useState(DEFAULT_PROJECT.fontSize);
  const [fontFamily, setFontFamily] = useState(DEFAULT_PROJECT.fontFamily);
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  const [soundType, setSoundType] = useState<"mechanical" | "soft" | "classic">("mechanical");
  const [soundVolume, setSoundVolume] = useState(DEFAULT_PROJECT.soundVolume);
  const [soundMuted, setSoundMuted] = useState(false);

  const [autoTypingCode, setAutoTypingCode] = useState("");
  const [autoTypingSpeed, setAutoTypingSpeed] = useState(5);
  const [autoTypingTarget, setAutoTypingTarget] = useState<"html" | "css" | "js">("html");
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [autoTypingPaused, setAutoTypingPaused] = useState(false);

  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [showSettings, setShowSettings] = useState(false);
  const [showAutoTyping, setShowAutoTyping] = useState(false);

  const autoTypingIndexRef = useRef(0);
  const autoTypingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeLoadedRef = useRef(false);

  const t = (key: string) => getTranslation(language, key);

  // Compile SCSS to CSS
  const compileSCSS = (scssText: string): string => {
    if (!scssText.trim()) return "";
    try {
      // Simple SCSS support - for full support, use sass.js
      let css = scssText;
      // Basic variable replacement
      css = css.replace(/\$[\w-]+:/g, "/*$&*/");
      return css;
    } catch (e) {
      console.error("SCSS compilation error:", e);
      return scssText;
    }
  };

  // Compile TypeScript to JavaScript
  const compileTypeScript = (tsText: string): string => {
    if (!tsText.trim()) return "";
    try {
      const result = Babel.transform(tsText, {
        presets: ["typescript"],
        filename: "script.ts",
      });
      return result.code;
    } catch (e) {
      console.error("TypeScript compilation error:", e);
      return tsText;
    }
  };

  // Play keyboard sound
  const playKeyboardSound = () => {
    if (soundMuted || !soundVolume) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const volume = soundVolume * 0.3;

      if (soundType === "mechanical") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 150 + Math.random() * 50;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (soundType === "soft") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 300 + Math.random() * 100;
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (soundType === "classic") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (e) {
      console.error("Sound error:", e);
    }
  };

  // Auto-typing logic
  const startAutoTyping = () => {
    if (!autoTypingCode.trim()) {
      toast.error("Please enter code to auto-type");
      return;
    }

    setIsAutoTyping(true);
    setAutoTypingPaused(false);
    autoTypingIndexRef.current = 0;

    const typeNextCharacter = () => {
      if (autoTypingIndexRef.current < autoTypingCode.length) {
        if (!autoTypingPaused) {
          const nextChar = autoTypingCode[autoTypingIndexRef.current];
          playKeyboardSound();

          const currentText = autoTypingCode.substring(0, autoTypingIndexRef.current + 1);

          if (autoTypingTarget === "html") {
            setHtmlCode(currentText);
          } else if (autoTypingTarget === "css") {
            setCssCode(currentText);
          } else if (autoTypingTarget === "js") {
            setJsCode(currentText);
          }

          autoTypingIndexRef.current++;
        }

        autoTypingIntervalRef.current = setTimeout(
          typeNextCharacter,
          1000 / autoTypingSpeed
        );
      } else {
        setIsAutoTyping(false);
        toast.success("Auto-typing completed");
      }
    };

    typeNextCharacter();
  };

  const pauseAutoTyping = () => {
    setAutoTypingPaused(!autoTypingPaused);
  };

  const stopAutoTyping = () => {
    if (autoTypingIntervalRef.current) {
      clearTimeout(autoTypingIntervalRef.current);
    }
    setIsAutoTyping(false);
    setAutoTypingPaused(false);
    autoTypingIndexRef.current = 0;
  };

  // Save project
  const saveProject = () => {
    try {
      const project: Project = {
        name: "Code Editor Project",
        html: htmlCode,
        css: cssCode,
        scss: scssCode,
        javascript: jsCode,
        typescript: tsCode,
        libraries,
        theme,
        fontSize,
        fontFamily,
        soundType,
        soundVolume,
        timestamp: Date.now(),
      };

      const projects = JSON.parse(localStorage.getItem("codeProjects") || "[]");
      projects.push(project);
      localStorage.setItem("codeProjects", JSON.stringify(projects));
      toast.success(t("messages.saved"));
    } catch (e) {
      toast.error(t("messages.error"));
    }
  };

  // Load project
  const loadProject = () => {
    try {
      const projects = JSON.parse(localStorage.getItem("codeProjects") || "[]");
      if (projects.length === 0) {
        toast.error(t("messages.selectProject"));
        return;
      }

      const project = projects[projects.length - 1];
      setHtmlCode(project.html);
      setCssCode(project.css);
      setScssCode(project.scss);
      setJsCode(project.javascript);
      setTsCode(project.typescript);
      setLibraries(project.libraries);
      setTheme(project.theme);
      setFontSize(project.fontSize);
      setFontFamily(project.fontFamily);
      setSoundType(project.soundType);
      setSoundVolume(project.soundVolume);

      toast.success(t("messages.loaded"));
    } catch (e) {
      toast.error(t("messages.error"));
    }
  };

  // Download as ZIP
  const downloadAsZIP = async () => {
    try {
      const zip = new JSZip();
      const compiledCSS = compileSCSS(scssCode) || cssCode;
      const compiledJS = compileTypeScript(tsCode) || jsCode;

      const libraryLinks = libraries
        .map((lib) => {
          if (lib.endsWith(".css")) {
            return `<link rel="stylesheet" href="${lib}">`;
          } else if (lib.endsWith(".js")) {
            return `<script src="${lib}"><\/script>`;
          }
          return "";
        })
        .join("\n  ");

      const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
  ${libraryLinks}
</head>
<body>
${htmlCode}
  <script src="script.js"><\/script>
</body>
</html>`;

      zip.file("index.html", indexHTML);
      zip.file("style.css", compiledCSS);
      zip.file("script.js", compiledJS);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "project.zip";
      link.click();
      URL.revokeObjectURL(url);

      toast.success(t("messages.downloaded"));
    } catch (e) {
      toast.error(t("messages.error"));
    }
  };

  // Handle editor changes
  const handleEditorChange = (value: string | undefined, target: "html" | "css" | "js") => {
    if (value === undefined) return;
    playKeyboardSound();

    if (target === "html") setHtmlCode(value);
    else if (target === "css") setCssCode(value);
    else if (target === "js") setJsCode(value);
  };

  // Add library
  const addLibrary = () => {
    if (selectedLibrary && !libraries.includes(selectedLibrary)) {
      setLibraries([...libraries, selectedLibrary]);
      setSelectedLibrary("");
    }
  };

  // Remove library
  const removeLibrary = (lib: string) => {
    setLibraries(libraries.filter((l) => l !== lib));
  };

  // Initialize iframe once (only on library changes or first load)
  useEffect(() => {
    if (!iframeRef.current) return;

    const libraryScripts = libraries
      .map((lib) => {
        if (lib.endsWith(".css")) {
          return `<link rel="stylesheet" href="${lib}">`;
        } else if (lib.endsWith(".js")) {
          return `<script src="${lib}"><\/script>`;
        }
        return "";
      })
      .join("\n");

    const iframeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${libraryScripts}
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; }
    body { background-color: transparent; overflow: auto; }
  </style>
  <style id="user-styles"></style>
</head>
<body>
  <div id="root"></div>
  <script id="user-script"><\/script>
  <script>
    window.updatePreview = function(data) {
      const styleEl = document.getElementById('user-styles');
      const scriptEl = document.getElementById('user-script');
      const rootEl = document.getElementById('root');

      if (data.css !== undefined) styleEl.textContent = data.css;
      if (data.html !== undefined) rootEl.innerHTML = data.html;
      if (data.js !== undefined) {
        scriptEl.textContent = data.js;
        try { eval(data.js); } catch(e) { console.error(e); }
      }
    };

    window.addEventListener('message', function(e) {
      if (e.data.type === 'update') {
        window.updatePreview(e.data);
      }
    }, false);
  <\/script>
</body>
</html>`;

    const blob = new Blob([iframeHTML], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    iframeLoadedRef.current = true;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [libraries]);

  // Handle iframe load
  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;

    const compiledCSS = compileSCSS(scssCode) || cssCode;
    const compiledJS = compileTypeScript(tsCode) || jsCode;

    // Send initial data once iframe is loaded
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "update",
        css: compiledCSS,
        html: htmlCode,
        js: compiledJS,
      },
      "*"
    );
  };

  // Update preview via postMessage (no reload, no flicker!)
  useEffect(() => {
    if (!iframeRef.current?.contentWindow || !iframeLoadedRef.current) return;

    const compiledCSS = compileSCSS(scssCode) || cssCode;
    const compiledJS = compileTypeScript(tsCode) || jsCode;

    iframeRef.current.contentWindow.postMessage(
      {
        type: "update",
        css: compiledCSS,
        html: htmlCode,
        js: compiledJS,
      },
      "*"
    );
  }, [htmlCode, cssCode, scssCode, jsCode, tsCode]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoTypingIntervalRef.current) {
        clearTimeout(autoTypingIntervalRef.current);
      }
    };
  }, []);

  const editorClass = activeTab === "html" ? "html" : activeTab === "css" ? "css" : "js";
  const currentCode =
    activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
  const currentLanguage =
    activeTab === "html" ? "html" : activeTab === "css" ? "css" : "javascript";

  return (
    <div className={`code-editor-app theme-${theme} layout-${layoutMode}`}>
      <Toaster />
      <Sonner />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <h1 className="app-title">{t("title")}</h1>
        </div>

        <div className="toolbar-group">
          <button onClick={saveProject} title={t("toolbar.save")} className="btn btn-icon">
            💾
          </button>
          <button onClick={loadProject} title={t("toolbar.load")} className="btn btn-icon">
            📂
          </button>
          <button onClick={downloadAsZIP} title={t("toolbar.download")} className="btn btn-icon">
            ⬇️
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            className={`btn btn-icon ${showSettings ? "active" : ""}`}
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowAutoTyping(!showAutoTyping)}
            title="Auto-Typing"
            className={`btn btn-icon ${showAutoTyping ? "active" : ""}`}
          >
            ▶️
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="btn btn-select"
            title="Language"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="btn btn-icon"
            title={t("editor.theme")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-group">
            <label>{t("editor.fontSize")}:</label>
            <input
              type="range"
              min="10"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="slider"
            />
            <span>{fontSize}px</span>
          </div>

          <div className="settings-group">
            <label>{t("editor.fontFamily")}:</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="btn btn-select"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-group">
            <label>{t("sounds.type")}:</label>
            <select
              value={soundType}
              onChange={(e) => setSoundType(e.target.value as any)}
              className="btn btn-select"
            >
              <option value="mechanical">{t("sounds.mechanical")}</option>
              <option value="soft">{t("sounds.soft")}</option>
              <option value="classic">{t("sounds.classic")}</option>
            </select>
          </div>

          <div className="settings-group">
            <label>{t("sounds.volume")}:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundVolume}
              onChange={(e) => setSoundVolume(Number(e.target.value))}
              className="slider"
            />
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className={`btn btn-small ${soundMuted ? "muted" : ""}`}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
          </div>

          <div className="settings-group">
            <label>Layout:</label>
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as any)}
              className="btn btn-select"
            >
              <option value="horizontal">Horizontal (Left/Right)</option>
              <option value="vertical">Vertical (Top/Bottom)</option>
            </select>
          </div>

          <div className="settings-group">
            <h3>{t("preview.libraries")}</h3>
            <div className="library-selector">
              <select
                value={selectedLibrary}
                onChange={(e) => setSelectedLibrary(e.target.value)}
                className="btn btn-select"
              >
                <option value="">Select library...</option>
                {COMMON_LIBRARIES.map((lib) => (
                  <option key={lib.name} value={lib.url}>
                    {lib.name}
                  </option>
                ))}
              </select>
              <button onClick={addLibrary} className="btn btn-small">
                Add
              </button>
            </div>

            {libraries.length > 0 && (
              <div className="library-list">
                {libraries.map((lib) => (
                  <div key={lib} className="library-item">
                    <span className="library-url">{lib}</span>
                    <button
                      onClick={() => removeLibrary(lib)}
                      className="btn btn-tiny"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-Typing Panel */}
      {showAutoTyping && (
        <div className="auto-typing-panel">
          <h3>{t("autoTyping.title")}</h3>
          <div className="auto-typing-content">
            <textarea
              value={autoTypingCode}
              onChange={(e) => setAutoTypingCode(e.target.value)}
              placeholder={t("autoTyping.code")}
              className="auto-typing-textarea"
            />

            <div className="settings-group">
              <label>{t("autoTyping.speed")}:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={autoTypingSpeed}
                onChange={(e) => setAutoTypingSpeed(Number(e.target.value))}
                className="slider"
              />
              <span>{autoTypingSpeed} chars/sec</span>
            </div>

            <div className="settings-group">
              <label>{t("autoTyping.target")}:</label>
              <select
                value={autoTypingTarget}
                onChange={(e) => setAutoTypingTarget(e.target.value as any)}
                className="btn btn-select"
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="js">JavaScript</option>
              </select>
            </div>

            <div className="auto-typing-controls">
              <button
                onClick={startAutoTyping}
                disabled={isAutoTyping}
                className="btn btn-primary"
              >
                {t("autoTyping.play")}
              </button>
              {isAutoTyping && (
                <>
                  <button
                    onClick={pauseAutoTyping}
                    className="btn btn-secondary"
                  >
                    {autoTypingPaused
                      ? t("autoTyping.play")
                      : t("autoTyping.pause")}
                  </button>
                  <button
                    onClick={stopAutoTyping}
                    className="btn btn-danger"
                  >
                    {t("autoTyping.stop")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="editor-container">
        {/* Editor Panel */}
        <div className="editor-panel">
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab("html")}
              className={`tab-button ${activeTab === "html" ? "active" : ""}`}
            >
              {t("tabs.html")}
            </button>
            <button
              onClick={() => setActiveTab("css")}
              className={`tab-button ${activeTab === "css" ? "active" : ""}`}
            >
              {t("tabs.css")}
            </button>
            <button
              onClick={() => setActiveTab("js")}
              className={`tab-button ${activeTab === "js" ? "active" : ""}`}
            >
              {t("tabs.javascript")}
            </button>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage={currentLanguage}
              language={currentLanguage}
              value={currentCode}
              onChange={(value) => handleEditorChange(value, activeTab)}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                fontFamily: fontFamily,
                lineHeight: 1.6,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: theme === "light" ? "vs" : "vs-dark",
              }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2>{t("preview.title")}</h2>
          </div>
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
