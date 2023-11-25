import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import pagesizes

def get_links(url, domain):
    """Get all links from a webpage within the same domain."""
    links = set()
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    for link in soup.find_all('a', href=True):
        href = link['href']
        if domain in href:
            links.add(href)
        else:
            # Join relative URL
            links.add(urljoin(url, href))

    return links

def scrape_text(url):
    """Scrape all text from a webpage."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    text = ' '.join([p.get_text() for p in soup.find_all('p')])
    return text

def wrap_text(text, width, canvas):
    """Wrap text to fit within a given width."""
    wrapped_text = []
    line = ''
    for word in text.split():
        if canvas.stringWidth(line + ' ' + word) < width:
            line = line + ' ' + word if line else word
        else:
            wrapped_text.append(line)
            line = word
    wrapped_text.append(line)
    return wrapped_text

def add_to_pdf(c, url, text, y):
    """Add text to a PDF file, wrapping text to fit the page."""
    c.drawString(50, y, f"URL: {url}")
    y -= 20
    text_width = pagesizes.letter[0] - 100  # Adjust the width as needed

    for line in wrap_text(text, text_width, c):
        c.drawString(50, y, line)
        y -= 14
        if y < 50:
            c.showPage()
            y = 750
    return y

# Start URL and domain
start_url = 'https://www.t-systems.com/de/en'
domain = 't-systems.com'  # Change to the domain you are scraping

# Get all links from the start URL
links = get_links(start_url, domain)
total_links = len(links)
print(f"Total URLs to scrape: {total_links}")

# Create PDF canvas
c = canvas.Canvas("scraped_data.pdf", pagesize=letter)
y = 750

# Scrape text from each link and add to PDF
for i, link in enumerate(links, 1):
    try:
        text = scrape_text(link)
        y = add_to_pdf(c, link, text, y)
        print(f"Progress: {i}/{total_links}")
    except Exception as e:
        print(f"Failed to scrape {link}: {e}")

# Save the PDF
c.save()
