# ✈️ SkyTracker - Real-Time Flight Dashboard

**SkyTracker** is a modern, responsive flight tracking application built with **Next.js 14**, **Tailwind CSS**, and **Leaflet**. It provides real-time flight data visualization, interactive mapping, and a professional aerospace-inspired UI.

![SkyTracker Preview](https://placehold.co/1200x600/0f172a/10b981?text=SkyTracker+Dashboard)

## ✨ Features

- **🌍 Global Flight Tracking**: Search for and track flights from anywhere in the world using the OpenSky Network API.
- **🗺️ Interactive Map**:
  - **Live Positioning**: Aircraft move smoothly across the map using client-side interpolation.
  - **Flight Traces**: Visualize the full path of the flight from its origin.
  - **Theme Support**: Automatically switches between Dark (CartoDB Dark Matter) and Light (CartoDB Positron) map tiles.
  - **Custom Icons**: Detailed, rotated aircraft icons with shadows for better visibility.
- **🌗 Dark & Light Mode**: A fully responsive UI that toggles between a sleek "Aerospace Dark" theme and a clean "Daylight" theme.
- **📊 Live Flight Board**:
  - Real-time telemetry (Altitude, Velocity, Heading).
  - Country of origin and Callsign display.
  - "Remove Flight" functionality to manage your tracking list.
- **⚡ High Performance**:
  - Efficient polling mechanism (every 5s) to respect API rate limits.
  - Client-side smoothing for 60fps animation feel.
  - Dynamic imports for Leaflet to ensure SSR compatibility.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Map Engine**: [React Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [OpenSky Network API](https://opensky-network.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.
- npm or yarn.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/flight-tracker.git
    cd flight-tracker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

1.  **Search**: Use the search bar at the top right to find a flight by its callsign (e.g., `DAL` for Delta, `BAW` for British Airways, `UAE` for Emirates).
2.  **Add**: Select a flight from the dropdown results to add it to your tracking board.
3.  **Track**: Watch the flight move on the map. Click on the flight in the list or map to center the view.
4.  **Toggle Theme**: Click the Sun/Moon icon to switch between Light and Dark modes.
5.  **Remove**: Hover over a flight in the list and click the "X" button to stop tracking it.

## 📡 API Integration

This project uses the **OpenSky Network API** for live flight data.
- **Search**: Fetches global state vectors and filters by callsign.
- **Tracking**: Polls specific `icao24` transponder IDs for efficient updates.
- **Tracks**: Attempts to fetch historical track data for flight paths.

> **Note**: The OpenSky API has rate limits for anonymous users. If you experience delays or missing data, it may be due to these limits.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
