import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / "UI" / ".env.local"
load_dotenv(dotenv_path=env_path, verbose=True, override=True)

# Keep this print statement temporarily for verification
print(f"--- Verifying Key Load --- GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY')}")


def generate_chatbot_response(user_input: str, detected_emotion: str) -> str:
    """Generate chatbot response based on user input and detected emotion."""
# Define a dictionary to map emotions to chatbot responses
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
         # Raise a specific error if the key is still missing after loading
         raise ValueError("GEMINI_API_KEY environment variable not found or empty.")
    # Initialize Google Gemini API client
    client = genai.Client(api_key=api_key)
    model = "gemini-2.0-flash-thinking-exp-01-21"

    # Format the input with detected emotion
    formatted_input = f"Emotion: {detected_emotion}\nUser: {user_input}"
    #print("---Input---",formatted_input) #Uncomment to check input

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=formatted_input)],
        )
    ]

    # Configure Gemini API response settings
    generate_content_config = types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_MEDIUM_AND_ABOVE"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_MEDIUM_AND_ABOVE"),
        ],
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""Adjust responses based on detected emotions but do not explicitly mention the emotion.

Response Behavior:
- Sad → Offer comfort and reassurance.
- Anxious → Use calming, grounding language.
- Angry → Stay neutral, de-escalate tension.
- Happy → Reflect warmth and encouragement.

Guidelines:
- Validate feelings without confrontation.
- Use soft phrasing (e.g., "That sounds tough, but you're doing your best.").
- Guide gently instead of giving direct instructions.

Example Responses:
User: "I don't know what to do." (Anxious)
Bot: "It is okay to feel uncertain. Take a breath—one step at a time."

User: "Nothing feels right." (Sad)
Bot: "I am here. You are not alone. What is on your mind?"
"""),
        ],
    )

    # Generate response
    response = client.models.generate_content(model=model, contents=contents, config=generate_content_config)
    #print("---Gemini Response---",response) #Uncomment to check output

    # Safely handle None response
    if response is None:
        return "Sorry, I couldn't generate a response (no response from Gemini API)."
    text = getattr(response, 'text', None)
    if text is None:
        return "Sorry, I couldn't generate a response for that request."
    return text.strip()
