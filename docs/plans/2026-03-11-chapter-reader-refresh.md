# Chapter Reader Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the sample book catalog with 10 interview chapters while preserving the existing post-login UI and fixing the mobile reader scroll jump.

**Architecture:** Keep the current `public/books` content pipeline, upgrade the manifest to explicit metadata, and reuse the existing list/reader screens. Fix the scroll issue in `Reader` by removing mandatory snap behavior that conflicts with long-form reading.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, markdown files in `public/books`

---

### Task 1: Document the approved direction

**Files:**
- Create: `docs/plans/2026-03-11-chapter-reader-refresh-design.md`
- Create: `docs/plans/2026-03-11-chapter-reader-refresh.md`

**Step 1: Save the design summary**

Write the approved approach, data shape, and verification scope.

**Step 2: Save the implementation plan**

Record the ordered tasks for data replacement and reader fix.

### Task 2: Replace catalog data with 10 chapter entries

**Files:**
- Delete: `public/books/01-sample.md`
- Delete: `public/books/02-another.md`
- Modify: `public/books/manifest.json`
- Create: `public/books/*.md`

**Step 1: Remove old sample content**

Delete the placeholder markdown files so the shipped catalog only contains chapter content.

**Step 2: Create chapter markdown files**

Add one markdown file per chapter using the supplied interview content.

**Step 3: Update manifest metadata**

Store `id`, `filename`, and exact display `title` for all 10 chapters.

### Task 3: Update catalog loading logic

**Files:**
- Modify: `src/lib/books.ts`

**Step 1: Teach `fetchBookList` to read explicit manifest metadata**

Return the exact title from the manifest instead of deriving it from filenames.

**Step 2: Keep reader content loading unchanged**

Continue resolving chapter content from `/books/${slug}.md`.

### Task 4: Fix reader scroll behavior on mobile

**Files:**
- Modify: `src/components/Reader.tsx`

**Step 1: Remove mandatory snap behavior from the scroll container**

Let long-form content scroll naturally on mobile.

**Step 2: Simplify article sizing**

Avoid snap-related min-height constraints that can pull the viewport unexpectedly.

### Task 5: Update supporting docs if needed

**Files:**
- Modify: `README.md`

**Step 1: Align content instructions with the new manifest format**

Keep repo documentation consistent with the shipped data structure.

### Task 6: Verify the changes

**Files:**
- Verify: `src/lib/books.ts`
- Verify: `src/components/Reader.tsx`

**Step 1: Run lint**

Run: `npm run lint`

**Step 2: Run local app checks**

Run the app locally, log in, and confirm all 10 chapters render and the reader no longer jumps on mobile.

**Step 3: Report verification limits**

If a runtime command requiring approval is not run, report that clearly.
