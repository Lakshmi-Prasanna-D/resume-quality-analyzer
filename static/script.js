document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('pdf-upload');
    const analyzeBtn = document.getElementById('analyze-btn');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');

    const uploadPanel = document.getElementById('upload-panel');
    const resultsPanel = document.getElementById('results-panel');
    const loadingState = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');

    let currentFile = null;

    // ---------------- FILE HANDLING ----------------

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        currentFile = file;
        fileNameDisplay.textContent = file.name;
        fileInfo.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        analyzeBtn.removeAttribute('disabled');
    }

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        analyzeBtn.setAttribute('disabled', 'true');
    });

    // ---------------- RESET ----------------

    resetBtn.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        uploadPanel.classList.remove('hidden');
        removeFileBtn.click();

        document.getElementById('score-circle-path')
            .setAttribute('stroke-dasharray', `0, 100`);
        document.getElementById('score-text').textContent = "0";
    });

    // ---------------- ANALYZE ----------------

    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        analyzeBtn.classList.add('hidden');
        loadingState.classList.remove('hidden');

        const formData = new FormData();
        formData.append('pdf_file', currentFile);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log("API RESPONSE:", data); // DEBUG

            if (!response.ok || data.error) {
                throw new Error(data.error || "Analysis failed");
            }

            displayResults(data);

        } catch (error) {
            alert("Error: " + error.message);
            loadingState.classList.add('hidden');
            analyzeBtn.classList.remove('hidden');
        }
    });

    // ---------------- DISPLAY RESULTS ----------------

    function displayResults(data) {

        // SAFE ACCESS (NO CRASH)
        const verbs = data.strong_verbs || [];
        const skills = data.skills || [];
        const weak = data.weak_phrases || [];
        const suggestions = data.suggestions || [];
        const score = data.score ?? 0;

        loadingState.classList.add('hidden');
        uploadPanel.classList.add('hidden');
        resultsPanel.classList.remove('hidden');

        // Score
        renderScore(score);

        // Verbs
        renderTags('verbs-container', verbs, 'verb-tag');
        document.getElementById('verbs-count').textContent =
            `${verbs.length} detected`;

        // Skills
        renderTags('skills-container', skills, 'tag');
        document.getElementById('skills-count').textContent =
            `${skills.length} technical keywords`;

        // Weak Phrases
        const weakContainer = document.getElementById('weak-phrases-container');
        const weakEmpty = document.getElementById('weak-phrases-empty');

        if (weak.length > 0) {
            renderTags('weak-phrases-container', weak, 'tag');
            weakEmpty.classList.add('hidden');
            weakContainer.classList.remove('hidden');
        } else {
            weakContainer.innerHTML = '';
            weakContainer.classList.add('hidden');
            weakEmpty.classList.remove('hidden');
        }

        // Suggestions
        const suggestionsList = document.getElementById('suggestions-list');
        suggestionsList.innerHTML = '';

        suggestions.forEach((sug, i) => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.textContent = sug;
            li.style.animationDelay = `${i * 0.15}s`;
            suggestionsList.appendChild(li);
        });
    }

    // ---------------- TAG RENDER ----------------

    function renderTags(containerId, items, className) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!items || items.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'metric-count-text';
            empty.textContent = 'None detected';
            container.appendChild(empty);
            return;
        }

        const uniqueItems = [...new Set(items)];

        uniqueItems.forEach(item => {
            const span = document.createElement('span');
            span.className = `tag ${className}`;
            span.textContent = item;
            container.appendChild(span);
        });
    }

    // ---------------- SCORE ANIMATION ----------------

    function renderScore(score) {
        const circle = document.getElementById('score-circle-path');
        const text = document.getElementById('score-text');
        const msg = document.getElementById('score-message');

        let color = '#ef4444';

        if (score >= 80) {
            color = '#10b981';
            msg.textContent = "Excellent!";
        } else if (score >= 50) {
            color = '#f59e0b';
            msg.textContent = "Needs Improvement";
        } else {
            msg.textContent = "Requires Revision";
        }

        circle.setAttribute('stroke', color);
        text.setAttribute('fill', color);

        let current = 0;
        const step = score / 50;

        const interval = setInterval(() => {
            current += step;

            if (current >= score) {
                current = score;
                clearInterval(interval);
            }

            text.textContent = Math.round(current);
            circle.setAttribute('stroke-dasharray', `${current}, 100`);

        }, 20);
    }

});