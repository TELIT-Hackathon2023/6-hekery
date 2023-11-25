import os
import time
import openai
import pdfplumber


def extract_text_chunks_from_pdf(file_path, max_chars=32768):
    text_chunk = ""
    total_chars = 0

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                for word in page_text.split():
                    if total_chars + len(word) + 1 > max_chars:  # +1 for space
                        yield text_chunk
                        text_chunk = ""
                        total_chars = 0
                    text_chunk += word + ' '
                    total_chars += len(word) + 1
        yield text_chunk  # Yield the last chunk


pdf_file_path = 'files/2015_RFPWebsiteRedesignRepost.pdf'
api_key_openai = os.getenv('API_OPENAI')
# Initialize OpenAI client
client = openai.OpenAI(api_key=api_key_openai)

# Create an assistant
assistant = client.beta.assistants.create(
    name="Summarize Bot",
    instructions="Role and Goal: Summarize Bot is designed to analyze and summarize Request for Proposals (RFPs) text provided by the user. It starts the analysis process when the user indicates 'Start of file' and provides a comprehensive summary and analysis after the user indicates 'End of file.' Constraints: The bot focuses on the text received between these two indicators, avoiding any analysis outside this scope. Guidelines: Summarize Bot does not provide partial summaries but waits until the full text is received before generating its final summary and analysis. Personalization: The bot maintains a professional and efficient approach, ensuring a detailed and accurate summary of the RFPs, based solely on the content provided between 'Start of file' and 'End of file.'",
    model="gpt-3.5-turbo",
)

# Create a thread
thread = client.beta.threads.create()

# Signal the start of file processing
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Start of file",
)

# Process each chunk of text
for extracted_text_chunk in extract_text_chunks_from_pdf(pdf_file_path):
    if extracted_text_chunk.strip():  # Check if chunk is not empty
        # Send each chunk as a message in the same thread
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=extracted_text_chunk,
        )

# Signal the end of file processing
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="End of file",
)

# Create a run to process the entire conversation
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id,
)

# Wait for the processing to complete
while True:
    run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
    if run.status == "completed":
        print("Processing complete!")
        break
    else:
        print("Processing in progress...")
        time.sleep(5)

# Retrieve and print final messages
messages = client.beta.threads.messages.list(thread_id=thread.id)
for message in messages:
    if message.content[0].type == "text":
        print({"role": message.role, "message": message.content[0].text.value})

# Delete the assistant after processing
client.beta.assistants.delete(assistant.id)
