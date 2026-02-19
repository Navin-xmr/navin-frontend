# Contributing to Navin Frontend

Hi There!
We're super happy you want to contribute to the Navin frontend!
Please read this carefully before you start — it saves everyone time.
We only accept effective, well-structured contributions so our codebase stays healthy and maintainable.

## Table of Contents

- [About the Project](#about-the-project)
- [Getting Started](#getting-started)
- [Picking an Issue](#picking-an-issue)
- [Making Contributions](#making-contributions)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Resolving Conflicts](#resolving-conflicts)
- [Code Standards](#code-standards)
- [Getting Help](#getting-help)

---

## About the Project

**Navin** is a blockchain-powered logistics platform that improves supply chain visibility for enterprises through tokenized shipments, immutable milestone tracking, and automated settlements.
By creating a zero-trust interface between logistics providers and their clients, Navin aims to ensure both parties access identical real-time data — removing information asymmetry and enabling seamless, dispute-free operations.

This repository is the **frontend** of the Navin platform — a React application that provides real-time dashboards for logistics companies and customers to track shipment status, visualize on-chain milestones, and monitor automated payment settlements.

- **Framework**: React (Vite)
- **Language**: JavaScript / TypeScript
- **Related Repos**:
  - Smart Contracts: [navin-contracts](https://github.com/Navin-xmr/navin-contracts)
  - Backend API: [navin-backend](https://github.com/Navin-xmr/navin-backend)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

### Fork & Clone

1. **Fork** this repository on GitHub.

2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/navin-frontend.git
   cd navin-frontend
   ```

3. **(Optional)** Add the upstream remote to sync future updates: 
    You can sync through the github website though

   ```bash
   git remote add upstream https://github.com/Navin-xmr/navin-frontend.git
   ```

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

---

## Picking an Issue

All open tasks for this repository are listed in [ISSUES](https://github.com/Navin-xmr/navin-frontend/issues).

Each issue has:
- The points lets you know how complex it is: 
- A **description** of what needs to be built
- **Acceptance criteria** — your PR should meet all of them before it will be merged

**Start with an issue with like 100 points or 150 points if it's your first contribution.**

Once you've decided on an issue, leave a comment and wait to be assigned before starting the work.

---

## Making Contributions

### Step 1: Create a Branch

Never commit directly to your fork's `main`. Always work on a dedicated branch.
Sync your fork first (via GitHub website or by pulling upstream), then:

```bash
git checkout main
git pull origin main    # or: git pull upstream main

git checkout -b issue#<number>
```

**Examples:**
```
issue#9
issue#24
issue#51
```

### Step 2: Make Your Changes

- Follow the existing code patterns and component structure in the project
- Keep each branch/PR focused on **one issue** only — don't bundle unrelated changes
- Add or update tests if the issue involves logic
- Make sure the app builds and runs without errors before pushing

### Step 3: Run Checks Locally

Before pushing, always run these:

```bash
# Check formatting
npm run lint

# Run any existing tests
npm run test

# Verify the build works
npm run build
```

Fix any errors or warnings before pushing.

---

## Commit Guidelines

Write clear commit messages so the history tells a story.

### Format

```
type: short description
```

### Commit Types we prefer

| Type | When to use |
|------|-------------|
| `feat` | New component or page |
| `fix` | Bug fix |
| `style` | Visual-only change (CSS, layout), no logic change |
| `refactor` | Code restructuring with no functional change |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Config, dependencies, maintenance |

### Examples

```bash
git commit -m "feat: build shipment tracking timeline component"
git commit -m "fix: resolve mobile layout overflow on dashboard sidebar"
git commit -m "style: update status badge colors to match design system"
git commit -m "docs: add JSDoc comments to API service functions"
```

---

## Pull Request Process

### Step 1: Push Your Branch

```bash
git push origin issue#<number>
```

### Step 2: Open a Pull Request

1. Go to your fork on GitHub and click **"Compare & pull request"**
2. Fill out the PR description:
   - **Title**: What you built (e.g., `feat: build notification dropdown`)
   - **Issue**: Reference the issue (e.g., `Closes #43`)
   - **Description**: Brief summary of your approach
   - **Testing**: How you verified it works — list what you tested
   - **Screenshots**: **Required for all frontend PRs** — attach a screenshot or screen recording of the UI you built. PRs without visuals will not be reviewed.
   - **Design file** (design issues only): Link to your design document in `docs/designs/`. 

### Review Process

1. **CI checks** run automatically on every push (lint + build must pass)
2. **Maintainer review** typically within 1–2 days
3. **Address feedback** — push fixes to the same branch of your PR
4. Once approved and CI passes, a maintainer will merge your PR

---

## Resolving Conflicts

Conflicts happen when other PRs are merged while you're working on your branch. 
Here's how to fix them: (This is just one way to do it, you can use the website to update your fork if that is the method you prefer)

```bash
# Update your local main
git checkout main
git pull upstream main    # or: git pull origin main

# Rebase your branch on top of updated main
git checkout issue#<number>
git rebase main
```

> [!IMPORTANT]
> **Do not blindly accept both sides of a conflict.** Read each conflict carefully, understand what changed on both sides, pick the correct resolution (or merge intentionally), then verify the build and tests still pass before pushing.

After resolving:

```bash
npm run lint
npm run build

git push origin issue#<number>
```
 You can also push your fix of the conflicts this way if you did the rebase method

```bash
# Push (force-with-lease is safe after a rebase)
git push origin issue#<number> --force-with-lease
```

PRs with unresolved or carelessly merged conflicts **will not be merged**.
We can't have any PR lead to issues on our repository so other contributors do not complain.
We want contributors focused on building, not cleaning up others' mistakes please.

---

## Code Standards

### General

- Write clean, readable code — favor clarity over cleverness
- Use consistent naming: `PascalCase` for components, `camelCase` for variables and functions
- Keep components small and focused — one responsibility per component
- Avoid inline styles; use CSS classes or CSS modules

### Component Structure

```
src/
├── components/         # Reusable shared components
├── pages/              # Page-level components (one per route)
├── services/           # API service functions
├── hooks/              # Custom React hooks
├── context/            # React context providers
```

### PR Size

Keep PRs focused. A PR for a single issue should not touch unrelated files.

---

## Getting Help

- **Issues & Tasks**: See [ISSUES](https://github.com/Navin-xmr/navin-frontend/issues) for all open work
- **Security**: Email [navinxmr@gmail.com](mailto:navinxmr@gmail.com) — do **not** open a public issue for vulnerabilities right now 
- **Community**: Join our Telegram group and ask directly for assistance if necessary — [Navin Community Chat](https://t.me/+3svwFsQME6k1YjI0)

---

Thank you for contributing to Navin Frontend!
Together, we're building a transparent and secure logistics platform on Stellar.
