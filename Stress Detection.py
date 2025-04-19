import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping
import os
import random

# Load dataset
emotion_labels = ['anger', 'contempt', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
data, labels = [], []

data_path = r"D:\archive (2)\Archive (3)\Train"  # Replace with actual dataset path
for emotion in emotion_labels:
    folder_path = os.path.join(data_path, emotion)
    for img in os.listdir(folder_path):
        img_path = os.path.join(folder_path, img)
        image = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        image = cv2.resize(image, (48, 48))
        data.append(img_to_array(image))
        labels.append(emotion_labels.index(emotion))

data = np.array(data, dtype="float") / 255.0
labels = np.array(labels)
labels = to_categorical(labels, num_classes=len(emotion_labels))

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42)
X_train = X_train.reshape(-1, 48, 48, 1)
X_test = X_test.reshape(-1, 48, 48, 1)

# Model creation
# Model creation with an additional Neural Network (Dense) layer
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(48, 48, 1)),
    tf.keras.layers.MaxPooling2D(2, 2),
    
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2, 2),

    tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2, 2),
    
    tf.keras.layers.Flatten(),

    # Fully Connected Neural Network Layer
    tf.keras.layers.Dense(256, activation='relu'),  
    tf.keras.layers.BatchNormalization(),  # Normalizing activations
    tf.keras.layers.Dropout(0.4),  # Prevent overfitting

    # Existing Dense Layer (128 neurons)
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),

    # Output Layer
    tf.keras.layers.Dense(len(emotion_labels), activation='softmax')  
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Training the model
datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True
)

datagen.fit(X_train)

early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
model.fit(datagen.flow(X_train, y_train, batch_size=32), epochs=600, validation_data=(X_test, y_test), callbacks=[early_stop])

# Save the updated model
model.save("stress_emotion_model_v2.h5")



# Load the model for inference
def load_trained_model():
    return load_model("stress_emotion_model_v2.h5")

# Function to detect emotion from an image
def detect_emotion(image_bytes):
    model = load_trained_model()
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    # image = cv2.imread(image_path)

    np_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_GRAYSCALE)

    # gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = image
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = img_to_array(face) / 255.0
        face = np.expand_dims(face, axis=0)
        face = np.expand_dims(face, axis=-1)
        
        prediction = model.predict(face)
        emotion_idx = np.argmax(prediction)
        emotion = emotion_labels[emotion_idx]
        return emotion
    return "No face detected"

# Function to provide recommendations based on detected emotion
def provide_recommendation(emotion):
    recommendations = {
        "Angry": "Try deep breathing exercises and listening to calming music.",
        "Disgust": "Engage in positive distractions or focus on something uplifting.",
        "Fear": "Practice mindfulness and talk to someone you trust.",
        "Happy": "Keep doing what makes you happy and share the joy with others!",
        "Neutral": "Maintain balance in your activities and stay mindful.",
        "Sad": "Engage in hobbies you enjoy, or connect with friends.",
        "Surprise": "Embrace the unexpected and stay open-minded.",
        "Stressed": "Take a short break, meditate, or go for a walk."
    }
    return recommendations.get(emotion, "No recommendation available.")

# Example usage
image_path = r"C:\Users\OMEN\Downloads\disgustingshit.jpeg"  # Replace with an actual image path
# detected_emotion = detect_emotion(image_path)

with open(image_path, "rb") as img_file:
    image_bytes = img_file.read()

detected_emotion = detect_emotion(image_bytes)

recommendation = provide_recommendation(detected_emotion)

print(f"Detected Emotion: {detected_emotion}")
print(f"Recommendation: {recommendation}")
