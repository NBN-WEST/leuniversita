# Screen Map & User Journey

## User Object
**Target**: Law Student (Diritto Privato).
**Goal**: Build trust and guide the student from uncertainty to competence using a verified source.
**Core Value**: "Trust-first" - always cite sources, never hallucinate without warning.

## User Journey
1.  **Onboarding (Trust Building)**
    *   *Context*: User arrives with anxiety about the exam.
    *   *Expectation*: Needs to know the tool is reliable.
    *   *Flow*: Landing -> Value Prop (Verified Citations) -> Login -> Subject Selection.
    *   *Outcome*: User feels safe to invest time.

2.  **Diagnosis (Assessment)**
    *   *Context*: User doesn't know what they don't know.
    *   *Flow*: Select Subject -> "Check your level" (Diagnostic Quiz) -> Results.
    *   *Outcome*: Skill Map is populated with initial data.

3.  **Skill Map (Navigation)**
    *   *Context*: User needs a roadmap.
    *   *Flow*: View Map -> Identify specific "Red" or "Gray" gap -> Select Node.
    *   *Outcome*: User selects a specific Topic to study.

4.  **Learning (Explanation & Verification)**
    *   *Context*: User needs clear, cited explanations.
    *   *Flow*: Topic Overview -> Chat/Q&A with Citations -> "Verify Understanding" (Test).
    *   *Outcome*: User gains knowledge and confidence.

5.  **Testing (Validation)**
    *   *Context*: Proving knowledge retention.
    *   *Flow*: Question Stream -> Immediate Feedback -> Result Summary.
    *   *Outcome*: Map updates to Green.

## Screen Map

### 1. Home / Landing (Public)
*   **Hero**: "Preparati a Diritto Privato con fonti certe."
*   **Trust Signals**: "Basato su [Nome Manuale]." "Niente allucinazioni."
*   **CTA**: "Inizia Gratuitamente".

### 2. Dashboard (Authenticated Home)
*   **Header**: User Profile, Streak/Progress.
*   **Main Widget**: "Next Best Action" (e.g., "Continua: I Soggetti del Diritto").
*   **Skill Map Preview**: Mini-graph showing overall progress.
*   **Recent Activity**: Quick resume.

### 3. Skill Map View (The "Navigator")
*   **Interface**: Interactive node graph or structured list (switchable).
*   **Visuals**:
    *   🟢 Mastered (High confidence).
    *   🟡 In Progress.
    *   ⚪ To Do / Unknown.
    *   🔴 Weakness (Failed tests).
*   **Interaction**: Click node -> Popover with "Studia" or "Test".

### 4. Study Interface (The "Tutor")
*   **Layout**: Split screen or focused central column.
*   **Components**:
    *   **Content Stream**: AI explanations, definitions.
    *   **Citations**: *Crucial*. Every claim links to a source page/paragraph. Hovering shows the excerpt.
    *   **Chat Input**: "Fammi un esempio concreto..."
*   **Footer actions**: "Tutto chiaro? Fai il quiz".

### 5. Test Player (The "Drill")
*   **Focus**: Distraction-free.
*   **Elements**:
    *   Question Text.
    *   Options (Single Choice for MVP).
    *   "Non lo so" button (prevents guessing, promotes honesty).
*   **Feedback**: Immediate explanation after choice. Reference back to the manual.

### 6. Results Screen
*   **Summary**: Score (e.g., 4/5).
*   **Impact**: "Hai sbloccato 'Capacità Giuridica'!" (Visual map update animation).
*   **CTA**: "Torna alla Mappa" or "Prossimo Argomento".

## Navigation Structure
*   **Global Nav**: Dashboard, Materie (Map), Profilo.
*   **Contextual Nav**: Breadcrumbs in Study Mode (e.g., Diritto Privato > Soggetti > Persone Fisiche).
