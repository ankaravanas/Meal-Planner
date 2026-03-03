# Plan

Create a detailed implementation plan for changes to this project. Plans are thorough documents that capture the full context, rationale, and step-by-step tasks needed to execute a change.

## Variables

request: $ARGUMENTS (describe what you want to plan — new feature, refactoring, bug fix, etc.)

---

## Instructions

- **IMPORTANT:** You are creating a PLAN, not implementing changes. Research thoroughly, think deeply, then output a comprehensive plan document.
- Use your reasoning capabilities to think hard about the request and best approach.
- Research the codebase to understand existing patterns and conventions.
- Create the plan in the `plans/` directory with filename: `YYYY-MM-DD-{descriptive-name}.md`
- Be thorough — this plan will be executed by `/implement` and needs enough detail to execute without ambiguity.

---

## Research Phase

Before writing the plan, investigate:

1. **Read core reference files:**
   - `CLAUDE.md` — project overview

2. **Explore relevant areas:**
   - If modifying pages: check `src/pages/`
   - If modifying components: check `src/components/`
   - If modifying mock data: check `src/mocks/`
   - If modifying API: check `api/`

3. **Understand connections:**
   - How does this change relate to existing code?
   - What files reference or depend on areas being changed?

---

## Plan Format

Write the plan using this structure:

```markdown
# Plan: <descriptive title>

**Created:** <YYYY-MM-DD>
**Status:** Draft
**Request:** <one-line summary of what was requested>

---

## Overview

### What This Plan Accomplishes

<2-3 sentences describing the end result>

### Why This Matters

<Connect this change to the project's goals>

---

## Current State

### Relevant Existing Structure

<List files, folders, or patterns that exist and relate to this change>

### Gaps or Problems Being Addressed

<What's missing or broken that this plan fixes?>

---

## Proposed Changes

### Summary of Changes

<Bulleted list of all changes at a high level>

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `path/to/file.ts` | Description |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `path/to/file.ts` | Description of modifications |

---

## Step-by-Step Tasks

### Step 1: <Task Title>

<Detailed description>

**Actions:**
- <Specific action>
- <Specific action>

**Files affected:**
- `path/to/file.ts`

---

### Step 2: <Task Title>

<Continue with as many steps as needed>

---

## Validation Checklist

- [ ] <Verification step>
- [ ] <Verification step>
- [ ] Build passes: `npm run build`

---

## Success Criteria

1. <Specific, measurable criterion>
2. <Specific, measurable criterion>
```

---

## Report

After creating the plan:

1. Provide a brief summary of what the plan covers
2. List any open questions that need user input
3. Provide the full path to the plan file
4. Remind user to run `/implement plans/YYYY-MM-DD-{name}.md` to execute
