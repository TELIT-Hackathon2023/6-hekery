import PyPDF2
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfFileReader(file)
        text = ''
        for page in range(reader.numPages):
            text += reader.getPage(page).extractText()
    return text
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import PorterStemmer
from collections import Counter
import math

# Download necessary NLTK data
#nltk.download('punkt')
#nltk.download('stopwords')

def preprocess(text):
    """Tokenize and stem the text."""
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(text.lower())
    ps = PorterStemmer()
    return [ps.stem(w) for w in words if w not in stop_words and w.isalpha()]

def cosine_similarity(vec1, vec2):
    """Calculate the cosine similarity between two text vectors."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    sum1 = sum([vec1[x]**2 for x in vec1.keys()])
    sum2 = sum([vec2[x]**2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0
    else:
        return float(numerator) / denominator

def compare_texts(text1, text2):
    """Compare two texts and return their cosine similarity."""
    vector1 = Counter(preprocess(text1))
    vector2 = Counter(preprocess(text2))

    return cosine_similarity(vector1, vector2)

# Extracting text from the uploaded RFP summary PDF
rfp_text = extract_text_from_pdf("docs/SummaryRFP.pdf")

# Placeholder text representing your firm's portfolio
portfolio_text = extract_text_from_pdf("docs/tecko_portfolio.pdf")

# Compare the texts
similarity = compare_texts(rfp_text, portfolio_text)

# Scale the similarity score to a scale of 1 to 10
score = round(similarity * 10)
score = max(0, min(score, 10))  # Ensure the score is within 1 to 10

print(f"Semantic Similarity Score (on a scale of 0 to 10): {score}")
