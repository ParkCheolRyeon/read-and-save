# Code Block Highlighting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add fixed light-theme syntax highlighting to fenced code blocks in the reader, using a muted VS Code-like palette with `#fafafa` backgrounds.

**Architecture:** Keep the existing `react-markdown` pipeline and replace only the fenced code block renderer. Use a lightweight syntax highlighter with a custom theme so the rest of the MDX reader stays unchanged. Inline code remains simple prose styling; only block code receives token colors and the fixed light surface.

**Tech Stack:** Next.js App Router, React, TypeScript, `react-markdown`, syntax highlighting library, Tailwind CSS

---

### Task 1: Add highlighting dependency

**Files:**
- Modify: `package.json`

**Step 1: Install the syntax highlighting dependency**

Run: `npm install react-syntax-highlighter`

**Step 2: Verify lockfile and dependency entry update**

Run: `git diff -- package.json package-lock.json`
Expected: dependency entry added for the highlighter package

### Task 2: Replace fenced code rendering

**Files:**
- Modify: `src/components/Reader.tsx`

**Step 1: Import the code renderer dependencies**

Add the syntax highlighter component and Prism language theme helpers.

**Step 2: Detect fenced code blocks**

Use the `components.code` override in `ReactMarkdown` to distinguish inline code from fenced blocks by checking the `inline` flag and the `language-xxx` class.

**Step 3: Render fenced code with the custom theme**

Pass a fixed custom theme object with:
- background: `#fafafa`
- low-saturation blue/purple dominant token colors
- no dark-mode switching

**Step 4: Keep inline code lightweight**

Return a plain `<code>` element for inline code so prose styling remains intact.

### Task 3: Tune visuals for readability

**Files:**
- Modify: `src/components/Reader.tsx`

**Step 1: Reduce visual noise**

Keep borders, radius, padding, and font size subtle enough for long interview-prep reading sessions.

**Step 2: Preserve mobile usability**

Ensure block code still scrolls horizontally on small screens without affecting the surrounding article scroll.

### Task 4: Verify

**Files:**
- Verify: `src/components/Reader.tsx`

**Step 1: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 2: Review diff**

Run: `git diff -- src/components/Reader.tsx package.json package-lock.json`
Expected: only highlighting-related changes
