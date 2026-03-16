You are a senior full-stack engineer. Build a complete, production-quality 
AI Workforce Skill Gap Analyzer web application. Follow every instruction 
exactly. Do not skip any section. Generate complete working code, not 
pseudocode or summaries.

═══════════════════════════════════════════
PROJECT OVERVIEW
═══════════════════════════════════════════

Project: AI Workforce Skill Gap Analyzer for Tamil Nadu Automotive & EV Industry
Hackathon Track: SkillTech & Workforce Analytics (TN AUTO Skills Integration)

Problem: HR teams in TN automotive companies (Hyundai, Renault-Nissan, Bosch, 
L&T) manually review resumes to identify EV skill gaps. This is slow and 
inaccurate. Build an AI-powered platform to automate this.

═══════════════════════════════════════════
TECH STACK — USE EXACTLY THESE
═══════════════════════════════════════════

Frontend:
- React 18 (with React Router v6)
- Tailwind CSS for styling
- ApexCharts (react-apexcharts) for ALL charts and graphs
- Axios for API calls
- React Hot Toast for notifications
- React PDF (for export)

Backend:
- Java 17 + Spring Boot 3.x
- Spring Security + JWT Authentication
- Spring Data JPA + Hibernate
- MySQL 8 database
- Apache PDFBox 3.x for PDF text extraction
- Ollama Java HTTP client (plain RestTemplate) for AI calls
- Lombok for boilerplate reduction
- Maven build

AI:
- Ollama running locally at http://localhost:11434
- Model: llama3 (or mistral as fallback)
- Use RestTemplate to call Ollama's /api/generate endpoint
- DO NOT use any paid API keys

Database: MySQL 8

═══════════════════════════════════════════
DATABASE SCHEMA — CREATE ALL THESE TABLES
═══════════════════════════════════════════

Generate complete SQL schema with all constraints, indexes, and foreign keys.

Table 1: companies
- id (BIGINT, PK, AUTO_INCREMENT)
- name (VARCHAR 255, UNIQUE, NOT NULL)
- industry (VARCHAR 100, default 'Automotive')
- created_at (TIMESTAMP)

Table 2: users
- id (BIGINT, PK, AUTO_INCREMENT)
- name (VARCHAR 255, NOT NULL)
- email (VARCHAR 255, UNIQUE, NOT NULL)
- password (VARCHAR 255, NOT NULL) — BCrypt hashed
- role (ENUM: 'HR', 'EMPLOYEE')
- company_id (FK → companies.id)
- created_at (TIMESTAMP)

Table 3: job_roles
- id (BIGINT, PK, AUTO_INCREMENT)
- title (VARCHAR 255, NOT NULL)
- description (TEXT)
- company_id (FK → companies.id)
- created_by (FK → users.id)
- created_at (TIMESTAMP)

Table 4: required_skills
- id (BIGINT, PK, AUTO_INCREMENT)
- skill_name (VARCHAR 255, NOT NULL)
- skill_category (VARCHAR 100) 
  — categories: 'EV Technology', 'Manufacturing', 'Software', 'Safety', 'Management'
- job_role_id (FK → job_roles.id, CASCADE DELETE)

Table 5: employee_skill_analysis
- id (BIGINT, PK, AUTO_INCREMENT)
- employee_id (FK → users.id)
- job_role_id (FK → job_roles.id)
- resume_text (LONGTEXT)
- detected_skills (JSON) — array of detected skill strings
- missing_skills (JSON) — array of missing skill strings
- matched_skills (JSON) — array of matched skill strings
- match_percentage (DOUBLE)
- analyzed_at (TIMESTAMP)

Table 6: courses
- id (BIGINT, PK, AUTO_INCREMENT)
- skill_name (VARCHAR 255, NOT NULL)
- course_name (VARCHAR 255, NOT NULL)
- provider (VARCHAR 100)
  — providers: 'Naan Mudhalvan', 'NSDC', 'Government ITI', 
    'TN AUTO Skills', 'Coursera', 'NPTEL'
- duration_weeks (INT)
- course_url (VARCHAR 500)

Pre-populate the courses table with at least 15 rows covering these skills:
Battery Management Systems, Battery Assembly, EV Diagnostics, CAN Bus Protocol,
Electrical Safety, Robotics Operation, Python Programming, ADAS Systems,
Thermal Management, Industrial IoT, Machine Learning basics, CAD/CAM,
High Voltage Safety, OBD Systems, EV Charging Infrastructure

═══════════════════════════════════════════
SPRING BOOT BACKEND — COMPLETE STRUCTURE
═══════════════════════════════════════════

Generate the FULL code for every file listed below.

1. CONFIGURATION FILES
─────────────────────
application.properties:
- MySQL connection (localhost, db name: skillgap_db)
- JPA/Hibernate settings (ddl-auto: update)
- JWT secret key and expiration (24 hours)
- Ollama base URL: http://localhost:11434
- Max file upload size: 10MB
- CORS allowed origin: http://localhost:3000

SecurityConfig.java:
- Permit /api/auth/** without authentication
- All other endpoints require valid JWT
- Add JwtAuthFilter to filter chain
- Disable CSRF
- Enable CORS

JwtUtil.java:
- generateToken(UserDetails user) method
- validateToken(String token) method
- extractEmail(String token) method
- Token expiry: 24 hours

JwtAuthFilter.java:
- Extract Bearer token from Authorization header
- Validate and set SecurityContext

2. MODELS (Entities)
─────────────────────
Create complete JPA entity classes for:
Company, User, JobRole, RequiredSkill, EmployeeAnalysis, Course

Use Lombok @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor
Use @JsonIgnore on password field in User entity
Add role enum: public enum Role { HR, EMPLOYEE }

3. DTOs (Data Transfer Objects)
────────────────────────────────
Create request and response DTOs for every API:

SignupRequest: name, email, password, role, companyName
LoginRequest: email, password
LoginResponse: token, userId, name, role, companyName

JobRoleRequest: title, description, List<SkillRequest>
SkillRequest: skillName, skillCategory
JobRoleResponse: id, title, description, List<RequiredSkillResponse>, createdAt

AnalysisRequest: jobRoleId (multipart form + file upload)
AnalysisResponse: 
  id, employeeName, jobRoleTitle, detectedSkills[], 
  missingSkills[], matchedSkills[], matchPercentage,
  List<CourseRecommendation>, analyzedAt

CourseRecommendation: skillName, courseName, provider, durationWeeks, courseUrl

WorkforceAnalyticsResponse:
  totalAnalyzed, evReadyCount, needsTrainingCount,
  averageMatchPercentage, evReadinessScore,
  List<SkillGapStat> topSkillGaps,
  List<RoleStat> roleBreakdown,
  List<TrendPoint> weeklyTrend (for skill trend history chart)

SkillGapStat: skillName, gapCount
TrendPoint: weekLabel, averageMatchPercentage, totalAnalyzed

4. REPOSITORIES
───────────────
Create JPA Repository interfaces for all entities.
Add these custom queries:

UserRepository:
- findByEmail(String email)
- findByCompanyId(Long companyId)

JobRoleRepository:
- findByCompanyId(Long companyId)

EmployeeAnalysisRepository:
- findByEmployeeId(Long employeeId)
- findByEmployeeCompanyId(Long companyId)
- findByJobRoleIdAndEmployeeCompanyId(Long roleId, Long companyId)
- Custom JPQL query for weekly trend data grouped by week

CourseRepository:
- findBySkillNameContainingIgnoreCase(String skillName)

5. SERVICES
───────────

AuthService:
- signup(): Check if company exists → create if not → save user with BCrypt password
- login(): Authenticate → generate JWT → return LoginResponse

JobRoleService:
- createRole(): Save role + skills, associate with HR's company
- getRolesForCompany(): Return only roles belonging to user's company
- deleteRole(): Only allow if created by same company

ResumeService (PDFBox):
- extractText(MultipartFile file): Use PDFBox PDDocument to extract all text
- Clean extracted text (remove special chars, normalize whitespace)

OllamaService:
- extractSkills(String resumeText): 
    POST to http://localhost:11434/api/generate
    Model: llama3
    Prompt: (see AI Integration section below)
    Parse response and return List<String> of skills
    Handle streaming: set stream:false in request body
    
- The Ollama request body format:
  {
    "model": "llama3",
    "prompt": "...",
    "stream": false
  }
  Parse response.response field from JSON

SkillGapService:
- analyze(Long employeeId, Long roleId, MultipartFile resume):
    1. Extract text via ResumeService
    2. Extract skills via OllamaService
    3. Get required skills from JobRole
    4. Compare using fuzzy matching algorithm (see Algorithm section)
    5. Calculate matchPercentage
    6. Get course recommendations for missing skills
    7. Save EmployeeAnalysis
    8. Return AnalysisResponse

RecommendationService:
- getRecommendations(List<String> missingSkills):
    For each missing skill, query courses table
    Use LIKE query to match skill name
    Return top 1 course per missing skill

AnalyticsService:
- getWorkforceAnalytics(Long companyId):
    Run aggregation queries
    EV Ready = match_percentage >= 70
    Needs Training = match_percentage < 70
    EV Readiness Score = (evReadyCount / totalAnalyzed) * 100
    Top skill gaps = most frequent missing skills across all analyses
    Weekly trend = group analyses by week, compute avg match %

PdfExportService:
- exportAnalysisReport(Long analysisId): 
    Generate a formatted PDF report using iText or Apache PDFBox
    Include: Employee name, role, match %, detected skills, 
    missing skills, recommended courses
    Return byte[] for download

6. CONTROLLERS
──────────────

AuthController (@RequestMapping("/api/auth")):
- POST /signup → AuthService.signup()
- POST /login → AuthService.login()

JobRoleController (@RequestMapping("/api/roles"), @PreAuthorize HR only):
- POST / → create role
- GET / → list company roles
- GET /{id} → get single role with skills
- DELETE /{id} → delete role

AnalysisController (@RequestMapping("/api/analyze")):
- POST /resume → multipart: file + jobRoleId param (Employee only)
- GET /result/{id} → get analysis by ID
- GET /my-results → list logged-in employee's past analyses
- GET /export/{id} → download PDF report (returns byte[])

AnalyticsController (@RequestMapping("/api/analytics"), HR only):
- GET /workforce → WorkforceAnalyticsResponse for HR's company

═══════════════════════════════════════════
SKILL GAP COMPARISON ALGORITHM
═══════════════════════════════════════════

Do NOT use simple exact string matching. Use this fuzzy matching approach:
```java
public SkillMatchResult compareSkills(
    List<String> detectedSkills, 
    List<RequiredSkill> requiredSkills
) {
    List<String> matched = new ArrayList<>();
    List<String> missing = new ArrayList<>();

    for (RequiredSkill required : requiredSkills) {
        boolean isMatched = false;
        String reqNorm = normalize(required.getSkillName());

        for (String detected : detectedSkills) {
            String detNorm = normalize(detected);

            // Rule 1: Exact match (normalized)
            if (reqNorm.equals(detNorm)) { isMatched = true; break; }

            // Rule 2: Contains match (one contains the other)
            if (reqNorm.contains(detNorm) || detNorm.contains(reqNorm)) {
                isMatched = true; break;
            }

            // Rule 3: Keyword overlap (split into words, check common words)
            Set<String> reqWords = new HashSet<>(Arrays.asList(reqNorm.split(" ")));
            Set<String> detWords = new HashSet<>(Arrays.asList(detNorm.split(" ")));
            reqWords.retainAll(detWords);
            if (reqWords.size() >= 1 && reqWords.stream()
                .noneMatch(w -> w.length() <= 2)) {
                isMatched = true; break;
            }
        }

        if (isMatched) matched.add(required.getSkillName());
        else missing.add(required.getSkillName());
    }

    double matchPct = requiredSkills.isEmpty() ? 0 :
        (matched.size() * 100.0) / requiredSkills.size();

    return new SkillMatchResult(matched, missing, matchPct);
}

private String normalize(String skill) {
    return skill.toLowerCase()
        .replaceAll("[^a-z0-9 ]", "")
        .trim();
}
```

═══════════════════════════════════════════
OLLAMA AI INTEGRATION — EXACT PROMPT
═══════════════════════════════════════════

When calling Ollama for skill extraction, use this exact prompt format:
```
String prompt = """
You are a technical skill extractor for automotive and EV manufacturing resumes.
Extract all technical skills from the resume text below.

Rules:
1. Extract only technical/professional skills (not soft skills like communication)
2. Include tools, technologies, certifications, and domain knowledge
3. Normalize skill names (e.g., "battery mgmt systems" → "Battery Management Systems")
4. Return ONLY a JSON array of strings. No explanation. No markdown.

Example output:
["Battery Management Systems", "CAN Bus Protocol", "Python", "Electrical Safety"]

Resume text:
""" + resumeText + """

Return ONLY the JSON array:
""";
```

Parse the response:
1. Extract the `response` field from Ollama's JSON response
2. Find the JSON array using regex: `\\[.*?\\]` with DOTALL flag
3. Parse with Jackson ObjectMapper into List<String>
4. If parsing fails, return an empty list (do not throw exception)

Use RestTemplate to call Ollama:
- URL: http://localhost:11434/api/generate
- Method: POST
- Body: `{ "model": "llama3", "prompt": "...", "stream": false }`
- Response field to extract: `response`

═══════════════════════════════════════════
REACT FRONTEND — ALL PAGES
═══════════════════════════════════════════

Generate complete React component code for every page.

PROJECT STRUCTURE:
```
src/
├── api/           axios.js (base config + interceptors)
├── context/       AuthContext.jsx (JWT storage, user state)
├── components/    Navbar.jsx, ProtectedRoute.jsx, Spinner.jsx,
│                  SkillBadge.jsx, CourseCard.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── HRDashboard.jsx
│   ├── JobRoleCreate.jsx
│   ├── EmployeeDashboard.jsx
│   ├── AnalyzePage.jsx
│   ├── AnalysisResult.jsx
│   └── WorkforceAnalytics.jsx
└── App.jsx        (React Router setup)
```

DESIGN REQUIREMENTS for ALL pages:
- Dark navy sidebar (#0F172A) with white icons and labels
- Clean white main content area
- Card-based layout with subtle shadows
- Use Tailwind CSS utility classes exclusively
- Green (#10B981) for positive metrics, Red (#EF4444) for gaps
- Smooth page transitions
- Fully responsive

PAGE 1: LoginPage.jsx & SignupPage.jsx
- Split screen: left = dark gradient with product tagline, right = form
- Signup has role toggle (HR / Employee) as a toggle button, not dropdown
- Company name field only visible when HR is selected
- Form validation with inline error messages
- On success: store JWT + user in AuthContext, redirect based on role

PAGE 2: HRDashboard.jsx
- Greeting: "Welcome back, [name] — [company]"
- 4 stat cards: Total Roles Created, Total Employees Analyzed, 
  Avg Match %, EV Readiness Score
- Table listing all job roles with: Title, Skills count, Actions
- Button "Create New Role" → navigates to JobRoleCreate
- Button "View Analytics" → navigates to WorkforceAnalytics

PAGE 3: JobRoleCreate.jsx
- Form: Role Title, Description (textarea)
- Dynamic skill builder:
  - Text input to type a skill name
  - Category dropdown (EV Technology / Manufacturing / Software / Safety / Management)
  - "Add Skill" button → adds to list below
  - Each added skill shows as a removable tag/badge
  - Minimum 3 skills required validation
- Submit button → POST /api/roles
- Show success toast on creation

PAGE 4: EmployeeDashboard.jsx
- Welcome message with employee name
- Dropdown to select target job role from company
- File upload area (drag and drop + click to browse)
  - Only PDF accepted
  - Show file name and size after selection
- "Analyze My Skills" button → POST to /api/analyze/resume
- Loading state: animated progress bar with messages:
  "Extracting resume text..." → "AI analyzing skills..." → "Computing gaps..."
- Past analyses section: list of previous analyses as clickable cards
  showing role name, match %, date

PAGE 5: AnalysisResult.jsx
- Hero section: large circular gauge/radial chart showing match percentage
  Use ApexCharts radialBar chart
  Green if >= 70%, Yellow if 40-69%, Red if < 40%
- Two skill columns side by side:
  Left: "Detected Skills" — green badges
  Right: "Missing Skills" — red badges
- "Matched Skills" row — teal badges
- Recommended Courses section:
  Grid of course cards, each showing:
  skill name (as tag), course name, provider (with color-coded provider badge),
  duration, and "Enroll" button (links to courseUrl)
- "Download Report" button → GET /api/analyze/export/{id} → trigger PDF download

PAGE 6: WorkforceAnalytics.jsx (HR only)
- Top row: 5 KPI cards (Total Analyzed, EV Ready, Needs Training, 
  Avg Match %, EV Readiness Score)
- Chart 1: ApexCharts Bar Chart
  Title: "Top Skill Gaps Across Workforce"
  X-axis: skill names, Y-axis: number of employees with that gap
  Color: coral/red gradient bars
- Chart 2: ApexCharts Donut Chart
  Title: "EV Workforce Readiness"
  Segments: EV Ready (green), Needs Training (red)
  Show percentages on segments
- Chart 3: ApexCharts Area Chart (SKILL TREND HISTORY)
  Title: "Workforce Skill Match Trend (Last 8 Weeks)"
  X-axis: week labels, Y-axis: average match percentage
  Smooth gradient fill under the line
  Show tooltip with exact values on hover
- Chart 4: ApexCharts Horizontal Bar Chart
  Title: "Match % by Job Role"
  One bar per role, sorted descending

═══════════════════════════════════════════
EXTRA FEATURES TO INCLUDE
═══════════════════════════════════════════

Feature 1 — Skill Trend History:
- EmployeeAnalysis table already has analyzed_at timestamp
- AnalyticsService groups analyses by ISO week number
- Returns List<TrendPoint> with weekLabel + avgMatchPercentage + totalAnalyzed
- Frontend renders this as an ApexCharts Area chart on WorkforceAnalytics page
- Also on AnalysisResult page: show employee's personal trend 
  if they have multiple analyses for the same role

Feature 2 — Export Report as PDF:
- Backend: PdfExportService generates a formatted PDF using Apache PDFBox
- PDF content:
  Header: Company logo placeholder + "Skill Gap Analysis Report"
  Section 1: Employee details (name, role, date)
  Section 2: Skill Match Summary (match %, detected skills count, missing skills count)
  Section 3: Detected Skills table
  Section 4: Missing Skills table
  Section 5: Recommended Courses table (skill → course → provider → duration)
  Footer: "Generated by AI Skill Gap Analyzer | TN AUTO Skills Platform"
- Endpoint: GET /api/analyze/export/{id} returns ResponseEntity<byte[]>
  with Content-Type: application/pdf and Content-Disposition: attachment
- Frontend: clicking "Download Report" button triggers fetch → creates Blob → 
  triggers browser download

═══════════════════════════════════════════
SECURITY REQUIREMENTS
═══════════════════════════════════════════

- All passwords BCrypt hashed (strength 12)
- JWT secret: minimum 256-bit key stored in application.properties
- Company isolation: every DB query filters by company_id
- HR cannot see other companies' data
- Employees can only see roles from their own company
- Employees can only view their own analyses
- File upload: validate MIME type (application/pdf only), max 10MB
- Add @PreAuthorize("hasRole('HR')") on HR-only endpoints
- Add company ownership check in service layer before any data access

═══════════════════════════════════════════
OUTPUT INSTRUCTIONS
═══════════════════════════════════════════

Generate output in this order:

1. MySQL schema SQL file (complete, runnable)
2. pom.xml with all dependencies
3. application.properties
4. All Java config files (SecurityConfig, JwtUtil, JwtAuthFilter)
5. All entity classes
6. All DTO classes
7. All repository interfaces
8. All service classes (complete methods, no TODOs)
9. All controller classes
10. package.json for React (with all dependencies)
11. All React files in order: App.jsx, AuthContext, axios config,
    then each page component

For every file:
- Include the full file path as a comment at the top
- Write complete working code
- No placeholder comments like "// implement this"
- No incomplete methods
- Include all imports

After all code, provide:
- Step-by-step local setup instructions
- How to install and start Ollama with llama3 model
- MySQL setup commands
- How to run backend and frontend together