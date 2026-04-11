---
name: design-spec-governance
description: Enforce product design specifications with strict, checklist-driven review and implementation guidance across UI, interaction, copywriting, components, and accessibility. Use when the user requests design规范, 设计规范整理, 视觉统一, 交互一致性, UI 审查, or asks to align pages/components with product design standards.
---

# Design Spec Governance

## Quick Start

When a request involves design quality or consistency:

1. Identify scope first: page-level, component-level, or flow-level.
2. Audit current state against the checklist in this skill.
3. Prioritize P0 issues (usability/blocking) before visual polish.
4. Implement minimal, consistent changes aligned with existing tokens/components.
5. Verify with lint + interaction checks before final output.

## Mandatory Workflow

Copy this checklist and execute in order:

```text
Design Governance Progress
- [ ] Step 1: Define scope and target surfaces
- [ ] Step 2: Run strict design checklist audit
- [ ] Step 3: Classify findings (P0/P1/P2)
- [ ] Step 4: Apply consistent fixes
- [ ] Step 5: Validate accessibility and interaction states
- [ ] Step 6: Summarize decisions and residual risks
```

## Step 1: Define Scope

Capture and lock:

- Target: `single component` / `single page` / `cross-page flow`
- Goal: `new spec` / `align existing UI` / `cleanup inconsistencies`
- Constraints: keep existing architecture, avoid broad refactor unless requested

If ambiguous, ask for one preferred baseline screen or file.

## Step 2: Strict Design Checklist Audit

Audit all five domains.

### A) Visual Hierarchy

- [ ] Information appears once per page (no duplicate stats/titles).
- [ ] Primary action is visually dominant and unique.
- [ ] Secondary actions use subdued visual weight.
- [ ] Spacing rhythm is consistent inside the same section.
- [ ] Color usage is restrained (prefer neutral + one accent strategy).
- [ ] Shadows/borders are consistent across sibling cards/blocks.

### B) Interaction Consistency

- [ ] Click targets are clear and predictable.
- [ ] Hover/focus/disabled states exist for interactive controls.
- [ ] Critical actions require confirmation when destructive.
- [ ] Sticky/fixed bars do not cover key content.
- [ ] Empty states provide next action, not only description.
- [ ] Step transitions preserve context (no confusing route jumps).

### C) Copywriting Consistency

- [ ] Labels are short and action-oriented.
- [ ] Same concept uses one term everywhere.
- [ ] No mixed style for same type text (e.g., multiple status vocab sets).
- [ ] Numeric/meta info is concise and comparable.
- [ ] Tooltip/aria text exists when icon-only controls are used.

### D) Component Consistency

- [ ] Reuse existing UI primitives before custom wrappers.
- [ ] Same component role -> same visual variant and size.
- [ ] Similar cards/lists share structure and spacing logic.
- [ ] Form fields have consistent label/help/error placement.
- [ ] Status tags/badges follow a unified palette strategy.

### E) Accessibility Baseline

- [ ] All icon-only buttons include `aria-label`.
- [ ] Decorative icons include `aria-hidden` when appropriate.
- [ ] Keyboard navigation works for major path actions.
- [ ] State is not conveyed by color only.
- [ ] Contrast is acceptable for text and essential UI indicators.

## Step 3: Classify Findings

Use severity:

- `P0` Blocking flow, causes wrong action, or breaks accessibility basics.
- `P1` Noticeable inconsistency reducing clarity/efficiency.
- `P2` Visual polish or maintainability refinement.

Fix order: P0 -> P1 -> P2.

## Step 4: Apply Fixes (Execution Rules)

Follow these rules strictly:

1. Prefer smallest viable change that resolves the issue.
2. Preserve existing product language and component ecosystem.
3. Remove redundant UI before adding new UI.
4. Avoid introducing new color semantics unless required.
5. Keep dense screens readable by progressive disclosure (collapse/expand/hover detail).

## Step 5: Validation

Run validation after edits:

- Lint errors in changed files: none newly introduced.
- Core interaction path still works (entry -> action -> feedback -> next step).
- Focus order and keyboard operation remain usable.
- State and count displays remain synchronized after actions.

## Step 6: Delivery Format

When reporting back:

1. Start with what changed and why.
2. List fixes grouped by P0/P1/P2.
3. Mention any trade-offs or deferred items.
4. Provide optional next-pass improvements only after core fixes.

## Default Standards for This Repository

Apply these defaults unless user asks otherwise:

- Keep copy concise; reduce decorative wording.
- Avoid repeated overview metrics on the same screen.
- Use icon + value patterns for dense metadata when already established.
- Keep list/card styling lightweight and consistent.
- Preserve local-first workflow cues and clear navigation between questionnaire, match, workspace, and writing.

## Trigger Phrases

Use this skill proactively when user mentions:

- “设计规范”
- “视觉统一”
- “交互一致性”
- “UI 审查/整理”
- “信息层级优化”
- “无障碍检查”

