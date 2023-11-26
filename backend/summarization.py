import os
import time
import openai
import pdfplumber
from dotenv import load_dotenv


def write_messages_to_pdf(message, filename):
    with open(filename, 'w') as file:
        file.write(message)

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
def extract_text_chunks_from_string(text, max_chars=32768):
    text_chunk = ""
    total_chars = 0

    for word in text.split():
        if total_chars + len(word) + 1 > max_chars:  # +1 for space
            yield text_chunk
            text_chunk = ""
            total_chars = 0
        text_chunk += word + ' '
        total_chars += len(word) + 1
    yield text_chunk  #


def summarizate(text):
    load_dotenv()
    summarize_text = ""
    api_key_openai = os.getenv('API_OPENAI')
    # Initialize OpenAI client
    client = openai.OpenAI(api_key=api_key_openai)

    # Create an assistant
    assistant = client.beta.assistants.create(
        name="Summarize Bot",
        instructions="""Your role is to evaluate Request for Proposals (RFPs) against a company's capabilities, 
        with detailed scoring for each aspect. Begin with 'First of file' for the company profile, and then 'Second of 
        file' for the RFP, concluding at 'End of file'. Focus solely on the text between these markers. After both texts 
        are presented, assess whether the company can fulfill the RFP, scoring each aspect from 0 to 10. Maintain a 
        professional tone. Evaluate these aspects of the RFP in relation to the company's capabilities: Problem 
        Statement, Scope of Work, Required Technology Stack, Pricing Model, Service Level Agreements (SLAs), 
        Selection Criteria, Timelines, Contact Details, Penalty Clauses, Required Offer Type. Clearly indicate if any 
        aspect is not detailed in the RFP. Avoid partial summaries; complete your analysis only after reviewing both the 
        company profile and RFP. This approach ensures a thorough and focused evaluation.""",
        model="gpt-4",
    )

    # Create a thread
    thread = client.beta.threads.create()

    # Signal the start of file processing
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content="First of file",
    )
    pdf_file_path = 'scraped_data.pdf'
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
        content="Second of file",
    )
    pdf_file_path = 'scraped_data.pdf'
    for extracted_text_chunk in extract_text_chunks_from_string(text):
        if extracted_text_chunk.strip():  # Check if chunk is not empty
            # Send each chunk as a message in the same thread
            client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=extracted_text_chunk,
            )
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

    for message in messages:
        if message.content[0].type == "text" and message.role == "assistant":
            print({"role": message.role, "message": message.content[0].text.value})
            write_messages_to_pdf(message.content[0].text.value, 'output.txt')
            summarize_text = message.content[0].text.value

        # Delete the assistant after processing
    client.beta.assistants.delete(assistant.id)

    return summarize_text

