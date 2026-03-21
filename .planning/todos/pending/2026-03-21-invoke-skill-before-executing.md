---
created: 2026-03-21T06:39:56.006Z
title: Invoke skill before executing
area: general
files:
  - src/components/ValidationSection.jsx
---

## Problem

During the ValidationSection stacking cards debug session, Claude attempted 3+ rapid-fire fixes without:
1. Invoking systematic-debugging skill first
2. Using MCP tools (gsap-master debug_animation_issue, context7 GSAP docs) before guessing
3. Planning the approach before touching code

User had to repeatedly redirect: "told u u were too cocky i told u to plan it", "invoke skill before execute". This violates the session boot mandate and the using-superpowers skill protocol.

Pattern: Claude sees a "simple" fix, skips skill invocation, makes it worse, then has to backtrack. 3 failed fixes before finally using systematic-debugging.

## Solution

Save as feedback memory so future sessions enforce:
- Always invoke relevant skill BEFORE any code change
- For animation bugs: use gsap-master debug + context7 docs first
- For any bug: systematic-debugging skill before proposing fixes
- "Simple" bugs are the most dangerous — they bypass the discipline
