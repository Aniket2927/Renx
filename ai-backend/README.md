# AI Backend (FastAPI)

## Setup

1. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Running the Server

```sh
uvicorn main:app --reload --host 0.0.0.0 --port 8181
```

- The API will be available at: http://localhost:8181
- Docs: http://localhost:8181/docs

## Endpoints
- `POST /predict` — Price prediction
- `POST /sentiment` — News sentiment
- `POST /signals` — Buy/Sell/Hold signal

## Example Request

```sh
curl -X POST http://localhost:8181/predict -H "Content-Type: application/json" -d '{"symbol": "AAPL", "history": [100, 101, 102]}'
``` 