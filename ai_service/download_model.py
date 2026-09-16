"""
AgriPulse - 1-Click Pre-Trained Model Downloader
-----------------------------------------------
Downloads pre-trained PlantVillage MobileNetV3 PyTorch weights (16.4 MB)
directly into ai_service/plant_disease_model.pth in seconds.

Usage:
  py ai_service/download_model.py
"""

import os
import sys
import urllib.request

MODEL_URL = "https://huggingface.co/hitmonleet/PlantVillage__MobileNetV3/resolve/main/plant_village.pth"
TARGET_PATH = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")

def download_model():
    print("=" * 60)
    print("  🌾 AgriPulse AI - 1-Click Pre-Trained Model Downloader 🌾")
    print("=" * 60)

    if os.path.exists(TARGET_PATH):
        size_mb = os.path.getsize(TARGET_PATH) / (1024 * 1024)
        print(f"-> Pre-trained model already exists at '{TARGET_PATH}' ({size_mb:.1f} MB).")
        overwrite = input("Do you want to re-download? (y/N): ").strip().lower()
        if overwrite != "y":
            print("Download cancelled.")
            return

    print(f"\n-> Downloading 16.4 MB PyTorch model from Hugging Face...")
    print(f"   URL: {MODEL_URL}")

    def progress_bar(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = min(100.0, downloaded * 100.0 / total_size)
            mb = downloaded / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            bar = "#" * int(percent // 4) + "-" * (25 - int(percent // 4))
            sys.stdout.write(f"\r   [{bar}] {percent:.1f}% ({mb:.1f}/{total_mb:.1f} MB)")
            sys.stdout.flush()

    try:
        urllib.request.urlretrieve(MODEL_URL, TARGET_PATH, reporthook=progress_bar)
        print("\n\n-> [SUCCESS] Pre-trained PlantVillage MobileNetV3 model saved successfully!")
        print(f"   Path: {TARGET_PATH}")
        print("   Ready for instant AI leaf disease diagnosis with zero training required.\n")
    except Exception as e:
        print(f"\n[ERROR] Download failed: {e}")

if __name__ == "__main__":
    download_model()
