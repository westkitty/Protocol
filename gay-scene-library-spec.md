# Gay Scene Library + Negotiation Templates
## Comprehensive Product Specification & Generation Prompt

**Version:** 1.0  
**Purpose:** Full product architecture, content plan, interaction design, visual system, monetization strategy, and generation instructions for building a practical, privacy-respecting Gay Scene Library focused on structured BDSM/kink scenes for adult gay men.

---

## Core Concept

Build a high-quality digital toolkit of pre-built scene plans, negotiation templates, checklists, and modular protocols specifically designed for gay male kink dynamics. The product treats scenes as designed experiences with clear containers, roles, beats, materials, negotiation points, risk awareness, and aftercare.

This is not generic erotica or a dating app. It is a professional-grade planning tool that makes play safer, clearer, and hotter through structure.

**Primary audiences:**
- Newer players who need scaffolding
- Experienced players who are tired of reinventing checklists
- Couples and dynamics wanting repeatable, high-quality scene frameworks
- Privacy-conscious users who prefer offline or local-first tools

**Core principles (non-negotiable):**
- Every template is a starting point for conversation, not a contract or mandatory script
- Hard limits remain hard; safewords always work
- Explicit consent, ongoing check-ins, and aftercare are built in
- Risk awareness is practical, not theoretical
- Language is gay-male specific and culturally fluent (leather, pup, service, ownership, etc.)
- Privacy-first by default

---

## Architecture

### Data Model

Every scene or template is a structured object with the following fields:

```yaml
id: string
title: string
category: string
subcategory: string
duration_min: number
duration_max: number
intensity: light | medium | heavy | progressive
roles: [string]
experience_level: beginner | intermediate | advanced
materials: [string]
prep_time_min: number
risk_notes: [string]
negotiation:
  checklist: [object]
  scripts: [object]
pre_scene:
  steps: [string]
  headspace: string
beats: [object]  # sequential or timed
variations: [object]
aftercare: [object]
debrief: [object]
tags: [string]
```

### Delivery Layers (implement in order)

1. **Digital Product Packs** (launch first)
   - High-quality PDF packs
   - Fillable PDF forms
   - Markdown source files
   - One-page reference cards

2. **Web Application**
   - Searchable library
   - Interactive checklist editor
   - Partner sharing (temporary link or PDF)
   - Personal library of customized scenes
   - Export to PDF / Markdown

3. **Local-First Mode**
   - Full library downloadable
   - Works offline
   - Compatible with Obsidian / plain Markdown

4. **Mobile Companion** (later)
   - Discreet mode
   - Quick reference
   - Timers with check-in prompts

### Technical Requirements

- Content stored as Markdown + YAML frontmatter
- No storage of user-filled negotiation data by default
- Shareable links expire (default 72 hours)
- Local export is first-class
- Strong privacy policy and clear disclaimers
- Mobile-first responsive design
- Print-optimized views

**Suggested stack:**
- Frontend: Next.js + Tailwind
- Content: Markdown/YAML
- Auth: Magic link or optional
- Payments: Stripe
- Hosting: Vercel or similar
- Alternative: Fully static export for local use

---

## Scene Library Structure

### Categories & Scene List (Launch Target: 35+ scenes)

#### 1. Negotiation & Foundation
- Full Scene Negotiation Framework
- Gay-Specific Yes/No/Maybe List
- Pickup / First Meeting Negotiation Script
- Established Dynamic Quick Renegotiation
- Soft Limit Exploration Scripts
- Health & Risk Disclosure Template
- Marks & Visibility Agreement
- Aftercare Menu Builder

#### 2. Pup Play & Training
- Pup Training Level 1 (Headspace & Basic Commands)
- Pup Training Level 2 (Gear & Structure)
- Pup Training Level 3 (Extended / Public Elements)
- Handler Inspection & Gear-Up Ritual
- Pup Weekend Protocol
- Good Pup / Bad Pup Structured Scene
- Temporary Handler Transfer Ceremony
- Pup Service Tasks Module

#### 3. Ownership, Collar & Protocol
- Collar Acceptance Ceremony
- Ownership Transfer (Temporary or Ongoing)
- High-Protocol Evening / Dinner
- Rules & Protocol Installation Weekend
- Temporary Ownership / Loan Scene
- Collar Care & Presentation Ritual

#### 4. Leather & Gear
- Full Leather Inspection Ritual
- Boot Blacking Service Scene
- Leather Care & Maintenance Service
- New Gear Breaking-In Scene
- Leather Bar / Event Prep Protocol
- Gear Presentation Ritual

#### 5. Service & Structured Time
- Service Weekend Structure
- Domestic Service Day
- Sexual Service Protocol (with clear boundaries)
- No Free Time Structured Day
- Morning & Evening Protocol Pack

#### 6. Denial, Control & Challenge
- Multi-Day Orgasm Denial Challenge
- Edging & Ruin Structured Scene
- Permission Required Weekend
- Chastity Integration Checklist
- Denial Check-In Templates

#### 7. Impact, Bondage & Sensation
- Structured Impact Scene (Warm-up → Escalation → Cool-down)
- Leather + Impact Combination
- Restraint + Service Hybrid
- Medical / Clinical Inspection Scene
- Sensation Play Progression

#### 8. Supporting Modules
- Aftercare Menus (Physical, Emotional, Practical)
- Immediate Debrief Template
- Next-Day Check-In Template
- Multi-Partner Add-On Negotiation
- Risk Matrix Quick Reference
- Safeword & Non-Verbal Signal Card

---

## Sample Scene Templates

### Sample 1: Full Scene Negotiation Framework

**Duration:** 15–45 minutes  
**Intensity:** N/A (pre-scene)

**Negotiation Checklist**

**Container**
- [ ] Date, time, and location confirmed
- [ ] Expected end time
- [ ] Who is present (and who is not)
- [ ] Privacy / interruption plan

**Activities In**
- [ ] Explicitly listed and agreed
- [ ] Order / intensity curve discussed

**Activities Out / Limits**
- [ ] Hard limits named
- [ ] Soft limits and conditions noted
- [ ] Any “maybe” items have conditions

**Health & Body**
- [ ] Injuries, joints, back, breathing issues
- [ ] Medications or substances
- [ ] Allergies (latex, etc.)
- [ ] STI status / barriers discussed if relevant
- [ ] Recent alcohol or drug use

**Marks & Visibility**
- [ ] Marks acceptable? Where?
- [ ] Duration of marks
- [ ] Clothing coverage plan

**Power & Language**
- [ ] Titles and forms of address
- [ ] Degradation / praise preferences
- [ ] Check-in frequency

**Safewords & Signals**
- [ ] Red / Yellow / Green (or custom)
- [ ] Non-verbal signal
- [ ] Both partners can call stop

**Aftercare**
- [ ] Immediate needs
- [ ] Next-day check-in plan
- [ ] Food, water, quiet, contact preferences

**Scripts**
- Opening: “Before we start, I want to walk through a few things so we’re both clear.”
- Soft limit: “I have a soft limit on X. Here’s what would make it a yes tonight…”
- Marks: “Are marks okay, and if so where and for how long?”

---

### Sample 2: Handler Inspection & Gear-Up Ritual

**Category:** Pup Play  
**Duration:** 30–60 minutes  
**Intensity:** Medium  
**Roles:** Handler, Pup

**Materials**
- Collar, leash, hood or ears (optional)
- Tail, harness, boots
- Inspection surface or chair
- Lube / cleaning supplies if relevant

**Negotiation Points**
- Gear items included / excluded
- Inspection depth (visual, touch, full)
- Commands used
- Public vs private elements
- Headspace expectations

**Beats**
1. **Presentation** — Pup presents in designated position. Handler walks circle.
2. **Gear Check** — Each piece examined, named, and fitted. Handler comments on condition and fit.
3. **Command Sequence** — Basic commands (sit, stay, present, down) with correction or praise.
4. **Leash & Collar** — Final attachment. Explicit acknowledgment of temporary or ongoing ownership for the scene.
5. **Transition** — Clear signal that play begins or ends.

**Aftercare**
- Collar removal ritual (if temporary)
- Water, quiet time, verbal check-in
- Option for continued contact or space

---

### Sample 3: Service Weekend Structure

**Duration:** 24–48 hours  
**Intensity:** Medium–Heavy (scalable)

**Structure**
- **Friday evening:** Arrival, negotiation refresh, collar or protocol activation
- **Saturday:** Service blocks (morning, afternoon, evening) with defined free time
- **Sunday:** De-escalation, debrief, return to baseline

**Service Blocks Include**
- Domestic tasks
- Leather care
- Sexual service (optional and pre-negotiated)
- Protocol observance

**Check-ins**
- Morning check-in
- Midday adjustment window
- Evening review

**Exit Criteria**
- Explicit end time
- Aftercare window
- Next-day message required

---

## Interaction Design

### Primary User Flows

1. **Browse & Customize**
   - Filter by category, duration, intensity, materials, experience
   - Open scene → edit fields (names, limits, intensity) → generate PDF or interactive checklist

2. **Partner Workflow**
   - Person A fills negotiation section
   - Generates temporary share link or PDF
   - Person B reviews, adds notes, and confirms
   - System highlights: mutual yes, yes/maybe, any no

3. **In-Scene Support**
   - One-page printable reference card
   - Optional timer with suggested check-in points
   - Discreet mode (neutral naming)

4. **Personal Library**
   - Save customized versions
   - Private notes after use
   - Progressive paths (e.g., Pup Training Track)

### Key Features
- Interactive checklists with satisfying completion state
- One-click PDF export (print-optimized)
- Temporary share links that expire
- Offline Markdown export
- Search across all content
- Intensity and risk indicators visible at a glance

---

## Design System

### Aesthetic Direction
Dark, masculine, clean, and professional. High-quality leather journal meets modern utility tool. Avoid cheap porn aesthetics and generic wellness app styling.

### Color Palette
- Background: #0F0F0F / #1A1A1A
- Surface: #242424
- Text primary: #F5F5F0
- Text secondary: #A0A0A0
- Accent: #8B4513 (leather brown) or deep burgundy #6B2D3C
- Success / Green: muted #4A7C59
- Warning / Yellow: muted #C4A35A
- Stop / Red: #8B3A3A

### Typography
- Headings: Strong, slightly condensed sans or quality serif
- Body: Highly readable sans (Inter or similar)
- Checklist items: Clear, generous line height

### UX Principles
- Mobile-first
- One primary action per screen
- High contrast, large tap targets
- Print views that look intentional on paper
- Discreet mode available
- Minimal animation; purposeful feedback only

### Key Screens
- Library (filterable grid or list)
- Scene detail with collapsible sections
- Checklist editor
- Partner comparison view
- Personal library
- Settings / privacy / export

---

## Monetization

### Phase 1: Digital Packs (Validate)
- Individual themed packs: $19–39
- Full library: $99–149
- Free lead magnet: Negotiation Framework + 1 sample scene
- Platforms: Gumroad, Payhip, or own site

### Phase 2: Application
- Free tier: Negotiation tools + 5 scenes
- Paid: $9/month or $99–129 lifetime
- Lifetime preferred by privacy-conscious buyers

### Additional Revenue
- Premium advanced packs
- Affiliate gear links (clearly disclosed)
- Occasional workshops
- Optional custom scene builder (templated)

### Positioning
Price as a professional tool. Emphasize that clear structure makes play safer and more intense. Target both beginners needing scaffolding and experienced players wanting efficiency.

---

## Safety, Consent & Legal Framing

**Mandatory elements in every scene and on every export:**

- “This is a planning tool, not a contract or legal document.”
- “Hard limits must be respected. Safewords always stop the scene.”
- “Ongoing consent can be withdrawn at any time.”
- “This does not replace education, communication, STI testing, or risk awareness.”
- Specific risk notes where relevant (breath play, impact zones, blood, substances, etc.)

**Risk awareness modules to include:**
- Impact zones to avoid
- Breath play warnings
- Substance use guidelines
- Marks and visibility considerations
- Multi-partner additional negotiation points

---

## Content Generation Instructions

When generating scenes or expanding the library:

1. Use clear, direct, gay-male specific language.
2. Structure every scene with negotiation points, beats, materials, and aftercare.
3. Include at least one lighter and one heavier variation.
4. Flag any elevated risk activities with practical notes.
5. Keep scripts natural and adaptable, not rigid.
6. Always include check-in points during longer scenes.
7. Make checklists actionable and specific.
8. Prioritize practicality over fantasy prose.

**Tone:** Professional, direct, respectful of the culture, never condescending or clinical in a sterile way.

---

## Expansion Modules (Future)

- Modular Protocol Builder (drag-and-drop elements)
- Risk & Intensity Calculator
- Scene Journal (private post-scene notes)
- Progressive Training Tracks
- Event-specific packs (IML, leather contests, pup events)
- Group scene negotiation add-ons
- Integration with local tools or Obsidian

---

## Deliverables Checklist for Build

- [ ] Full scene library content (35+ scenes) in structured Markdown
- [ ] Negotiation framework templates
- [ ] Interactive checklist components
- [ ] PDF export system
- [ ] Partner sharing flow
- [ ] Personal library
- [ ] Privacy-first architecture
- [ ] Design system implementation
- [ ] Free lead magnet version
- [ ] Paid tier gating
- [ ] Clear safety disclaimers on all outputs

---

## Prompt for Generation (Use this when building)

You are building the Gay Scene Library + Negotiation Templates product. Follow the architecture, data model, design system, safety principles, and content standards in this specification exactly. Prioritize practical usability, privacy, clear consent structures, and high-quality, gay-male specific scene frameworks. Generate content that is structured, modular, and immediately usable. Never produce material that removes or weakens consent, safewords, or risk awareness.

Generate the next scene, component, or feature according to the categories and standards above. Maintain consistency in tone, structure, and safety framing across all outputs.
