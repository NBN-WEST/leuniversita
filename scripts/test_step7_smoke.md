# QA Smoke Test - Step 7 (Pilot App)

## Prerequisites
- Local server running (`npm run dev`).
- Test User credentials (`test-user-free` or valid email).

## Checklist

### 1. Authentication
- [ ] Navigate to `/`. Should redirect to `/login`.
- [ ] Enter invalid credentials. Should show error message.
- [ ] Enter valid credentials. Should redirect to `/` (Exam Selector).

### 2. Exam Selection
- [ ] Verify list of exams (`diritto-privato`).
- [ ] Click "Accedi al Corso". Should navigate to `/diagnostic/diritto-privato`.

### 3. Diagnostic Engine
- [ ] **Start**: Click "Inizia Diagnostico". Should show loader then Question 1.
- [ ] **Interaction**: Select MCQ answers. Type Open answer.
- [ ] **Navigation**: "Avanti" button works. Progress bar updates.
- [ ] **Submit**: Click "Concludi Test". Should show loader then redirect to `/results/...`.

### 4. Results & Plan
- [ ] **Skill Map**: Verify Radar Chart is rendered with data.
- [ ] **Plan**: Click "Genera Piano". Should navigate to `/plan/...`.
- [ ] **Timeline**: Verify 7-day timeline is displayed.

### 5. Admin
- [ ] Navigate to `/admin`.
- [ ] Verify KPI counters are > 0.

## Pass Criteria
- No unhandled runtime errors in Console.
- All UX States (Loading, Empty, Error) are handled gracefully (no blank screens).
