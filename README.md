# Kairos Study: 3D Adaptive Chrono-Studio & Bayesian Task Engine
*Designed for college and school students who struggle to track their actual effort and time.*

---

## 1. The Core Philosophy
Most student planners treat tasks as a static checklist. But for students:
1. **Effort feels weightless**: A 15-minute quiz submission looks identical to a 3-hour multivariable calculus proof on a flat list.
2. **Estimates are systematically biased**: Students consistently underestimate problem sets and coding labs (by 30–50%) while overestimating reading assignments.
3. **Circadian energy changes throughout the day**: Squeezing a complex algorithm project into a 2:00 PM post-lunch dip leads to frustration, while easy admin tasks waste prime 10:00 AM cognitive alertness.

**Kairos Study** solves this through a physical 3D **"Chrono-Track"** and a pure, decoupled **Bayesian Learning Engine** that learns from completion history to predict true duration and slot tasks into peak cognitive energy windows.

---

## 2. How the Learning Model Works (Demystifying the "Black Box")

### 2.1 Data Captured Per Task Completion
Every time a student ticks a task done or finishes an active focus session, the engine logs:
- `estimatedDuration` vs `actualDuration` (elapsed timer or time-to-complete)
- `durationRatio = actual / estimated` (e.g. `1.40` means 40% longer)
- `timestamp`, `hourOfDay` (0–23), `dayOfWeek` (0–6)
- `category` (e.g. *Mathematics*, *CS / Coding*, *Reading & Essays*, *Admin*)
- `sizeBucket` (*Small* <30m, *Medium* 30–85m, *Large* 90m+)
- `completedOnSchedule` (whether it slipped past target window)

### 2.2 Category Duration Bias (Exponential Moving Average)
For each subject category, the model maintains an exponentially weighted moving average (EMA) of `actual / estimated` duration ratio:
$$\text{EMA}_{\text{new}} = \alpha \cdot \text{Ratio}_{\text{latest}} + (1 - \alpha) \cdot \text{EMA}_{\text{prior}}$$
- If a student estimates a Math problem set at 60 minutes, but historically takes 1.42x, Kairos automatically predicts **85 minutes** and allocates an 85-minute slab on the Chrono-Track.
- Prevents schedule slippage before it happens.

### 2.3 Circadian Hourly Productivity Histogram
The engine constructs a 24-hour histogram weighting completions by size and focus intensity:
- Deep work tasks (60m+ or high cognitive focus) yield 2x points in their respective completion hour.
- Normalizes into a continuous energy score ($0.0$ to $1.0$) categorized into **Peak**, **Optimal**, **Moderate**, and **Low/Slump**.

### 2.4 Allocation & Smart Slotting Algorithm
The timeline allocator is a pure function:
```typescript
allocateDaySchedule(tasks: Task[], profile: LearnedProfile, options?: SchedulerOptions): DaySchedule
```
1. **Prime Morning & Afternoon Slots (9:00 AM – 12:30 PM & 4:00 PM – 6:00 PM)**: Reserved for Deep Work slabs and high-focus subjects (e.g. CS coding labs, Calculus).
2. **Midday & Post-Lunch Buffers (1:00 PM – 2:30 PM)**: Reserved for Quick Sprints (<30m), low-fatigue admin (TA office hours forms, emails, quiz submissions).
3. **Evening Review (7:00 PM – 9:00 PM)**: Review, reading, and flashcard drills.

### 2.5 Cold-Start Behavior (Day 1 with No History)
When a student first opens the app (0–4 completed tasks):
- The model activates the **Student Circadian Baseline**:
  - 9:00 AM – 12:00 PM: Deep work default
  - 1:00 PM – 2:30 PM: Low-fatigue quick sprint default
  - 4:00 PM – 6:30 PM: Secondary focus surge default
- Transparently surfaces a badge: *"Cold Start Active — Complete 5 tasks with the Focus Timer to unlock your personal behavioral model."*
- You can instantly switch between **"Trained Midterm Habits"** (14 historical completions) and **"Fresh Student Cold Start"** using the Demo Switcher button in the top navigation.

---

## 3. The 3D Chrono-Studio Architecture

### Visual Concept: "The Tangible Effort Atelier"
- **3D Kinetic Time-Rail**: Extruded matte obsidian workbench (`#161A23`) with recessed rail track and hourly laser markers.
- **Physical Weight of Tasks**:
  - Small tasks (<30m): Sleek, lightweight chips that snap into small gaps.
  - Large tasks (90m+): Substantial, monolithic ceramic and amber resin slabs with physical bevel depth and subtask micro-indicators.
- **The "Effort Synthesis" Hero Moment**: On first load or on clicking "Re-synthesize", scattered task blocks hover suspended in 3D air, then accelerate along Bézier trajectories and dock with elastic settling physics directly into their AI-optimized slots.
- **Daylight Lighting Rig**: Warm directional sunlight (`#FFF7ED`, intensity 2.4), cool hemisphere fill (`#38BDF8`), and glancing rim highlights (`#818CF8`).
- **Usability Discipline**:
  - Orbit camera via mouse drag / scroll zoom / top-down toggle.
  - Non-blocking: hovering reveals instant transparent AI reasoning HUD.
  - One-click completion with particle celebration.
  - **Calm 2D Mode**: Power-user toggle flattens the 3D scene to an ultra-crisp, high-density linear checklist for low-battery or rapid corridor check-offs.

---

## 4. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Vitest)
npm test

# 3. Start development server
npm run dev

# 4. Production build
npm run build
```
