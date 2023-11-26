import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from PyPDF2 import PdfReader
import re
import openai
import sklearn
import pandas as pd
#from prettier import pretty
from summarization import summarizate

# Configure OpenAI with your API Key
from joblib import load
# Load your trained model


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:heslo@localhost/hackathon'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
model = load('model/my_model.joblib')
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

    # Check if the PDF already has a summary
    existing_summary = PdfSummary.query.filter_by(pdf_text_id=pdf_text_id).first()
    if existing_summary:
        return jsonify({"summary": existing_summary.summary_text, "already_summarized": True})

    try:
        summarized_text = summarizate(pdf_text_record.text)
        new_summary = PdfSummary(summary_text=summarized_text, pdf_text_id=pdf_text_id)
        db.session.add(new_summary)
        db.session.commit()
        return jsonify({"summary": summarized_text, "already_summarized": False})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during summarization"}), 500
    
@app.route('/pdf_summary/<int:pdf_text_id>', methods=['GET'])
def get_pdf_summary(pdf_text_id):
    pdf_summary = PdfSummary.query.filter_by(pdf_text_id=pdf_text_id).first()
    if pdf_summary:
        return jsonify({"summary": pdf_summary.summary_text, "already_summarized": True})
    else:
        return jsonify({"summary": "", "already_summarized": False})
    
@app.route('/get_input_data/<int:pdf_text_id>', methods=['GET'])
def input_data(pdf_text_id):
    pdf_summary = PdfSummary.query.filter_by(pdf_text_id=pdf_text_id).first()
    if pdf_summary:
        summary_text = pdf_summary.summary_text
        
        # Define patterns for each parameter
    patterns = {
        'ProblemStatement': r"Problem Statement:.*?Score: (\d+)",
        'ScopeOfWork': r"Scope of Work:.*?Score: (\d+)",
        'RequiredTechnologyStack': r"Required Technology Stack:.*?Score: (\d+)",
        'PricingModel': r"Pricing Model:.*?Score: (\d+)",
        'ServiceLevelAgreements': r"Service Level Agreements \(SLAs\):.*?Score: (\d+)",
        'SelectionCriteria': r"Selection Criteria:.*?Score: (\d+)",
        'Timelines': r"Timelines:.*?Score: (\d+)",
        'ContactDetails': r"Contact Details:.*?Score: (\d+)",
        'PenaltyClauses': r"Penalty Clauses:.*?Score: (\d+)",
        'RequiredOfferType': r"Required Offer Type:.*?Score: (\d+)"
    }

    # Extract and store the data
    extracted_data = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, summary_text)
        if match:
            score = match.group(1)
            score_value = score
            extracted_data[key] = score_value
        else:
            extracted_data[key] = None  # or some default value
    
    if extracted_data:
        return jsonify(extracted_data)
    else:
        return jsonify({"message": "PDF Summary not found"}), 404
 
def predict_loan_payment(input_data):
    input_data = pd.DataFrame(input_data, index=[0])
    prediction = model.predict(input_data)  # Use the .predict() method
    return prediction[0]

def init_db():
    db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
