"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import { analyzeMatch, MatchResult } from "@/lib/match";
import { extractText } from "@/lib/extract";
import { buildInterviewPrep, InterviewQuestion } from "@/lib/interview";
import { buildBulletSuggestions, BulletSuggestion } from "@/lib/bullets";
import { buildJobBrief } from "@/lib/job-brief";
import { buildApplicationPack } from "@/lib/application-pack";

type SourceKind = "resume" | "job";
type SourceStatus = "idle" | "extracting" | "ready";
type ApplicationStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Closed";
type Application = { role: string; company: string; deadline: string; status: ApplicationStatus; nextAction: string; notes: string; score: number };

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
  const [application, setApplication] = useState<Application | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [interviewPrep, setInterviewPrep] = useState<InterviewQuestion[] | null>(null);
  const [bulletSuggestions, setBulletSuggestions] = useState<BulletSuggestion[] | null>(null);
  const [jobBrief, setJobBrief] = useState<string | null>(null);
  const [applicationPack, setApplicationPack] = useState<string | null>(null);
  const resumeInput = useRef<HTMLInputElement>(null);
  const jobInput = useRef<HTMLInputElement>(null);

  const hasResume = Boolean(resumeText.trim()) && resumeStatus !== "extracting";
  const hasJob = Boolean(jobText.trim()) && jobStatus !== "extracting";
  const canAnalyze = hasResume && hasJob;

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("matchline-application");
      if (saved) setApplication(JSON.parse(saved) as Application);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  async function addFile(kind: SourceKind, file?: File) {
    if (!file) return;
    const setError = kind === "resume" ? setResumeError : setJobError;
    const setFile = kind === "resume" ? setResumeFile : setJobFile;
    const setText = kind === "resume" ? setResumeText : setJobText;
    const setStatus = kind === "resume" ? setResumeStatus : setJobStatus;
    setError("");
    setAnalysis(null);
    setInterviewPrep(null);
    setBulletSuggestions(null);
    setJobBrief(null);

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
    setInterviewPrep(null);
    setBulletSuggestions(null);
    setJobBrief(null);
    setApplicationPack(null);
  }

  function analyze() {
    if (!canAnalyze) return;
    setAnalysis(analyzeMatch(resumeText, jobText));
    setInterviewPrep(null);
    setBulletSuggestions(null);
    setJobBrief(null);
    setApplicationPack(null);
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
          <a className="nav-item" href="#applications"><span className="nav-icon">□</span>Applications <span className="nav-count">{hydrated && application ? "1" : "0"}</span></a>
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
              onTextChange={(value) => { setResumeText(value); setResumeFile(null); setAnalysis(null); setInterviewPrep(null); setBulletSuggestions(null); setJobBrief(null); setApplicationPack(null); }}
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
              onTextChange={(value) => { setJobText(value); setJobFile(null); setAnalysis(null); setInterviewPrep(null); setBulletSuggestions(null); setJobBrief(null); setApplicationPack(null); }}
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

          {analysis && <AnalysisPanel result={analysis} onEdit={() => setAnalysis(null)} onSave={() => setTrackerOpen(true)} onPrep={() => setInterviewPrep(buildInterviewPrep(analysis, resumeText))} onBullets={() => setBulletSuggestions(buildBulletSuggestions(resumeText, analysis))} onBrief={() => setJobBrief(buildJobBrief(analysis))} onPack={() => setApplicationPack(buildApplicationPack(analysis, buildInterviewPrep(analysis, resumeText)))} />}
          {(trackerOpen || (hydrated && application)) && <ApplicationTracker application={application} score={analysis?.score ?? application?.score ?? 0} onSave={(nextApplication) => { setApplication(nextApplication); setTrackerOpen(false); window.localStorage.setItem("matchline-application", JSON.stringify(nextApplication)); }} onClose={() => setTrackerOpen(false)} />}
          {interviewPrep && <InterviewPrepPanel questions={interviewPrep} onClose={() => setInterviewPrep(null)} />}
          {bulletSuggestions && <BulletSuggestionsPanel suggestions={bulletSuggestions} onClose={() => setBulletSuggestions(null)} />}
          {jobBrief && <JobBriefPanel brief={jobBrief} onClose={() => setJobBrief(null)} />}
          {applicationPack && <ApplicationPackPanel pack={applicationPack} onClose={() => setApplicationPack(null)} />}

          <footer className="page-footer"><span>Built for thoughtful applications.</span><span>PDF, DOCX, and TXT up to 10 MB</span></footer>
        </div>
      </section>
    </main>
  );
}

function AnalysisPanel({ result, onEdit, onSave, onPrep, onBullets, onBrief, onPack }: { result: MatchResult; onEdit: () => void; onSave: () => void; onPrep: () => void; onBullets: () => void; onBrief: () => void; onPack: () => void }) {
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
      <div className="analysis-footer"><span><span className="hint-mark">i</span> Suggestions never add experience you did not provide.</span><div className="analysis-actions"><button className="edit-analysis" type="button" onClick={onEdit}>Edit sources</button><button className="prep-button" type="button" onClick={onBullets}>Tailor bullets <span>↗</span></button><button className="prep-button" type="button" onClick={onPrep}>Prep interview <span>↗</span></button><button className="prep-button" type="button" onClick={onBrief}>Job brief <span>↗</span></button><button className="prep-button" type="button" onClick={onPack}>Application pack <span>↗</span></button><button className="track-button" type="button" onClick={onSave}>Save to tracker <span>+</span></button></div></div>
    </section>
  );
}

function JobBriefPanel({ brief, onClose }: { brief: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyBrief() {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadBrief() {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "matchline-job-brief.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="brief-panel" aria-live="polite">
      <div className="brief-header"><div><p className="section-kicker">Application brief</p><h2>Before you hit apply.</h2><p>Keep the key signals in one place so the next move is clear.</p></div><button className="edit-analysis" type="button" onClick={onClose}>Close brief</button></div>
      <div className="brief-body"><pre>{brief}</pre></div>
      <div className="brief-footer"><span><span className="hint-mark">i</span> This brief is a quick internal summary, not a claim about hiring outcomes.</span><div className="brief-actions"><button className="copy-button" type="button" onClick={() => void copyBrief()}>{copied ? "Copied" : "Copy brief"}</button><button className="track-button" type="button" onClick={downloadBrief}>Download <span>↓</span></button></div></div>
    </section>
  );
}

function ApplicationPackPanel({ pack, onClose }: { pack: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyPack() {
    await navigator.clipboard.writeText(pack);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadPack() {
    const blob = new Blob([pack], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "matchline-application-pack.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="brief-panel" aria-live="polite">
      <div className="brief-header"><div><p className="section-kicker">Application pack</p><h2>One condensed summary.</h2><p>Everything in one place before you apply or follow up.</p></div><button className="edit-analysis" type="button" onClick={onClose}>Close pack</button></div>
      <div className="brief-body"><pre>{pack}</pre></div>
      <div className="brief-footer"><span><span className="hint-mark">i</span> This is a working brief for your process, not a promise of an interview.</span><div className="brief-actions"><button className="copy-button" type="button" onClick={() => void copyPack()}>{copied ? "Copied" : "Copy pack"}</button><button className="track-button" type="button" onClick={downloadPack}>Download <span>↓</span></button></div></div>
    </section>
  );
}

function BulletSuggestionsPanel({ suggestions, onClose }: { suggestions: BulletSuggestion[]; onClose: () => void }) {
  const [drafts, setDrafts] = useState(() => suggestions.map((suggestion) => suggestion.suggested));
  const [kept, setKept] = useState<number[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  async function copySuggestion(index: number) {
    await navigator.clipboard.writeText(drafts[index]);
    setCopied(index);
    window.setTimeout(() => setCopied((current) => current === index ? null : current), 1600);
  }

  return (
    <section className="bullet-panel" aria-live="polite">
      <div className="bullet-header"><div><p className="section-kicker">Resume workshop</p><h2>Make the fit easier to see.</h2><p>These edits sharpen wording around skills already found in your resume. Review every line before using it.</p></div><button className="edit-analysis" type="button" onClick={onClose}>Close workshop</button></div>
      {suggestions.length ? <div className="bullet-list">{suggestions.map((suggestion, index) => { const isKept = kept.includes(index); return <article className={`bullet-card ${isKept ? "is-kept" : ""}`} key={suggestion.original}><div className="bullet-card-top"><span>0{index + 1}</span><b>Supports {suggestion.supports}</b></div><div className="bullet-version"><span>Original</span><p>{suggestion.original}</p></div><div className="bullet-arrow">↓</div><label className="bullet-version suggested"><span>Suggested wording</span><textarea value={drafts[index]} onChange={(event) => setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? event.target.value : draft))} rows={3} aria-label={`Suggested wording ${index + 1}`} /></label><div className="bullet-actions"><button type="button" className="practice-button" aria-pressed={isKept} onClick={() => setKept((current) => isKept ? current.filter((keptIndex) => keptIndex !== index) : [...current, index])}>{isKept ? "Kept for review" : "Keep this version"} <span>{isKept ? "✓" : "+"}</span></button><button type="button" className="copy-button" onClick={() => void copySuggestion(index)}>{copied === index ? "Copied" : "Copy draft"}</button></div></article>; })}</div> : <div className="empty-bullets"><strong>No matching bullet lines found yet.</strong><p>Add project or experience bullets to your resume, then run the analysis again.</p></div>}
      <div className="bullet-footer"><span><span className="hint-mark">i</span> Matchline never adds metrics, tools, or accomplishments you did not provide.</span><button className="track-button" type="button" onClick={onClose}>Back to match <span>←</span></button></div>
    </section>
  );
}

function InterviewPrepPanel({ questions, onClose }: { questions: InterviewQuestion[]; onClose: () => void }) {
  return (
    <section className="interview-panel" aria-live="polite">
      <div className="interview-header"><div><p className="section-kicker">Practice room</p><h2>Prepare with your own evidence.</h2><p>Use these prompts to shape honest answers from the experience already in your sources.</p></div><button className="edit-analysis" type="button" onClick={onClose}>Close prep</button></div>
      <div className="question-list">{questions.map((question, index) => <article className="question-card" key={question.question}><div className="question-meta"><span>0{index + 1}</span><b className={`question-category ${question.category.toLowerCase()}`}>{question.category}</b></div><h3>{question.question}</h3><p>{question.prompt}</p><button type="button" className="practice-button">Start answer <span>→</span></button></article>)}</div>
      <div className="interview-footer"><span><span className="hint-mark">i</span> Matchline does not write answers for you. Your voice stays yours.</span><button className="track-button" type="button" onClick={onClose}>Back to match <span>←</span></button></div>
    </section>
  );
}

function ApplicationTracker({ application, score, onSave, onClose }: { application: Application | null; score: number; onSave: (application: Application) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Application>(application ?? { role: "", company: "", deadline: "", status: "Saved", nextAction: "", notes: "", score });
  const [editing, setEditing] = useState(!application);
  const update = (field: keyof Application, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const saveDraft = () => { onSave(draft); setEditing(false); };

  return (
    <section className="tracker-panel" id="applications">
      <div className="tracker-header"><div><p className="section-kicker">Step 03 <span>of 03</span></p><h2>Application tracker</h2><p>Keep the next move visible while the match is still fresh.</p></div>{application && <span className="tracker-score">{application.score}<small>/100 match</small></span>}</div>
      {application && !editing ? (
        <div className="application-card"><div className="application-main"><span className="application-status">{application.status}</span><h3>{application.role || "Untitled role"}</h3><strong>{application.company || "Company not added"}</strong>{application.deadline && <span className="deadline">Deadline {application.deadline}</span>}</div><div className="application-details"><div><span>Next action</span><strong>{application.nextAction || "Add a next action"}</strong></div><div><span>Notes</span><p>{application.notes || "No notes yet."}</p></div></div><button type="button" className="edit-analysis" onClick={() => setEditing(true)}>Edit application</button></div>
      ) : (
        <form className="tracker-form" onSubmit={(event) => { event.preventDefault(); saveDraft(); }}>
          <label>Role<input value={draft.role} onChange={(event) => update("role", event.target.value)} placeholder="Frontend Engineer" required /></label>
          <label>Company<input value={draft.company} onChange={(event) => update("company", event.target.value)} placeholder="Company name" required /></label>
          <label>Deadline<input type="date" value={draft.deadline} onChange={(event) => update("deadline", event.target.value)} /></label>
          <label>Status<select value={draft.status} onChange={(event) => update("status", event.target.value)}>{["Saved", "Applied", "Interview", "Offer", "Closed"].map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="wide-field">Next action<input value={draft.nextAction} onChange={(event) => update("nextAction", event.target.value)} placeholder="Tailor bullets and apply Friday" /></label>
          <label className="wide-field">Notes<textarea value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="What do you want to remember?" rows={3} /></label>
          <div className="tracker-form-actions"><button type="button" className="edit-analysis" onClick={onClose}>Cancel</button><button className="track-button" type="submit">Save application <span>→</span></button></div>
        </form>
      )}
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
