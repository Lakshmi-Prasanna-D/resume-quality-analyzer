import re
from flask import Flask, request, jsonify, render_template
from PyPDF2 import PdfReader
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

app = Flask(__name__)

# ---------------- DATA ----------------

WEAK_PHRASES = [
    "worked on", "helped", "responsible for",
    "assisted with", "participated in", "duties included"
]

STRONG_VERBS = [
    "developed", "built", "designed", "optimized",
    "implemented", "created", "led", "managed",
    "engineered", "orchestrated", "architected"
]

TECHNICAL_SKILLS = [
    "python", "java", "sql", "react", "flask", "django",
    "javascript", "c++", "aws", "docker", "kubernetes",
    "html", "css", "git", "node.js", "typescript",
    "linux", "azure", "angular", "vue", "machine learning"
]

# ---------------- PDF ----------------

def extract_text(pdf):
    try:
        reader = PdfReader(pdf)
        return "\n".join([p.extract_text() or "" for p in reader.pages])
    except:
        return None

# ---------------- ANALYSIS ----------------

def analyze(text):
    text_lower = text.lower()

    # Tokenization
    try:
        words = word_tokenize(text_lower)
    except:
        nltk.download('punkt')
        nltk.download('stopwords')
        words = word_tokenize(text_lower)

    words = [w for w in words if w.isalnum()]
    word_count = len(words)

    # Sections
    sections = {
        "projects": "projects" in text_lower,
        "skills": "skills" in text_lower,
        "education": "education" in text_lower
    }

    # Weak / Strong
    weak = [p for p in WEAK_PHRASES if p in text_lower]
    verbs = [v for v in STRONG_VERBS if v in text_lower]

    # Skills
    skills = []
    for s in TECHNICAL_SKILLS:
        if re.search(r'\b' + re.escape(s) + r'\b', text_lower):
            skills.append(s)

    # Bullet Analysis
    bullets = re.findall(r'[\-\*\•]\s+(.+)', text)
    good_bullets = 0
    for b in bullets:
        if any(v in b.lower() for v in STRONG_VERBS):
            good_bullets += 1

    bullet_score = good_bullets / len(bullets) if bullets else 0

    # Measurable Achievements
    has_numbers = any(c.isdigit() for c in text)

    # ---------------- SCORE ----------------

    score = 50

    skills_score = len(skills) * 3
    verbs_score = len(verbs) * 5
    weak_penalty = len(weak) * 6
    bullet_penalty = 5 if bullet_score < 0.5 else 0
    achievement_bonus = 10 if has_numbers else 0
    section_bonus = sum(sections.values()) * 3

    score += skills_score + verbs_score + achievement_bonus + section_bonus
    score -= weak_penalty + bullet_penalty

    score = max(0, min(100, score))

    # ---------------- LEVEL ----------------

    if score >= 80:
        level = "Strong Resume"
    elif score >= 60:
        level = "Moderate Resume"
    else:
        level = "Needs Improvement"

    # ---------------- CONFIDENCE ----------------

    confidence = "High" if word_count > 300 else "Low"

    # ---------------- SUGGESTIONS ----------------

    suggestions = []

    if weak:
        suggestions.append(f"Replace '{weak[0]}' with strong verbs like 'developed'.")

    if len(verbs) < 3:
        suggestions.append("Use more action verbs (developed, built, optimized).")

    if len(skills) < 5:
        suggestions.append("Add more technical skills relevant to your role.")

    if not has_numbers:
        suggestions.append("Include measurable achievements (e.g., improved performance by 20%).")

    if bullet_score < 0.5:
        suggestions.append("Start bullet points with strong action verbs.")

    if not sections["projects"]:
        suggestions.append("Add a Projects section.")

    if not sections["skills"]:
        suggestions.append("Add a Skills section.")

    # Context-aware suggestion
    if "python" not in text_lower:
        suggestions.append("Consider adding Python if relevant.")

    # ---------------- RETURN ----------------

    return {
        "score": score,
        "level": level,
        "confidence": confidence,
        "word_count": word_count,
        "skills": skills,
        "strong_verbs": verbs,
        "weak_phrases": weak,
        "sections": sections,
        "bullet_strength": round(bullet_score * 100, 2),
        "score_breakdown": {
            "skills": skills_score,
            "verbs": verbs_score,
            "weak_penalty": -weak_penalty,
            "bullet_penalty": -bullet_penalty,
            "achievement_bonus": achievement_bonus,
            "section_bonus": section_bonus
        },
        "suggestions": suggestions
    }

# ---------------- ROUTES ----------------

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/analyze', methods=['POST'])
def analyze_route():
    file = request.files.get('pdf_file')

    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF allowed"}), 400

    text = extract_text(file)

    if not text:
        return jsonify({"error": "Could not read PDF"}), 400

    result = analyze(text)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)