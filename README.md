# Image Retrieval System

A Flask-based web server for an image retrieval system. This server provides image search using advanced AI models, supporting both simple image search and hybrid text-image search capabilities.

## Installation

### Prerequisites

- Python 3.8+
- Redis server
- Access to watched folders containing images and documents

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd PresidencyLens_Project/server
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure the server:
   - Edit `config.json` to set Redis connection details
   - Update `watched_folders` with absolute paths to your image directories
   - Configure model settings in `models.json`

4. Start Redis server (if not already running):

   ```bash
   redis-server
   ```

5. Run the server:

   ```bash
   python main.py
   ```

The server will start on `http://0.0.0.0:5000`

## Configuration

### config.json

Key configuration options:

- `redis_host`, `redis_port`, `redis_db`: Redis connection settings
- `watched_folders`: List of directories to monitor for new images
- `model_alias`: Default model to use for search
- `embedding_schedule`: Configuration for automatic embedding generation

### models.json

Contains available AI models for image search:

- **OpenCLIP**: Default model, multilingual support
- **MultilingualCLIP variants**: Support for multiple languages
- **BLIP-2**: Advanced vision-language understanding
- **CLIP variants**: Standard CLIP models

## Data Format

### Document Format

Documents must be in JSON format with the following structure to work with the hybrid search functionality:

```json
{
  "url": "https://www.example.com/article-url",
  "date": "2023-12-01",
  "title": "Article Title",
  "content": "The full text content of the document...",
  "images": [
    "image_1.jpg",
    "image_2.jpg",
    "image_3.jpg"
  ]
}
```

**Required fields:**

- `url`: The source URL of the document
- `date`: Publication date in YYYY-MM-DD format
- `title`: Document title
- `content`: Full text content of the document
- `images`: Array of image filenames associated with the document

**Notes:**

- Image filenames should match the actual image files in the watched folders
- The `images` array links documents to their associated images for hybrid search

## Usage

### Web Interface

Access the web interface at `http://localhost:5000` to:

- Perform image searches
- View search results
- Browse indexed images
- Access server status (development mode)

## Development

### Adding New Models

Add model configuration to `models.json`, implement model loading in `utils/controller.py`, and update search logic if needed.

### Monitoring

Server logs are written to `server.log`. Use `/api/status for` health checks and monitor Redis connection and model status.

### Logs

Check `server.log` for detailed error messages and debugging information.

## License

MIT License

Copyright (c) 2025 Rodrigo Duarte

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
