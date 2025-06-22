import os

# TensorFlow settings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN custom operations
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'   # Reduce TensorFlow logging

# Other environment settings
os.environ['PYTHONWARNINGS'] = 'ignore'    # Suppress Python warnings 