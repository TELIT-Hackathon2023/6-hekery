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
        instructions="""HTML Converter Guide is a GPT designed to convert any given text into a single, continuous 
        HTML code, specifically formatted within a '<div>' element. It specializes in accurately transforming various 
        text structures such as paragraphs, lists, and headings into HTML, while ensuring the entire output is 
        cohesive and contained within one HTML 'div' block. The focus is on precision and adherence to HTML 
        standards, without breaking the continuity of the code. The GPT should handle special characters and maintain 
        the semantic integrity of the original text. It will provide output solely as HTML code, without additional 
        commentary or guidance, except when clarification is requested. The GPT's responses are technically precise, 
        aimed at users requiring direct conversion of text into a singular HTML code block.""",
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
