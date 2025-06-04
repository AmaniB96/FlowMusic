import { useState } from 'react'
import './App.css'
import axios from 'axios'
import GridMotion from './components/GridMotion'
import SearchBar from './components/SearchBar'
import SongResults from './components/SongResults'


function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(6);
  const [artistImage, setArtistImage] = useState("");

  const handleSearch = async (query) => {
    const isDev = import.meta.env.DEV;
    const PROXY_URL = 'https://cors.bridged.cc/'; // New proxy: cors.bridged.cc
    const TARGET_URL = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`; // Ensure query itself is encoded for Deezer

    const searchUrl = isDev
      ? `/api/search?q=${encodeURIComponent(query)}` 
      : `${PROXY_URL}${TARGET_URL}`; 
    
    const requestTimeout = isDev ? 5000 : 20000; 

    try {
      setError(null); 
      const response = await axios.get(searchUrl, { timeout: requestTimeout });
      
      
      const deezerData = response.data; 

      setData(deezerData.data);
      if (deezerData.data && deezerData.data.length > 0 && deezerData.data[0].artist) {
        setArtistImage(deezerData.data[0].artist.picture_xl || "");
      } else {
        setArtistImage("");
      }
    } catch (err) {
      console.error('Error fetching search data:', err);
      let errorMessage = 'Error fetching data. The service might be temporarily unavailable.';
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = 'Search timed out. The service might be slow. Please try again.';
      } else if (err.response) {
        // Log more details from the error response if available
        console.error('Proxy/API Error Response:', err.response.data, err.response.status, err.response.headers);
        if (err.response.status === 403) {
          errorMessage = 'Access to the data service was forbidden. The proxy might be blocked or the API may require different authentication.';
        } else if (err.response.status === 401) {
          errorMessage = 'Unauthorized. The proxy or API may require authentication not provided.';
        } else if (err.response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        errorMessage = 'No response from the server. Check your internet connection or the proxy might be down.';
      }
      setError(errorMessage);
      setData(null); 
      setArtistImage("");
    }
  };

  const handleSeeMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 6);
  };

  const handleLogoClick = () => {
    setData(null);
    setArtistImage("");
    setDisplayLimit(6);
    setError(null);
  };

  return (
    <div className='app' style={{
      backgroundImage: artistImage ?
        `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${artistImage})` :
        'none'
    }}>
      <SearchBar onSearch={handleSearch} onLogoClick={handleLogoClick} />

      {error && <p style={{ color: 'orange', textAlign: 'center', padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)' }}>{error}</p>}

      {!data && !error && <GridMotion />} 

      {data && (
        <SongResults
          songs={data}
          displayLimit={displayLimit}
          onLoadMore={handleSeeMore}
        />
      )}
    </div>
  );
}

export default App