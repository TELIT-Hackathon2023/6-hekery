import openai

# Set the API key directly
openai.api_key = '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'

response = openai.Completion.create(
    engine="gpt-3.5-turbo-instruct",
    prompt="Write a tagline for an ice cream shop."
)

print(response.choices[0].text.strip())
