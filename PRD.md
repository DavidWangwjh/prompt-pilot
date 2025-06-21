# 🎨 PromptPilot UI RPD (Rapid Product Development Plan)

Focus: Step-by-step UI implementation using Next.js + Tailwind CSS + TypeScript (App Router)

---

## 🔧 Phase 1: Core Layout & Boilerplate

### ✅ Step 1: Base Layout

* Create `src/app/layout.tsx`
* Add `<Sidebar />` and `<Navbar />` wrappers
* Use Tailwind's flex/grid for responsive layout

### ✅ Step 2: Global Styles

* Configure Tailwind `globals.css`
* Add font family, background, text colors, spacing standards

### ✅ Step 3: Dark Mode Support (Optional)

* Tailwind dark mode toggle via class strategy
* `useTheme()` hook or context wrapper

---

## 🏠 Phase 2: Public Pages

### 🚀 Step 4: Landing Page (`/`)

* Create hero section: logo, tagline, CTA
* Add feature grid with icons/text
* Use Tailwind spacing, font sizes, and animation utils

### 🔐 Step 5: Auth Pages (`/auth/signup`, `/auth/login`)

* Build `LoginForm.tsx` and `SignupForm.tsx`
* Add form input, labels, validation, submit button
* Toggle mode between login/signup
* Tailwind form components, button loading state

---

## 🗂️ Phase 3: Dashboard & Navigation

### 📁 Step 6: Dashboard Page (`/dashboard`)

* Use Google Drive UI as reference
* Sidebar (vertical): links to Vault, Explore, Playground, MCP, Trash
* Topbar (horizontal): search, profile avatar, settings
* Main panel:

  * Card grid for prompts
  * List/grid toggle button
  * "New Prompt" floating action button (FAB)

### 🧱 Step 7: Sidebar & Navbar Components

* `Sidebar.tsx`: active state, icons, hover
* `Navbar.tsx`: profile menu dropdown, responsive support

### 🧩 Step 8: Prompt Cards

* `PromptCard.tsx`: title, tag chips, like/share buttons
* Support list/grid layout
* Add hover animation + click handler

---

## ✍️ Phase 4: Prompt Editor

### 📝 Step 9: Prompt Editor Page (`/prompt/[id]`)

* Editor section: title input, text area for prompt
* Right panel:

  * Version history (with timestamps)
  * Save + rollback button
* Top action bar: optimize button

### 🔀 Step 10: Diff Viewer (Optional)

* `PromptDiffViewer.tsx`: show line-by-line diff
* Tailwind background colors for additions/removals

---

## 🧪 Phase 5: Prompt Playground

### 🧠 Step 11: Playground Page (`/playground`)

* Textarea for prompt input
* Input for optional context
* Dropdown to select model (GPT-4, Claude, etc)
* Run button + loading state
* Show AI response output

---

## 🔎 Phase 6: Explore Page

### 🌍 Step 12: Explore Public Prompts (`/explore`)
s
* Grid of `PromptCard`s
* Filter sidebar:

  * By model
  * By tag
  * By popularity
* Like, remix, share buttons

---

## ⚙️ Phase 7: MCP Config Interface

### ⚙️ Step 13: MCP Page (`/mcp`)

* Display example MCP JSON config
* Toggle view (raw/pretty)
* Copy-to-clipboard button

---

## ✅ Final Phase: Polish & Review

### 🎯 Step 14: Polish UI/UX

* Responsive behavior
* Hover and focus states
* Button animations + form feedback
* Tailwind transitions and spacing cleanup

### 🧪 Step 15: Manual Testing

* Check navigation between pages
* Form submissions and validations
* Empty states (no prompts)

---

Let me know when you want a wireframe or Figma-style UI structure for any of these pages!
