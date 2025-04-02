import os
import cv2
import glob
import numpy as np
from tqdm import tqdm
from sklearn.model_selection import train_test_split
import albumentations as A

# Define dataset paths
dataset_root = r"D:\Mini ML\archive (3)"  # Replace with your dataset folder path
processed_root = r"D:\Mini ML\processed_data"
os.makedirs(processed_root, exist_ok=True)

# Data Augmentation Pipeline
transform = A.Compose([
    A.HorizontalFlip(p=0.3),
    A.Rotate(limit=15, p=0.5),
    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5)
])

# Function to preprocess images
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is not None:
        img = cv2.resize(img, (224, 224))  # Resize to 224x224
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB

        # Data Augmentation (20% Probability)
        if np.random.rand() < 0.2:
            transformed = transform(image=img)
            img = transformed['image']

        img = img / 255.0  # Normalize pixel values
        return img
    return None

# Process each folder (train and test)
for folder in ["train", "test"]:
    folder_path = os.path.join(dataset_root, folder)
    processed_folder_path = os.path.join(processed_root, folder)
    os.makedirs(processed_folder_path, exist_ok=True)

    # Process each emotion folder
    for emotion in os.listdir(folder_path):
        emotion_folder = os.path.join(folder_path, emotion)
        processed_emotion_folder = os.path.join(processed_folder_path, emotion)
        os.makedirs(processed_emotion_folder, exist_ok=True)

        image_files = glob.glob(os.path.join(emotion_folder, "*"))

        print(f"🔄 Processing {folder}/{emotion} folder...")

        for img_path in tqdm(image_files):
            img = preprocess_image(img_path)
            if img is not None:
                filename = os.path.basename(img_path)
                save_path = os.path.join(processed_emotion_folder, filename)
                cv2.imwrite(save_path, (img * 255).astype(np.uint8))  # Save preprocessed image

print(f"✅ Preprocessing completed. Preprocessed dataset stored in: {processed_root}")

