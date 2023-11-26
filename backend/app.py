from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from PyPDF2 import PdfReader
import re
import openai
from prettier import pretty
from summarization import summarizate

# Configure OpenAI with your API Key

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:heslo@localhost/hackathon'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class PdfText(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    filename = db.Column(db.String(255))
    # Define the relationship here with cascade delete behavior
    summaries = db.relationship('PdfSummary', backref='pdf_text', lazy=True, cascade="all, delete-orphan")

    def __init__(self, text, filename):
        self.text = text
        self.filename = filename

class PdfSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    summary_text = db.Column(db.Text)
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)
    # No need for an additional relationship definition here

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    uploaded_file = request.files.get('file')
    if uploaded_file and uploaded_file.filename.endswith('.pdf'):
        pdf_reader = PdfReader(uploaded_file.stream)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() or ''

        text = re.sub(r'\s+', ' ', text).strip()
        new_pdf_text = PdfText(text, uploaded_file.filename)
        db.session.add(new_pdf_text)
        db.session.commit()

        return jsonify({"message": "PDF uploaded and text extracted."}), 201
    else:
        return jsonify({"error": "Invalid file format."}), 400

@app.route('/pdf_texts', methods=['GET'])
def get_pdf_texts():
    pdf_texts = PdfText.query.all()
    output = [{'id': text.id, 'text': text.text, 'filename': text.filename} for text in pdf_texts]
    return jsonify(output)

@app.route('/delete_pdf_text/<int:pdf_text_id>', methods=['DELETE'])
def delete_pdf_text(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    if pdf_text:
        db.session.delete(pdf_text)
        db.session.commit()
        return jsonify({"message": "PDF Text and its summary deleted."}), 200
    else:
        return jsonify({"message": "PDF Text not found"}), 404


@app.route('/get_summary_db/<int:pdf_text_id>', methods=['GET'])
def get_summary_db(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    if pdf_text:
        summaries = PdfSummary.query.filter_by(pdf_text_id=pdf_text_id).all()
        output = [{'id': summary.id, 'summary_text': summary.summary_text} for summary in summaries]
        return jsonify(output), 200
    else:
        return jsonify({"message": "PDF Text not found"}), 404


@app.route('/summarize_pdf', methods=['POST'])
def summarize_pdf():
    data = request.json
    pdf_text_id = data.get('pdf_text_id')

    if not pdf_text_id:
        return jsonify({"error": "PDF text ID is required"}), 400

    pdf_text_record = PdfText.query.get(pdf_text_id)
    if not pdf_text_record:
        return jsonify({"error": "PDF text not found"}), 404

    try:

        summarized_text = summarizate(pdf_text_record.text)

        new_summary = PdfSummary(summary_text=summarized_text, pdf_text_id=pdf_text_id)
        db.session.add(new_summary)
        db.session.commit()
        pretty_text = pretty(summarized_text)
        return jsonify({"summary": pretty_text})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during summarization"}), 500

@app.route('/get_input_data/<int:pdf_text_id>', methods=['GET'])
def input_data(pdf_text_id):
    pdf_text = PdfText.query.get(pdf_text_id)
    if pdf_text:
        summaries = PdfSummary.query.filter_by(pdf_text_id=pdf_text_id).all()
        output = [{'id': summary.id, 'summary_text': summary.summary_text} for summary in summaries]
    else:
        return jsonify({"message": "PDF Text not found"}), 404

    # Function to extract scores from summary text
    def extract_score(summary_text, pattern):
        match = re.search(pattern, summary_text)
        if match:
            score = match.group(1)
            return float(score.split('/')[0]) / float(score.split('/')[1])
        else:
            return None

    # Extract scores for each parameter
    scores = {
        'ScopeOfWork': None,
        'RequiredTechnologyStack': None,
        'PricingModel': None,
        'ServiceLevelAgreements': None,
        'SelectionCriteria': None,
        'Timelines': None,
        'ContactDetails': None,
        'PenaltyClauses': None,
        'RequiredOfferType': None
    }

    for item in output:
        summary_text = item['summary_text']
        for key in scores:
            if scores[key] is None:  # Only extract if not already found
                pattern = f"{key}:.*?Score: (\\d+/\\d+)"
                scores[key] = extract_score(summary_text, pattern)

    # Return the scores as a dictionary
    return jsonify(scores)


def init_db():
    db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
