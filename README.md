# Global Intelligence Command Center (GICC)

Professional geopolitical and financial intelligence dashboard centered around an interactive 3D WebGL globe.

## Features
- **3D WebGL Globe**: Real-time visualization of global crisis signals using Three.js.
- **Crisis Monitoring**: Integrated environmental, market, and weather anomaly tracking.
- **AI Analysis**: Cross-signal intelligence provided by Gemini 1.5 Flash.
- **Market Sentiment**: Live Fear/Greed index and asset ticker with sparklines.
- **Responsive Layout**: High-density information dashboard designed for professional analysis.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Three.js, Recharts, Zustand.
- **Backend**: Node.js, Express, Axios, Node-cache, Express-rate-limit.

## Setup Instructions

### 1. External Assets (Mandatory)
Download free high-resolution Earth textures from [Solar System Scope](https://www.solarsystemscope.com/textures/):
- 8K Earth Day Map → `/public/textures/earth_daymap.jpg`
- 8K Earth Night Map → `/public/textures/earth_nightmap.jpg`
- 8K Earth Normal Map → `/public/textures/earth_normalmap.jpg`
- 8K Earth Specular Map → `/public/textures/earth_specularmap.jpg`
- 8K Earth Clouds Map → `/public/textures/earth_clouds.jpg`

*Note: The current implementation uses procedural colors/fallbacks if textures are missing.*

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3001
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
GNEWS_KEY=your_gnews_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Installation
```bash
npm install
npm run dev
```

## Architecture
- `client/`: React application with Three.js hooks and Zustand state.
- `server/`: Express proxy server for secure API communication and caching.
- `shared/`: (Implicit) Types and utilities shared via structure.

## Interactivity
- **Rotate**: Click and drag to orbit the globe.
- **Zoom**: Scroll to zoom in/out.
- **Analyze**: Click any 3D marker to view signal details and trigger AI deep-dive.
- **Filter**: Use topbar tabs to isolate specific signal types.
