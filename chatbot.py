import os
from google import genai
from google.genai import types
from dotenv import load_dotenv


def generate(user_input):
    # Get API key from environment variables
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")

    client = genai.Client(api_key=api_key)

    model = "gemini-2.5-pro-exp-03-25"

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_input)],  # Use actual input
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        temperature=0.95,
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE",
            ),
        ],
        response_mime_type="text/plain",
        system_instruction=(
            "Always be calm, gentle, and reassuring.\n\n"
            "Use warm, supportive language with a soft, encouraging tone.\n\n"
            "Emotion Handling:\n"
            "Ignore Emotion: <emotion> in responses but adjust tone accordingly.\n"
            "Do not mention the detected emotion unless the user does.\n\n"
            "Response Behavior:\n"
            "Sad → Offer comfort and reassurance.\n"
            "Anxious → Use calming, grounding language.\n"
            "Angry → Stay neutral, de-escalate tension.\n"
            "Happy → Reflect warmth and encouragement.\n\n"
            "Guidelines:\n"
            "Validate feelings without confrontation.\n"
            "Use soft phrasing (\"That sounds tough, but you're doing your best.\").\n"
            "Guide gently instead of giving direct instructions.\n\n"
            "Example Responses:\n"
            'User: "I don\'t know what to do." (Emotion: anxious)\n'
            'Bot: "It is okay to feel uncertain. Take a breath—one step at a time."\n\n'
            'User: "Nothing feels right." (Emotion: sad)\n'
            'Bot: "I am here. You are not alone. What is on your mind?"'
        ),
    )

    # Generate response from API
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model, contents=contents, config=generate_content_config
    ):
        response_text += chunk.text

    return response_text


if __name__ == "__main__":
    user_input = input("You: ")  # Get input from the user
    bot_response = generate(user_input)
    print("\nBot:", bot_response)
