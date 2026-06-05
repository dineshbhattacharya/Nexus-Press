"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  ArrowLeft, Bold, Italic, Heading2, Quote, List, ListOrdered, 
  Sparkles, Save, Loader2, Link as LinkIcon, Image as ImageIcon,
  Check, Copy, Plus, FileText
} from "lucide-react";
import styles from "./EditorWorkspace.module.css";

interface EditorWorkspaceProps {
  initialPost?: any;
}

export default function EditorWorkspace({ initialPost }: EditorWorkspaceProps) {
  const isEdit = !!initialPost;
  const router = useRouter();

  // Settings states
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
  const [visibility, setVisibility] = useState(initialPost?.visibility || "FREE");
  const [status, setStatus] = useState(initialPost?.status || "DRAFT");
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [error, setError] = useState("");

  // AI Copilot states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-generate slug from title (only when creating new post)
  useEffect(() => {
    if (!isEdit && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
      setSlug(generatedSlug);
    }
  }, [title, isEdit]);

  // TipTap Editor Initialization
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialPost?.content || "<p>Start writing your article here...</p>",
  });

  // Simulated Autosave effect
  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      setSaveStatus("Draft autosaved at " + new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus(""), 3000);
    }, 60000); // Trigger every 60 seconds

    return () => clearInterval(interval);
  }, [editor]);

  if (!editor) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
      </div>
    );
  }

  // AI Actions Trigger
  const triggerAiAction = async (action: string, customPrompt = "") => {
    setAiLoading(true);
    setAiResult("");
    setError("");

    try {
      const editorText = editor.getText();
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: editorText,
          prompt: customPrompt,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiResult(data.suggestion);
      } else {
        setError(data.error || "AI assist failed.");
      }
    } catch (err) {
      setError("AI Service connection error.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAi = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertAi = () => {
    // Append at the end of current editor content
    editor.commands.insertContent(`<p>${aiResult.replace(/\n/g, "<br>")}</p>`);
    setAiResult("");
  };

  // Save Post to DB
  const handleSave = async () => {
    if (!title || !slug) {
      setError("Title and URL slug are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveStatus("Saving post...");

    const contentHtml = editor.getHTML();
    const endpoint = isEdit ? `/api/writer/posts/${initialPost.id}` : "/api/writer/posts";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content: contentHtml,
          excerpt,
          coverImage: coverImage || null,
          visibility,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus("Saved successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Failed to save post.");
        setSaveStatus("");
      }
    } catch (err) {
      setError("Network error. Failed to save post.");
      setSaveStatus("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Left Area: Editor workspace */}
      <section className={styles.editorPanel}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Type your title..."
          className={styles.titleInput}
        />

        {/* URL Slug Input */}
        <div className={styles.slugRow}>
          <span>URL path: /p/[your-publication]/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={styles.slugInput}
            placeholder="url-slug"
          />
        </div>

        {/* TipTap Rich Text Toolbar */}
        <div className={styles.toolbar}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.toolbarBtnActive : ""}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.toolbarBtnActive : ""}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.toolbarBtnActive : ""}`}
            title="Heading"
          >
            <Heading2 size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("blockquote") ? styles.toolbarBtnActive : ""}`}
            title="Blockquote"
          >
            <Quote size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.toolbarBtnActive : ""}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.toolbarBtnActive : ""}`}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Rich-Text Writing Canvas */}
        <EditorContent editor={editor} className={styles.tiptapEditor} />
      </section>

      {/* Right Area: Post settings and AI assistant */}
      <aside className={styles.sidebarPanel}>
        {/* Settings block */}
        <div>
          <h3 className={styles.sectionTitle}>Publication Options</h3>
          
          <div className={styles.settingsGroup}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Audience Visibility</label>
              <select 
                value={visibility} 
                onChange={(e) => setVisibility(e.target.value)}
                className={styles.select}
              >
                <option value="FREE">Everyone (Free)</option>
                <option value="PREMIUM">Premium Members only</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Publishing Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                <option value="DRAFT">Draft (Unreleased)</option>
                <option value="PUBLISHED">Published (Public)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Summary / Excerpt</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary..."
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={styles.input}
              />
            </div>

            {error && <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>}
            {saveStatus && <p style={{ fontSize: "0.8rem", color: "var(--accent-orange)", fontWeight: 600 }}>{saveStatus}</p>}

            <button 
              onClick={handleSave} 
              className="btn btn-primary styles.btnSave"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isEdit ? "Update Article" : "Publish Article"}</span>
            </button>
          </div>
        </div>

        {/* AI Co-writer block */}
        <div className={styles.aiSection}>
          <h3 className={styles.aiTitle}>
            <Sparkles size={14} /> AI Editorial Co-writer
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            Select an editor action below to draft headlines, summarize contents, or continue writing text blocks.
          </p>

          <div className={styles.aiActionsGrid}>
            <button 
              onClick={() => triggerAiAction("continue")} 
              className={styles.aiBtn}
              disabled={aiLoading}
            >
              <Plus size={12} /> Continue
            </button>
            <button 
              onClick={() => triggerAiAction("rephrase")} 
              className={styles.aiBtn}
              disabled={aiLoading}
            >
              <FileText size={12} /> Rephrase
            </button>
            <button 
              onClick={() => triggerAiAction("headlines")} 
              className={styles.aiBtn}
              disabled={aiLoading}
            >
              <Heading2 size={12} /> Headlines
            </button>
            <button 
              onClick={() => triggerAiAction("summarize")} 
              className={styles.aiBtn}
              disabled={aiLoading}
            >
              <List size={12} /> Summarize
            </button>
          </div>

          <div className={styles.divider} style={{ height: "1px", background: "var(--border-color)", margin: "8px 0" }} />

          {/* Custom prompt search */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className={styles.label} style={{ fontSize: "0.7rem" }}>Custom Prompt</label>
            <div className={styles.copilotPromptWrapper}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., write an intro paragraph..."
                className={styles.promptInput}
                disabled={aiLoading}
              />
              <button 
                onClick={() => triggerAiAction("custom", aiPrompt)} 
                className="btn btn-primary styles.promptBtn"
                disabled={aiLoading || !aiPrompt.trim()}
              >
                Go
              </button>
            </div>
          </div>

          {/* AI Result Box */}
          {aiLoading && (
            <div className={styles.aiResultBox} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
            </div>
          )}

          {aiResult && !aiLoading && (
            <div className={styles.aiResultBox}>
              <p className={styles.aiResultText}>{aiResult}</p>
              <div className={styles.aiResultActions}>
                <button onClick={handleCopyAi} className={`${styles.aiResultBtn} btn btn-secondary`}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <button onClick={handleInsertAi} className={`${styles.aiResultBtn} btn btn-primary`}>
                  Insert
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
