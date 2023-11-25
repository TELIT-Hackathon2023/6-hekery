from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from PyPDF2 import PdfReader
import re
import openai
from dotenv import load_dotenv
load_dotenv()


# Configure OpenAI with your API Key
openai.api_key = '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',

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:heslo@localhost/hackathon'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class PdfText(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    filename = db.Column(db.String(255))

    def __init__(self, text, filename):
        self.text = text
        self.filename = filename

class PdfSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    summary_text = db.Column(db.Text)
    pdf_text_id = db.Column(db.Integer, db.ForeignKey('pdf_text.id'), nullable=False)

    pdf_text = db.relationship('PdfText', backref=db.backref('summary', lazy=True))

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
        return jsonify({"message": "PDF Text deleted."}), 200
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
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"Summarize the following text:\n\n{pdf_text_record.text}",
            max_tokens=150
        )
        summary = response.choices[0].text.strip()

        # Save the summary to the database
        new_summary = PdfSummary(summary_text=summary, pdf_text_id=pdf_text_id)
        db.session.add(new_summary)
        db.session.commit()

        return jsonify({"summary": summary})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during summarization"}), 500

def init_db():
    db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)