
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
from chatbot import generate_chatbot_response  # Import chatbot function

app = FastAPI()

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the emotion detection model
model = tf.keras.models.load_model("C:/Users/Shreya Nithin/Desktop/mini/MiniProject/stress_emotion_model_v2.h5") #Change path to your path

# Define emotion labels (modify based on your model)
emotion_labels = ["happy", "sad", "angry", "neutral", "fearful", "disgust", "surprised"]

def detect_emotion(image_bytes):
    """Detect emotion from image."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    image = cv2.resize(image, (48, 48))  # Resize as per your model input
    image = np.expand_dims(image, axis=-1)  # Add channel dimension => (48, 48, 1)
    image = np.expand_dims(image, axis=0)   # Add batch dimension => (1, 48, 48, 1)
    image = image / 255.0  # Normalize

    prediction = model.predict(image)
    detected_emotion = emotion_labels[np.argmax(prediction)]

    return {"detected_emotion": detected_emotion, "confidence": float(np.max(prediction))}

class ChatRequest(BaseModel):
    user_input: str
    emotion: str

@app.post("/detect_emotion/")
async def detect_emotion_api(file: UploadFile):
    """API to detect emotion from an image."""
    image_bytes = await file.read()
    result = detect_emotion(image_bytes)
    return result

@app.post("/chat/")
async def chat_with_bot(request: ChatRequest):
    """API to handle chatbot interaction."""
    response = generate_chatbot_response(request.user_input, request.emotion)
    return {"bot_response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
