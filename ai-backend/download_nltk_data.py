import nltk
import sys
import os

def download_nltk_data():
    """
    Download required NLTK data packages.
    This function downloads the necessary NLTK data packages for sentiment analysis
    and text processing.
    """
    print("Starting NLTK data download...")
    
    # List of required NLTK data packages
    required_packages = [
        'vader_lexicon',  # For sentiment analysis
        'punkt',          # For tokenization
        'averaged_perceptron_tagger',  # For part-of-speech tagging
        'wordnet',        # For lemmatization
        'stopwords'       # For stop word removal
    ]
    
    # Download each package
    for package in required_packages:
        try:
            print(f"Downloading {package}...")
            nltk.download(package, quiet=True)
            print(f"Successfully downloaded {package}")
        except Exception as e:
            print(f"Error downloading {package}: {str(e)}")
            sys.exit(1)
    
    print("\nAll NLTK data packages have been downloaded successfully!")
    print("You can now run the main application.")

if __name__ == "__main__":
    # Check if NLTK is installed
    try:
        import nltk
    except ImportError:
        print("Error: NLTK is not installed. Please install it using:")
        print("pip install nltk")
        sys.exit(1)
    
    # Create NLTK data directory if it doesn't exist
    nltk_data_dir = os.path.join(os.path.expanduser("~"), "nltk_data")
    if not os.path.exists(nltk_data_dir):
        os.makedirs(nltk_data_dir)
    
    # Download the required data
    download_nltk_data()

    # Download additional required NLTK data
    nltk.download('vader_lexicon')
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger') 