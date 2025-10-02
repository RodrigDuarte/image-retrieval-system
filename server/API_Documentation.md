# Server API Documentation

This document describes all available API endpoints for the Image Search Server.

**Note**: Endpoints marked with **[DEBUG ONLY]** are only available when `production` is set to `false` in the server configuration.

## Table of Contents

1. [Frontend Routes](#frontend-routes)
2. [Search Endpoints](#search-endpoints)
3. [Model Management](#model-management)
4. [Embedding Management](#embedding-management-debug-only) [DEBUG ONLY]
5. [Image Endpoints](#image-endpoints)
6. [Server Status](#server-status-debug-only) [DEBUG ONLY]

## Frontend Routes

### GET /

**Description**: Landing page for the image search engine  
**Authentication**: None  
**Response**: HTML page

## Search Endpoints

### POST /search

**Description**: Handle image search requests using the default model  
**Authentication**: None  
**Content-Type**: `application/json`

#### Request Body

```json
{
  "query": "string (required)",
  "max_results": 6
}
```

**Parameters**:

- `query` (string, required): Search query text
- `max_results` (integer, optional): Number of results to return. Must be one of: 3, 6, 9, 27. Default: 6

#### Success Response (200)

```json
{
  "query": "example search query",
  "model": "OpenCLIP Laion5b",
  "results": [
    {
      "id": "image:abc123",
      "hash": "abc123",
      "score": "0.95",
      "url": "https://example.com/image.jpg",
      "local_path": "/path/to/image.jpg",
      "extension": "jpg"
    }
  ],
  "total": 1
}
```

#### Model Loading Response (202)

When dynamic model loading is enabled and the model needs to be loaded:

```json
{
  "status": "model_loading",
  "message": "Model 'OpenCLIP Laion5b' is currently loading",
  "suggestion": "Please wait and check /api/search/status or retry in a few moments"
}
```

#### Error Responses

```json
// 400 - Missing query
{
  "error": "Search query is required"
}

// 503 - Model failed to load
{
  "error": "Failed to load model 'OpenCLIP Laion5b'",
  "suggestion": "Check server logs for details or try POST /api/model/load"
}

// 500 - Server error
{
  "error": "Error message"
}
```

### POST /search_complex

**Description**: Handle hybrid search requests with fallback to image search  
**Authentication**: None  
**Content-Type**: `application/json`

#### Request Body

```json
{
  "query": "string (required)",
  "max_results": 6,
  "hybrid_function": 1
}
```

**Parameters**:

- `query` (string, required): Search query text
- `max_results` (integer, optional): Number of results to return. Must be one of: 3, 6, 9, 27. Default: 6
- `hybrid_function` (integer, optional): Hybrid search function option. Default: 1

#### Success Response - Hybrid Search (200)

```json
{
  "query": "example search query",
  "model": "OpenCLIP Laion5b",
  "search_type": "hybrid",
  "results": [
    {
      "id": "image:abc123",
      "hash": "abc123",
      "score": "0.95"
    }
  ],
  "total": 1
}
```

#### Success Response - Image Fallback (200)

```json
{
  "query": "example search query",
  "model": "OpenCLIP Laion5b",
  "search_type": "image_fallback",
  "results": [
    {
      "id": "image:abc123",
      "hash": "abc123",
      "score": "0.95",
      "url": "https://example.com/image.jpg",
      "local_path": "/path/to/image.jpg",
      "extension": "jpg"
    }
  ],
  "total": 1,
  "warning": {
    "type": "hybrid_search_fallback",
    "message": "Hybrid search unavailable - showing image results instead",
    "reason": "Hybrid search returned no results - documents may be missing for images",
    "suggestion": "To enable hybrid search, ensure all images have associated documents"
  }
}
```

#### Model Loading Response (202)

When dynamic model loading is enabled and the model needs to be loaded:

```json
{
  "status": "model_loading",
  "message": "Model 'OpenCLIP Laion5b' is currently loading",
  "suggestion": "Please wait and check /api/search/status or retry in a few moments"
}
```

#### Error Responses

```json
// 400 - Missing query
{
  "error": "Search query is required"
}

// 503 - Model not loaded
{
  "error": "Model 'OpenCLIP Laion5b' is not loaded"
}

// 500 - Both searches failed
{
  "error": "Both hybrid and image search failed",
  "hybrid_error": "Hybrid search error message",
  "fallback_error": "Image search error message"
}
```

### GET /api/search/status

**Description**: Get current search/model status for dynamic loading  
**Authentication**: None

#### Success Response (200)

```json
{
  "model_alias": "OpenCLIP Laion5b",
  "model_status": "loaded",
  "model_status_code": 2,
  "dynamic_loading": {
    "enabled": true,
    "unload_timeout_minutes": 10,
    "model_last_used": 1696339200.123,
    "time_until_unload": 8.5
  },
  "ready_for_search": true
}
```

**Model Status Values**: `unloaded` (0), `loading` (1), `loaded` (2), `unknown`

#### Error Response (500)

```json
{
  "error": "Error message"
}
```

## Model Management

### GET /api/model/status

**Description**: Get status of the model  
**Authentication**: None

#### Success Response (200)

```json
{
  "alias": "OpenCLIP Laion5b",
  "status": "LOADED",
  "info": {
    "model_name": "OpenCLIP Laion5b",
    "description": "Model description",
    "parameters": {}
  }
}
```

**Status Values**: `UNLOADED`, `LOADING`, `LOADED`, `UNKNOWN`

#### Error Response (500)

```json
{
  "error": "Error message"
}
```

### POST /api/model/load **[DEBUG ONLY]**

**Description**: Load the model  
**Authentication**: None  
**Content-Type**: `application/json`

#### Success Response (200)

```json
{
  "message": "Model OpenCLIP Laion5b loaded successfully"
}
```

#### Error Response (500)

```json
{
  "error": "Failed to load model OpenCLIP Laion5b"
}
```

### POST /api/model/unload **[DEBUG ONLY]**

**Description**: Unload the model  
**Authentication**: None  
**Content-Type**: `application/json`

#### Success Response (200)

```json
{
  "message": "Model OpenCLIP Laion5b unloaded successfully"
}
```

#### Error Response (500)

```json
{
  "error": "Failed to unload model OpenCLIP Laion5b"
}
```

## Embedding Management (DEBUG ONLY)

### POST /api/embeddings/generate **[DEBUG ONLY]**

**Description**: Manually trigger embedding generation  
**Authentication**: None  
**Content-Type**: `application/json`

#### Success Response (200)

```json
{
  "status": "started",
  "message": "Embedding generation triggered successfully",
  "total_files": 150,
  "estimated_time": "5 minutes"
}
```

#### Error Response (500)

```json
{
  "error": "Error message"
}
```

### GET /api/embeddings/progress **[DEBUG ONLY]**

**Description**: Get current embedding generation progress  
**Authentication**: None

#### Success Response (200)

```json
{
  "active": true,
  "stage": "Processing images",
  "current": 75,
  "total": 150,
  "processed": 70,
  "skipped": 5,
  "progress_percentage": 50.0,
  "estimated_remaining": "2 minutes"
}
```

#### Error Response (500)

```json
{
  "error": "Error message"
}
```

## Image Endpoints

### GET /image/\<image_id\>

**Description**: Serve image files  
**Authentication**: None  
**Parameters**: 

- `image_id` (string): Hash identifier of the image

#### Success Response (200)

**Content-Type**: `image/*` (varies by image type)  
Returns the binary image file

#### Error Responses

```json
// 404 - Image not found in database
{
  "error": "Image not found"
}

// 404 - Image file not found on disk
{
  "error": "Image file not found on disk"
}

// 500 - Server error
{
  "error": "Failed to serve image: Error message"
}
```

### GET /api/image/\<image_id\>/details

**Description**: Get image metadata and associated document details  
**Authentication**: None  
**Parameters**: 

- `image_id` (string): Hash identifier of the image

#### Success Response (200)

```json
{
  "image": {
    "hash": "abc123",
    "url": "https://example.com/image.jpg",
    "local_path": "/path/to/image.jpg",
    "extension": "jpg"
  },
  "documents": [
    {
      "title": "Document Title",
      "content": "Document content preview (truncated to 500 characters)...",
      "url": "https://example.com/document",
      "date": "2024-01-01",
      "hash": "doc456"
    }
  ]
}
```

#### Error Responses

```json
// 500 - Redis not connected
{
  "error": "Redis not connected"
}

// 404 - Image not found or hidden
{
  "error": "Image not found"
}

// 500 - Server error
{
  "error": "Error message"
}
```

## Server Status (DEBUG ONLY)

### GET /api/status **[DEBUG ONLY]**

**Description**: Server status and statistics endpoint  
**Authentication**: None

#### Success Response (200)

```json
{
  "status": "healthy",
  "app_name": "Server",
  "version": "1.0",
  "redis_connected": true,
  "model": {
    "alias": "OpenCLIP Laion5b",
    "status": "LOADED"
  },
  "statistics": {
    "total_images": 1500,
    "visible_images": 1450,
    "hidden_images": 50,
    "total_documents": 800,
    "visible_documents": 780,
    "hidden_documents": 20
  },
  "embedding_schedule": {
    "schedule_type": "immediate",
    "next_scheduled": null,
    "last_run": "2024-01-01T10:00:00Z"
  },
  "dynamic_loading": {
    "enabled": true,
    "unload_timeout_minutes": 10,
    "model_last_used": 1696339200.123,
    "time_until_unload": 8.5
  }
}
```

#### Error Response (500)

```json
{
  "error": "Error message"
}
```

## Static Files

The server also serves static files for the web interface:

- **CSS Files**: `/static/css/*.css`
- **JavaScript Files**: `/static/js/*.js`

These are automatically handled by Flask's static file serving and don't require explicit API calls.

## Error Handling

All endpoints use consistent HTTP status codes:

- **200**: Success
- **202**: Accepted (model loading in progress - check `/api/search/status` for updates)
- **400**: Bad Request (invalid parameters)
- **404**: Not Found (resource doesn't exist or is hidden)
- **503**: Service Unavailable (model not loaded or failed to load)
- **500**: Internal Server Error

Error responses always include an `error` field with a descriptive message. Some may include additional fields like `suggestion` for remediation steps.

## Notes

1. **Debug Mode**: Several endpoints are only available when `production` is set to `false` in `config.json`. In production mode, these endpoints return a 404 error.

2. **Dynamic Model Loading**: When enabled in configuration, models are loaded on-demand for queries and automatically unloaded after inactivity. This results in HTTP 202 responses during model loading. Use `/api/search/status` to check loading progress.

3. **Model Loading**: Most search functionality requires the model to be loaded first. Use `/api/model/status` or `/api/search/status` to check the current status.

4. **Hidden Content**: Images and documents marked as `hidden: "true"` are filtered out from all responses and treated as if they don't exist.

5. **Redis Dependency**: The server requires Redis to be running and connected for most functionality to work properly.

6. **Image Serving**: Images are served directly from the filesystem using the paths stored in Redis metadata.
