import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GridMotion.css';
import Loading from './Loading';

const ARTISTS_BY_ROW = [
  ['drake', 'beyonce', 'aya nakamura', 'asake', 'rihanna', 'adele', 'weeknd', 'ayra starr'],
  ['dave', 'central cee', 'burna boy', 'wizkid', 'skepta', 'stormzy', 'clavish', 'ateyaba'],
  ['ninho', 'pnl', 'booba', 'jul', 'gazo', 'tiakola', 'klm', 'dadju']
];

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QXJ0aXN0PC90ZXh0Pgo8L3N2Zz4=';

function GridMotion() {
  const [artistRows, setArtistRows] = useState(() => ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE)));
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState('');

  const fetchArtistImage = useCallback(async (artistName, isDev, timeout) => {
    const PROXY_URL_PREFIX = 'https://cors.bridged.cc/'; 
    const TARGET_URL = `https://api.deezer.com/search?q=${encodeURIComponent(artistName)}`;

    const artistSearchUrl = isDev
      ? `/api/search?q=${encodeURIComponent(artistName)}`
      : `${PROXY_URL_PREFIX}${TARGET_URL}`;

    try {
      const response = await axios.get(artistSearchUrl, { timeout });
      const deezerData = response.data; 

      if (deezerData.data && deezerData.data.length > 0 && deezerData.data[0].artist) {
        return deezerData.data[0].artist.picture_xl || FALLBACK_IMAGE;
      }
      return FALLBACK_IMAGE;
    } catch (error) {
      console.error(`Error fetching image for ${artistName}:`, error.message);
      if (error.response) {
        console.error('Proxy/API Error for image:', error.response.data, error.response.status);
      }
      return FALLBACK_IMAGE;
    }
  }, []);

  useEffect(() => {
    const loadAllImages = async () => {
      setLoading(true);
      setLoadMessage('');
      const isDev = import.meta.env.DEV;
      const requestTimeout = isDev ? 5000 : 20000; // 5s for dev, 20s for prod

      const cachedData = localStorage.getItem('artistImages');
      const cacheTimestamp = localStorage.getItem('artistImagesTimestamp');

      if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 24 * 60 * 60 * 1000) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Ensure parsedData structure matches ARTISTS_BY_ROW
          if (parsedData.length === ARTISTS_BY_ROW.length && parsedData.every((r, i) => r.length === ARTISTS_BY_ROW[i].length)) {
            setArtistRows(parsedData);
            setLoading(false);
            return;
          } else {
            console.warn("Cached data structure mismatch, clearing cache.");
            localStorage.removeItem('artistImages'); // Clear invalid cache
            localStorage.removeItem('artistImagesTimestamp');
          }
        } catch (_e) { 
            // Now we "use" _e by logging it
            console.warn("Failed to parse cached artist images, clearing cache. Error:", _e); 
            localStorage.removeItem('artistImages'); // Clear malformed cache
            localStorage.removeItem('artistImagesTimestamp');
        }
      }
      
      // Initialize with placeholders before fetching
      setArtistRows(ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE)));

      let successfulLoads = 0;
      const totalImagesToLoad = ARTISTS_BY_ROW.flat().length;
      const newArtistRowsData = [...ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE))];

      for (let rowIndex = 0; rowIndex < ARTISTS_BY_ROW.length; rowIndex++) {
        const currentRowArtists = ARTISTS_BY_ROW[rowIndex];
        const rowImagePromises = currentRowArtists.map(artistName => 
          fetchArtistImage(artistName, isDev, requestTimeout)
        );
        
        const imagesForThisRow = await Promise.all(rowImagePromises);
        newArtistRowsData[rowIndex] = imagesForThisRow;
        successfulLoads += imagesForThisRow.filter(img => img !== FALLBACK_IMAGE).length;

        // Update state incrementally to show images as they load per row
        setArtistRows(prevRows => {
            const updatedRows = [...prevRows];
            updatedRows[rowIndex] = imagesForThisRow;
            return updatedRows;
        });
      }

      localStorage.setItem('artistImages', JSON.stringify(newArtistRowsData));
      localStorage.setItem('artistImagesTimestamp', Date.now().toString());

      if (!isDev && totalImagesToLoad > 0 && successfulLoads < totalImagesToLoad * 0.75) { // If less than 75% images loaded
        setLoadMessage('Some artist images could not be loaded due to network issues. Displaying available data.');
      }
      setLoading(false);
    };

    loadAllImages();
  }, [fetchArtistImage]);

  if (loading && artistRows.flat().every(img => img === FALLBACK_IMAGE)) { // Show loading only if all are placeholders
    return <Loading />;
  }

  return (
    <>
      {loadMessage && <p style={{ textAlign: 'center', color: 'orange', padding: '10px' }}>{loadMessage}</p>}
      <div className="grid-container">
        {artistRows.map((rowArtists, rowIndex) => {
          if (!rowArtists || rowArtists.length === 0) return null;
          const duplicatedRow = [...rowArtists, ...rowArtists]; // For infinite scroll effect
          const slideClass = rowIndex % 2 === 0 ? 'slide-left' : 'slide-right';
          return (
            <div key={`row-${rowIndex}`} className={`grid-row ${slideClass}`}>
              {duplicatedRow.map((imageUrl, imgIndex) => (
                <div key={`row${rowIndex}-img${imgIndex}`} className="grid-item">
                  <img
                    src={imageUrl || FALLBACK_IMAGE}
                    alt={`Artist ${ARTISTS_BY_ROW[rowIndex][imgIndex % rowArtists.length] || 'image'}`}
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default GridMotion;