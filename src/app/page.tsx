"use client";

import { DragEvent, useRef, useState } from "react";
import { analyzeMatch, MatchResult } from "@/lib/match";
import { extractText } from "@/lib/extract";

type SourceKind = "resume" | "job";
type SourceStatus = "idle" | "extracting" | "ready";

const acceptedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const acceptedLabels = ".pdf, .docx, or .txt";
const maxFileSize = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [jobError, setJobError] = useState("");
  const [resumeStatus, setResumeStatus] = useState<SourceStatus>("idle");
  const [jobStatus, setJobStatus] = useState<SourceStatus>("idle");
  const [dragging, setDragging] = useState<SourceKind | null>(null);
  const [analysis, setAnalysis] = useState<MatchResult | null>(null);
  const resumeInput = useRef<HTMLInputElement>(null);
  const jobInput = useRef<HTMLInputElement>(null);

  const hasResume = Boolean(resumeText.trim()) && resumeStatus !== "extracting";
  const hasJob = Boolean(jobText.trim()) && jobStatus !== "extracting";
  const canAnalyze = hasResume && hasJob;

  async function addFile(kind: SourceKind, file?: File) {
    if (!file) return;
    const setError = kind === "resume" ? setResumeError : setJobError;
    const setFile = kind === "resume" ? setResumeFile : setJobFile;
    const setText = kind === "resume" ? setResumeText : setJobText;
    const setStatus = kind === "resume" ? setResumeStatus : setJobStatus;
    setError("");
    setAnalysis(null);

    if (!acceptedTypes.includes(file.type) || ![".pdf", ".docx", ".txt"].some((extension) => file.name.toLowerCase().endsWith(extension))) {
      setError(`Use a ${acceptedLabels} file.`);
      return;
    }
    if (file.size > maxFileSize) {
      setError("Files must be smaller than 10 MB.");
      return;
    }
    setFile(file);
    setText("");
    setStatus("extracting");
    try {
      const extractedText = (await extractText(file)).trim();
      if (!extractedText) throw new Error("No selectable text was found.");
      setText(extractedText);
      setStatus("ready");
    } catch {
      setStatus("idle");
      setError("We could not extract readable text from this file. Try pasting the text instead.");
    }
  }

  function handleDrop(kind: SourceKind, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(null);
    addFile(kind, event.dataTransfer.files[0]);
  }

  function removeFile(kind: SourceKind) {
    if (kind === "resume") {
      setResumeFile(null);
      setResumeText("");
      setResumeStatus("idle");
      if (resumeInput.current) resumeInput.current.value = "";
    } else {
      setJobFile(null);
      setJobText("");
      setJobStatus("idle");
      if (jobInput.current) jobInput.current.value = "";
    }
    setAnalysis(null);
  }

  function analyze() {
    if (!canAnalyze) return;
    setAnalysis(analyzeMatch(resumeText, jobText));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-hidden="true">M</div>
        <div className="brand-copy">
          <span className="eyebrow">Career studio</span>
          <strong>Matchline</strong>
        </div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <a className="nav-item active" href="#upload"><span className="nav-icon">+</span>New match</a>
          <a className="nav-item" href="#applications"><span className="nav-icon">□</span>Applications <span className="nav-count">0</span></a>
          <a className="nav-item" href="#library"><span className="nav-icon">▤</span>Resume library</a>
        </nav>
        <div className="sidebar-footer">
          <div className="privacy-note"><span className="status-dot" />Local-first workspace</div>
          <p>Your documents stay in your workspace until you choose to analyze them.</p>
        </div>
      </aside>

      <section className="content-area" id="upload">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>New match</strong></div>
          <div className="topbar-actions"><span className="save-state">All changes saved</span><div className="avatar">TC</div></div>
        </header>

        <div className="page-content">
          <div className="intro-row">
            <div>
              <p className="section-kicker">Step 01 <span>of 03</span></p>
              <h1>Bring the right story<br /><em>to the right role.</em></h1>
              <p className="intro-copy">Start with a resume and a job description. Matchline will surface what already fits, what is missing, and where your story can get sharper.</p>
            </div>
            <div className="stepper" aria-label="Progress: upload sources">
              <div className="step current"><span>01</span><b>Upload</b></div>
              <div className="step-line" />
              <div className="step"><span>02</span><b>Match</b></div>
              <div className="step-line" />
              <div className="step"><span>03</span><b>Track</b></div>
            </div>
          </div>

          <div className="source-grid">
            <SourceCard
              kind="resume"
              title="Your resume"
              description="The experience you want to bring forward."
              file={resumeFile}
              text={resumeText}
              error={resumeError}
              dragging={dragging === "resume"}
              inputRef={resumeInput}
              onTextChange={(value) => { setResumeText(value); setResumeFile(null); setAnalysis(null); }}
              onFile={(file) => void addFile("resume", file)}
              onDrop={(event) => handleDrop("resume", event)}
              onDragStart={() => setDragging("resume")}
              onDragEnd={() => setDragging(null)}
              onBrowse={() => resumeInput.current?.click()}
              onRemove={() => removeFile("resume")}
              status={resumeStatus}
            />
            <SourceCard
              kind="job"
              title="The job description"
              description="The role you are ready to make yours."
              file={jobFile}
              text={jobText}
              error={jobError}
              dragging={dragging === "job"}
              inputRef={jobInput}
              onTextChange={(value) => { setJobText(value); setJobFile(null); setAnalysis(null); }}
              onFile={(file) => void addFile("job", file)}
              onDrop={(event) => handleDrop("job", event)}
              onDragStart={() => setDragging("job")}
              onDragEnd={() => setDragging(null)}
              onBrowse={() => jobInput.current?.click()}
              onRemove={() => removeFile("job")}
              status={jobStatus}
            />
          </div>

          <div className="action-row">
            <div className="action-hint"><span className="hint-mark">i</span><span>We will never invent experience or change your original documents.</span></div>
            <button className="primary-button" type="button" disabled={!canAnalyze} onClick={analyze}>Run match analysis <span aria-hidden="true">→</span></button>
          </div>

          {analysis && <AnalysisPanel result={analysis} onEdit={() => setAnalysis(null)} />}

          <footer className="page-footer"><span>Built for thoughtful applications.</span><span>PDF, DOCX, and TXT up to 10 MB</span></footer>
        </div>
      </section>
    </main>
  );
}

function AnalysisPanel({ result, onEdit }: { result: MatchResult; onEdit: () => void }) {
  return (
    <section className="analysis-panel" aria-live="polite">
      <div className="analysis-header">
        <div><p className="section-kicker">Step 02 <span>of 03</span></p><h2>Match breakdown</h2><p className="analysis-note">A directional comparison based on text found in both sources. It is not a hiring prediction.</p></div>
        <div className="score-ring"><strong>{result.score}</strong><span>/ 100</span></div>
      </div>
      <div className="analysis-grid">
        <div className="analysis-column"><div className="analysis-label"><span className="match-dot" />Already showing up <b>{result.matchedSkills.length}</b></div><div className="skill-list">{result.matchedSkills.length ? result.matchedSkills.map((skill) => <span className="skill-chip matched" key={skill}>{skill}<span>✓</span></span>) : <p className="empty-analysis">No shared skills were detected yet.</p>}</div></div>
        <div className="analysis-column"><div className="analysis-label"><span className="gap-dot" />Worth making visible <b>{result.missingSkills.length}</b></div><div className="skill-list">{result.missingSkills.length ? result.missingSkills.map((skill) => <span className="skill-chip missing" key={skill}>{skill}<span>+</span></span>) : <p className="empty-analysis">No obvious gaps detected.</p>}</div></div>
      </div>
      <div className="evidence-grid">
        <div><h3>Evidence from your resume</h3>{result.evidence.length ? result.evidence.map((item) => <p className="evidence-item" key={item}>{item}</p>) : <p className="empty-analysis">Add more detail to your resume to create evidence.</p>}</div>
        <div><h3>Grounded suggestions</h3>{result.suggestions.length ? result.suggestions.map((item) => <p className="evidence-item suggestion" key={item}>{item}</p>) : <p className="empty-analysis">Your sources are aligned. Review the wording before applying.</p>}</div>
      </div>
      <div className="analysis-footer"><span><span className="hint-mark">i</span> Suggestions never add experience you did not provide.</span><button className="edit-analysis" type="button" onClick={onEdit}>Edit sources</button></div>
    </section>
  );
}

type SourceCardProps = {
  kind: SourceKind;
  title: string;
  description: string;
  file: File | null;
  text: string;
  error: string;
  dragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onTextChange: (value: string) => void;
  onFile: (file?: File) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onBrowse: () => void;
  onRemove: () => void;
  status: SourceStatus;
};

function SourceCard({ kind, title, description, file, text, error, dragging, inputRef, onTextChange, onFile, onDrop, onDragStart, onDragEnd, onBrowse, onRemove, status }: SourceCardProps) {
  const hasSource = Boolean(file || text.trim());
  return (
    <article className={`source-card ${kind} ${dragging ? "is-dragging" : ""}`}>
      <div className="card-heading"><div><span className="card-index">{kind === "resume" ? "A" : "B"}</span><h2>{title}</h2></div><span className="optional-label">{hasSource ? "Ready" : "Required"}</span></div>
      <p className="card-description">{description}</p>
      <div className="source-tabs"><span className="tab-active">Upload file</span><span>Paste text</span></div>
      {file ? (
        <div className="file-ready"><div className="file-type">{file.name.split(".").pop()?.toUpperCase()}</div><div className="file-meta"><strong>{file.name}</strong><span>{formatSize(file.size)} · {status === "extracting" ? "Extracting text..." : "Text ready to analyze"}</span></div><button className="remove-button" type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>×</button></div>
      ) : (
        <div className={`drop-zone ${hasSource ? "has-text" : ""}`} onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); onDragStart(); }} onDragLeave={onDragEnd}>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={(event) => onFile(event.target.files?.[0])} />
          <div className="upload-glyph" aria-hidden="true">↑</div>
          <strong>{hasSource ? "Text pasted" : "Drop a file here"}</strong>
          <span>or <button type="button" className="browse-button" onClick={onBrowse}>browse your files</button></span>
          <small>{acceptedLabels} · max 10 MB</small>
        </div>
      )}
      <div className="paste-divider"><span>or paste text instead</span></div>
      <textarea aria-label={`${title} text`} value={text} onChange={(event) => onTextChange(event.target.value)} placeholder={kind === "resume" ? "Paste your resume text here..." : "Paste the full job description here..."} rows={4} />
      <div className="card-bottom"><span className={error ? "error-text" : "field-note"}>{error || (text ? `${text.trim().length} characters` : "Your original text stays editable")}</span>{hasSource && !file && <button type="button" className="clear-text" onClick={() => onTextChange("")}>Clear</button>}</div>
    </article>
  );
}
