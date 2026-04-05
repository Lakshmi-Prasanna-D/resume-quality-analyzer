# Resume Quality Analyzer

A Flask-based web application to analyze resumes and provide feedback on writing quality, precision, action verbs, and technical skills.

## Proposed Changes

### Configuration and Setup
- Create `requirements.txt` to specify dependencies: Flask, PyPDF2, nltk.

### Backend (Flask App)
#### [NEW] app.py
- Initialize Flask app.
- Provide a `GET /` route to serve the main dashboard.
- Provide a `POST /analyze` route to handle PDF uploads.
- Extract text from PDF using PyPDF2.
- Preprocess text (lowercase, tokenize, stopword removal) using nltk.
- **Analysis Modules:**
  - **Weak Phrases:** Check for "worked on", "helped", "responsible for".
  - **Action Verbs:** Check for strong verbs like "developed", "built", "designed", "optimized", "implemented".
  - **Technical Skills:** Detect keywords like "python", "java", "sql", "react", "flask", etc.
  - **Length Check:** Warn if word count is too short (< 200 words) or too long (> 1000 words).
  - **Precision Score:** Assign a score out of 100 based on presence of strong verbs, technical skills, and absence of weak phrases.
- Generate suggestions based on missing skills, weak phrases found, and verb usage.

### Frontend
#### [NEW] templates/index.html
- Clean, modern file upload UI with drag-and-drop support.
- Results section to display Quality Score, found components, and suggestions.
- Dynamic highlighting of weak phrases.

#### [NEW] static/style.css
- Premium design utilizing modern CSS (variables, grid/flexbox, transitions).
- Vibrant, harmonious color palette, perhaps with a soft dashboard look.
- Interactive hover effects and smooth transitions (micro-animations).

#### [NEW] static/script.js
- Handle file upload async via Fetch API to prevent page reloads.
- Render JSON response into the DOM elegantly.
- Handle error states.

## Verification Plan
### Automated Tests
- Run the Flask application, verify dependencies load properly.

### Manual Verification
- Upload test PDF files with varying qualities (some with weak phrases, some with strong action verbs).
- Verify the UI aesthetics look premium and matches the "wow" aesthetic criteria.
- Check that suggestions are correctly synthesized based on the parsed PDF.
