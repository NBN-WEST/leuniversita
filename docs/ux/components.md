# Component Specifications

## 1. Chat Citations (The "Trust Anchor")
**Purpose**: To prove that every statement is backed by the source material, differentiating this tool from generic chatbots.

### Anatomy
*   **Inline Marker**: A small, clickable tag at the end of a sentence or paragraph.
    *   *Format*: `[Pagina X]` or `[Cap. Y, Par. Z]`.
    *   *Style*: Accent color text, subtle background, rounded corners. Distinct from regular links.
*   **Reference Card (Popover/Sidebar)**:
    *   *Trigger*: Hover (Desktop) or Tap (Mobile).
    *   *Content*:
        *   **Source Title**: e.g., "Manuale di Diritto Privato (Torrente)".
        *   **Context**: "Capitolo 4: I Soggetti".
        *   **Excerpt**: The actual raw text from the book that justifies the AI's explanation.
        *   **Relevance Score**: (Optional for MVP) "High relevance".

### Interaction Rules
*   **Always Present**: Every substantive claim MUST have at least one citation.
*   **Non-intrusive**: Should not break reading flow, but be easily accessible.

## 2. Test Player
**Purpose**: To verify knowledge without distraction.

### Anatomy
*   **Progress Header**:
    *   Simple visual bar (e.g., 3/5 questions).
    *   "Esci" button (warns about losing progress).
*   **Question Card**:
    *   Clear, legible serif font for the question text (mimicking academic seriousness).
*   **Answer Options**:
    *   Vertical stack.
    *   Large touch targets (>48px height).
    *   State: Desktop hover effect.
*   **"I Don't Know" Option**:
    *   Visually distinct (e.g., ghost button). Helps diagnostic accuracy.

### States
*   **Default**: Neutral colors.
*   **Selected**: Border highlight.
*   **Evaluation (Post-click)**:
    *   **Correct**: Green border + Check icon + Brief "Why" explanation opacity fade-in.
    *   **Incorrect**: Red border + Cross icon + "Why" explanation + Correct answer highlighted.

## 3. Skill Map (The "Navigator")
**Purpose**: To visualize the mental model of the subject.

### Visualization
*   **Metaphor**: A tree or galaxy of connected nodes.
*   **Nodes**: Represent Topics (e.g., "Capacità Giuridica").
    *   *Size*: Relative to importance/weight in the exam.
*   **Edges**: Represent dependencies (Prerequisite -> Dependent).

### States (Color Coding)
*   **⚪ Locked/Unknown**: Gray. Cannot access yet (if strictly guided) or just unexplored.
*   **🟡 In Progress**: Yellow/Orange ring. Study started but not tested.
*   **🟢 Mastered**: Solid Green. Test passed with >80%.
*   **🔴 Weakness**: Red ring. Test failed or memory decay detected.

### Interaction
*   **Zoom/Pan**: Standard controls.
*   **Click**: Opens a "Node Detail" modal/sheet.
    *   *Title*: Topic Name.
    *   *Status*: "Da studiare" / "Da ripassare".
    *   *Actions*: "Vai alla Lezione", "Fai Quiz".
