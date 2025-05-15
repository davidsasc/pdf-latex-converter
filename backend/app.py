from flask import Flask, request, jsonify
import fitz
import re
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Cross-Origin für React-Frontend erlauben
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_pdf(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_tasks(text):
    lines = text.splitlines()
    tasks = []
    task_title = ""
    subtasks = []

    task_pattern = re.compile(r"Task\s\d+: (.+?)\s+\((\d+)\s+Points?\)", re.IGNORECASE)
    subtask_pattern = re.compile(r"\([a-d]\)\s+(.+?)\s+\((\d+)\s+P\)")

    for line in lines:
        task_match = task_pattern.search(line)
        if task_match:
            if task_title and subtasks:
                tasks.append((task_title, subtasks))
                subtasks = []
            task_title = task_match.group(1)
        else:
            subtask_match = subtask_pattern.search(line)
            if subtask_match:
                subtasks.append((subtask_match.group(1), subtask_match.group(2)))
    if task_title and subtasks:
        tasks.append((task_title, subtasks))
    return tasks

def generate_latex(tasks):
    latex = ""
    for task_title, subtasks in tasks:
        latex += f"\\begin{{task}}{{{task_title}}}\n"
        for _, points in subtasks:
            latex += f"    \\begin{{subtask}}[points={points}]\n        TODO\n    \\end{{subtask}}\n"
        latex += "\\end{task}\n\\newpage\n"
    return latex

@app.route("/upload", methods=["POST"])
def upload():
    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["pdf"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "File is not a PDF"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    text = extract_text_from_pdf(filepath)
    tasks = parse_tasks(text)
    latex_code = generate_latex(tasks)
    return jsonify({"latex": latex_code})

if __name__ == "__main__":
    app.run(debug=True)
