# Interview Content Supplement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Append a consistent `보완내용` section to all 10 interview chapter MDX files without rewriting the existing 20-question bodies.

**Architecture:** Keep the current chapter structure intact and only extend each file at the bottom. Each supplement section uses the same three-part shape: why this chapter needs reinforcement, additional questions worth adding, and a concise summary of the reinforcement goal.

**Tech Stack:** MDX content files, Markdown headings, flat bullet lists

---

### Task 1: Plan the supplement structure

**Files:**
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/js-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/ts-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/react-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/nextjs-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/cs-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/network-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/infra-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/test-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/web-performance-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/project-custom-20.mdx`

**Step 1: Define the shared outline**

- Add `## 보완내용`
- Add `### 왜 보완이 필요한가`
- Add `### 추가하면 좋은 질문`
- Add `### 이 섹션 보완 핵심`

**Step 2: Map each chapter to its supplement content**

- JavaScript: language edge cases and module/runtime details
- TypeScript: recent type-system features and config depth
- React: snapshot, identity, effect boundaries, ref usage
- Next.js: App Router defaults, stale params, security, streaming
- CS: synchronization and performance trade-offs
- Network: protocol evolution, cookie security, browser cache layers
- Infra: deployment strategy, observability, secret management, IaC
- Test: strategy, contract testing, visual/a11y coverage, coverage limits
- Web Performance: INP, rendering path, fonts, long tasks, RUM
- Project: retrospection, failure, measurement, collaboration, ramp-up

### Task 2: Append chapter supplements

**Files:**
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/js-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/ts-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/react-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/nextjs-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/cs-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/network-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/infra-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/test-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/web-performance-20.mdx`
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/project-custom-20.mdx`

**Step 1: Append the new section to each file**

- Preserve existing numbering and body content
- Keep supplement sections readable in MDX with clear heading depth
- Use flat bullets for key points and numbered subheadings for extra questions

**Step 2: Keep scope narrow**

- Do not rewrite the original 20 questions
- Do not alter manifest or reader logic
- Do not change frontmatter unless content structure requires it

### Task 3: Verify content rendering safety

**Files:**
- Modify: `/Users/iscreamarts/Documents/git/read-and-save/public/books/*.mdx`

**Step 1: Run lint**

Run: `npm run lint`

**Step 2: Review for MDX-breaking syntax**

- Confirm headings are balanced
- Confirm lists and code fences remain valid
- Confirm no JSX-only syntax is introduced accidentally
