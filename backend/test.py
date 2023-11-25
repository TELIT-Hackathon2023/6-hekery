import openai

# Set the API key directly
openai.api_key = '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'

response = openai.Completion.create(
    engine="gpt-3.5-turbo-instruct",
    prompt="Write a tagline for an ice cream shop."
)

print(response.choices[0].text.strip())
