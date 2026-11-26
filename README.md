# MOVARA — OTT Movie & TV Streaming Platform

MOVARA is a Netflix-inspired OTT streaming and discovery web application built with React, Vite, Tailwind CSS v4, and the TMDB API v3. It combines live movie and TV discovery with an in-app HTML5 video player, playback progress tracking, Watch History, Watchlist, and single-account authentication.

---

## ✨ Features

- **Public Landing & Single-Account Authentication** — Clean landing page (`/`), Sign In (`/login`), Sign Up (`/signup`), persistent client-side session, and Account Settings (`/account`) for display name and playback preferences.
- **Live TMDB Discovery** — Browse trending, popular, top-rated, upcoming, and genre-filtered Movies (`/movies`), TV Shows (`/tv-shows`), and Kids (`/kids`) content powered by TMDB API v3 (with curated local catalog fallback if no API key is configured).
- **Real-Time Inline Search** — Instant Navbar search dropdown with debounced TMDB + local results, keyboard navigation (`↑` / `↓` / `Enter`), and direct navigation to Details pages.
- **Movie & TV Details Pages** — Rich metadata, cast, trailers (`Watch Trailer`), season/episode browser, episode watch status, and dynamic stream availability (`Watch Movie` / `Watch Episode` vs. `Stream Unavailable`).
- **In-App OTT Video Player** — Custom HTML5 video player (`/watch/movie/:id` and `/watch/tv/:id/season/:seasonNumber/episode/:episodeNumber`) with:
  - Play/Pause, seek bar with buffered indicator, volume/mute, playback speed (`0.5x`–`2x`), fullscreen, and keyboard shortcuts
  - Debounced buffering feedback and bounded error recovery
  - Optional WebVTT subtitles with customizable size and background
  - Conditional multi-track audio detection
  - Optional Skip Intro, Skip Recap, End Credits indicator, and TV Next Episode countdown (`Auto Next`)
- **Continue Watching & Watch History** — Automatic playback progress saving, 90% completion cleanup, resume from last timestamp, and a dedicated Watch History page (`/watch-history`) with type filters.
- **Watchlist (`/my-list`)** — Save and filter favorite movies and TV shows.
- **Responsive Design** — Optimized dark cinema UI across desktop, tablet, and mobile.

---

## 🎬 Current Playable Movies & Future Roadmap

MOVARA strictly avoids unauthorized or pirated streams. Currently, **4 complete open-licensed films** from the Blender Foundation / Blender Institute are registered and playable inside the in-app VideoPlayer:

| Film | Year | TMDB ID | License |
| :--- | :--- | :--- | :--- |
| **Sintel** | 2010 | `45745` | CC BY 3.0 |
| **Big Buck Bunny** | 2008 | `10378` | CC BY 3.0 |
| **Elephants Dream** | 2006 | `9761` | CC BY 2.5 |
| **Tears of Steel** | 2012 | `133701` | CC BY 3.0 |

All other commercial movies and TV episodes accurately display **Stream Unavailable** for full-stream playback while keeping **Watch Trailer** and discovery metadata available.

### 🚀 Future Plans
- **Full Catalog Streaming:** Integrate a backend service and authorized/licensed media hosting so all movies and TV series episodes can be streamed directly inside MOVARA.
- **Server-Side Accounts:** Upgrade demo LocalStorage authentication, Watchlist, and Watch History to persistent backend storage.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, JavaScript (JSX)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router
- **Icons:** Lucide React
- **Data & Media:** TMDB API v3 (Native Fetch API), HTML5 Video
- **Persistence:** Browser LocalStorage

---

## 🔑 Environment Setup & Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your **TMDB v3 API Key**:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_v3_api_key
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   ```
   *(Never commit your `.env` file.)*
3. Start the development server or build for production:
   ```bash
   npm run dev
   npm run build
   ```

---

## 👨‍💻 Developer

**Wasif Islam**

- GitHub: [@Wasif-Islam89](https://github.com/Wasif-Islam89)
- Repository: [movara-streaming-platform](https://github.com/Wasif-Islam89/movara-streaming-platform)

---

## ⚠️ Disclaimer

MOVARA is an independent portfolio project inspired by streaming platforms. It is not affiliated with, endorsed by, or associated with Netflix or the Blender Foundation.

Movie and TV show metadata and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
