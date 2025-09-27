# Deepfake Image Detection

## Project Overview 🔎

This project implements a robust deep learning solution to combat the growing threat of deepfakes highly realistic synthetic media.

By leveraging a Convolutional Neural Network (CNN) built with TensorFlow/Keras, the system is designed to identify subtle visual and spectral inconsistencies inherent in synthetically generated images, which are often invisible to the human eye.

**Model on Hugging Face Hub:** https://huggingface.co/kshitijanurag/image-deepfake-analyser

This submission was created for the AIGNITION competition.

# Deployment on Vercel

You can easily deploy the Deepfake Analyser frontend on Vercel at https://deepfake-anaylser-r4pw3hyr9-kshitij-anurag-s-projects.vercel.app/. The backend model will be hosted separately.

## 🚀 Key Features

- **Full Stack Deployment:** Integrated deep learning model with a dedicated web interface.
- **High Accuracy:** Achieves superior performance in binary classification of real and fake face images.
- **CNN Architecture:** Employs a custom, optimized CNN model for high fidelity feature extraction.
- **Scalability:** Trained on a large scale dataset of 140,000 images, ensuring robustness.
- **Python Stack:** Fully implemented using essential data science and machine learning libraries.

## ⚙️ Technologies and Libraries

This project uses a split architecture:

| Category      | Technology/Library       | Purpose                                                                                 |
| ------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Frontend      | HTML5, CSS and VanillaJS | Creates the responsive Web App interface for file selection, upload, and result display |
| Deep Learning | TensorFlow and Keras     | Core framework for building and training the CNN model                                  |
| Data Handling | NumPy and Pandas         | Efficient manipulation and processing of image data and labels                          |
| Visualization | Matplotlib               | Generating plots for training metrics and model evaluation                              |
| Evaluation    | scikit-learn (sklearn)   | Calculating performance metrics (ROC-AUC)                                               |

## 📁 Dataset & Resources

### Dataset

The model was trained on a large, publicly available dataset:

- **Name:** 140k Real and Fake Faces
- **Size:** Approximately 140,000 images (Approximately 70,000 Real and 70,000 Fake)
- **Source:** [Kaggle Dataset Link](https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces)

### Kaggle Notebook

The complete implementation, including data preprocessing, model definition, and training logs is documented in the following Kaggle Notebook:

- **Notebook:** [Kaggle Notebook Link](https://www.kaggle.com/code/kshitijanurag/notebook68184cffad)

> [!WARNING]
> **Performance Caveat:** While the model performs exceptionally well on the specified dataset, the ability of deepfake generation techniques is constantly improving. Future work involves testing this model against newer, state of the art deepfake methods to ensure robust generalization.
