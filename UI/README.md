# Emotion Detection and Chatbot Assistant

This project is a real-time Emotion Detection system with an intelligent chatbot assistant. It captures video input from the user, analyzes emotions periodically, and provides personalized responses or stress-reducing recommendations using Google's Gemini API.

---

## 🔥 Features

- 🎥 Real-time **Webcam-based Emotion Detection**
- 🧠 Emotion classification using pre-trained ML models
- 🤖 **Chatbot integration** for contextual responses
- 💬 Gemini-powered suggestions for:
  - Stress reduction
  - Song or activity recommendations
- 📸 Periodic screenshot capture (every 3–5 seconds)
- 📡 FastAPI backend + Next.js frontend
- 🔐 `.env`-based API key management

---

## 🧩 Tech Stack

| Area         | Tools/Frameworks         |
|--------------|--------------------------|
| Frontend     | Next.js (React + JS)     |
| Backend      | FastAPI                  |
| ML/Emotion   | Python, OpenCV           |
| Chatbot API  | Google Gemini API        |
| Styling      | Tailwind CSS             |

---

## 📦 Sample Workflow

1. **User visits frontend and allows webcam access.**
2. **Video is captured**, and frames are periodically sent to the backend for emotion analysis.
3. **Emotion is detected** from the video frames and passed to the **chatbot API** for personalized interaction.
4. **Gemini responds** with personalized suggestions based on the detected emotion (e.g., stress reduction techniques or song/activity recommendations).
5. **UI updates** with the chatbot's feedback, providing the user with the suggested response.


## 🧪 Future Improvements

- 🎯 **Audio-based emotion detection**
- 📊 **Dashboard for emotion trends**
- 🧬 **Sentiment analysis from text input**
- 🌐 **Multi-language support**

## ✨ Contributors

- **Shreya Nithin** 
- **Sidharth** 
- **Vivek** 
- **Zahaan** 