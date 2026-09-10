"""
AgriPulse - Deep Learning Plant Disease Model Training Pipeline
---------------------------------------------------------------
This script trains a PyTorch Transfer Learning model (MobileNetV3 / EfficientNet-B0)
on the PlantVillage Dataset (or any custom folder-structured leaf disease dataset).

Usage:
  1. Local execution:
     py ai_service/train_plantvillage.py --dataset_dir ./dataset --epochs 10 --batch_size 32

  2. Google Colab execution:
     Upload this file to Colab or run on GPU instance for 5-minute training.
"""

import os
import argparse
import time
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

def train_model(
    dataset_dir: str,
    output_model_path: str = "plant_disease_model.pth",
    output_labels_path: str = "class_labels.json",
    num_epochs: int = 10,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    val_split: float = 0.2
):
    print("=" * 65)
    print("  🌾 AgriPulse Deep Learning Model Training Pipeline 🌾")
    print("=" * 65)

    if not os.path.exists(dataset_dir):
        print(f"\n[ERROR] Dataset directory '{dataset_dir}' not found.")
        print("Please create the directory with subfolders for each disease class.")
        print("Example:\n  dataset/\n    ├── Tomato___Late_blight/\n    ├── Paddy___Rice_Blast/\n    └── Healthy/")
        return

    # Check CUDA / Device availability
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"-> Using Compute Device: {device}")

    # Data Transforms (Augmentation + Normalization)
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # Load Full Dataset
    full_dataset = datasets.ImageFolder(root=dataset_dir, transform=train_transforms)
    class_names = full_dataset.classes
    num_classes = len(class_names)

    print(f"-> Found {len(full_dataset)} images across {num_classes} classes.")
    print(f"-> Classes: {class_names[:5]} ... (total {num_classes})")

    # Save class label mapping
    label_map = {idx: name for idx, name in enumerate(class_names)}
    with open(output_labels_path, "w") as f:
        json.dump(label_map, f, indent=2)
    print(f"-> Class labels saved to '{output_labels_path}'")

    # Split Train/Val
    val_size = int(len(full_dataset) * val_split)
    train_size = len(full_dataset) - val_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

    # Assign val_transforms to val_dataset
    val_dataset.dataset.transform = val_transforms

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2)

    # Transfer Learning: Pre-trained MobileNetV3 Large
    print("-> Loading Pre-trained MobileNetV3 Large architecture...")
    model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)

    # Replace classifier output head for custom disease classes
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes)
    )

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)

    best_val_acc = 0.0
    start_time = time.time()

    print("\n🚀 Starting Training Loop...")
    for epoch in range(1, num_epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)

        scheduler.step()
        epoch_train_loss = running_loss / train_size
        epoch_train_acc = (correct_train / total_train) * 100.0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data).item()
                total_val += labels.size(0)

        epoch_val_loss = val_loss / val_size
        epoch_val_acc = (correct_val / total_val) * 100.0

        print(f"Epoch [{epoch:02d}/{num_epochs:02d}] "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        # Save Best Model
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save(model.state_dict(), output_model_path)
            print(f"  --> Saved new best model checkpoint to '{output_model_path}' (Val Acc: {best_val_acc:.2f}%)")

    elapsed = time.time() - start_time
    print("\n" + "=" * 65)
    print(f"  🎉 Training Completed in {elapsed // 60:.0f}m {elapsed % 60:.0f}s")
    print(f"  🏆 Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"  💾 Model Weights Saved: {output_model_path}")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriPulse Plant Disease Training Script")
    parser.add_argument("--dataset_dir", type=str, default="./dataset", help="Path to dataset root folder")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    args = parser.parse_args()

    train_model(
        dataset_dir=args.dataset_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr
    )
