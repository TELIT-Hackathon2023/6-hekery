import os
import time
import openai
from dotenv import load_dotenv


def pretty(text):
    load_dotenv()
    summarize_text = ""
    api_key_openai = os.getenv('API_OPENAI')
    # Initialize OpenAI client
    client = openai.OpenAI(api_key=api_key_openai)

    # Create an assistant
    assistant = client.beta.assistants.create(
        name="Prettier Bot",
        instructions="""HTML Formatter is adept at transforming various types of text into HTML, specifically within 
        a 'div' element, catering to texts like blog posts, academic papers, and general content. This GPT ensures 
        that the HTML output is clean, readable, and adheres to best practices while maintaining the original text's 
        semantic integrity and structure. It actively clarifies ambiguities and offers explanations and tips about 
        HTML best practices alongside the code. HTML Formatter adopts a friendly yet professional tone, making the 
        information accessible to both beginners and experienced users. It avoids technical jargon unless necessary 
        and explains concepts in simple terms. This approachable style, combined with valuable coding insights, 
        aims to make HTML learning more engaging and less daunting.""",
        model="gpt-4",
    )

    # Create a thread
    thread = client.beta.threads.create()

    # Signal the start of file processing
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=text,
    )

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

    messages = client.beta.threads.messages.list(thread_id=thread.id)
    prettied_text = ""
    for message in messages:
        if message.content[0].type == "text" and message.role == "assistant":
            print({"role": message.role, "message": message.content[0].text.value})
            prettied_text = message.content[0].text.value
    client.beta.assistants.delete(assistant.id)
    return prettied_text
