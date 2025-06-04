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
  console.log('[GridMotion] Component rendering or re-rendering. Timestamp:', Date.now()); 
  const [artistRows, setArtistRows] = useState(() => {
    console.log('[GridMotion] Initializing artistRows state with placeholders.'); 
    return ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE));
  });
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState('');

  const fetchArtistImage = useCallback(async (artistName, isDev, timeout) => {
    console.log(`[GridMotion] fetchArtistImage START for: ${artistName}, isDev: ${isDev}`);
    
    const newProxyUrl = 'https://corsproxy.io/?'; 
    const deezerApiUrl = `https://api.deezer.com/search?q=${encodeURIComponent(artistName)}`;

    let artistSearchUrl;

    if (isDev) {
      // Local development uses Vite's proxy
      artistSearchUrl = `/api/search?q=${encodeURIComponent(artistName)}`;
    } else {
      // The target URL needs to be encoded before appending to corsproxy.io
      artistSearchUrl = `${newProxyUrl}${encodeURIComponent(deezerApiUrl)}`;
    }

    try {
      console.log(`[GridMotion] Fetching image for ${artistName} from: ${artistSearchUrl}`); 
      const response = await axios.get(artistSearchUrl, { timeout });
      console.log(`[GridMotion] Response for ${artistName}:`, response.status, response.data); 
      
      const deezerData = response.data; 

      if (deezerData.data && deezerData.data.length > 0 && deezerData.data[0].artist && deezerData.data[0].artist.picture_xl) {
        console.log(`[GridMotion] Found image for ${artistName}: ${deezerData.data[0].artist.picture_xl}`); 
        return deezerData.data[0].artist.picture_xl; 
      } else {
        console.warn(`[GridMotion] No valid image data for ${artistName}, using fallback. Data:`, deezerData); 
        return FALLBACK_IMAGE;
      }
    } catch (error) {
      console.error(`[GridMotion] Error fetching image for ${artistName}:`, error.message, error.code); 
      if (error.response) {
        console.error('[GridMotion] Proxy/API Error for image:', error.response.data, error.response.status);
      }
      return FALLBACK_IMAGE;
    }
  }, []);

  useEffect(() => {
    console.log('[GridMotion] useEffect triggered. Timestamp:', Date.now()); 
    const loadAllImages = async () => {
      console.log('[GridMotion] loadAllImages START. Timestamp:', Date.now()); 
      setLoading(true);
      setLoadMessage('');
      const isDev = import.meta.env.DEV;
      const requestTimeout = isDev ? 5000 : 20000;

      const cachedData = localStorage.getItem('artistImages');
      const cacheTimestamp = localStorage.getItem('artistImagesTimestamp');
      console.log('[GridMotion] Cache check - Cached data:', cachedData ? "Exists" : "None", "Timestamp:", cacheTimestamp); // NEW LOG


      if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 24 * 60 * 60 * 1000) {
        console.log("[GridMotion] Attempting to use cached data");
        try {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.length === ARTISTS_BY_ROW.length && parsedData.every((r, i) => r.length === ARTISTS_BY_ROW[i].length)) {
            console.log("[GridMotion] Valid cache found, setting artistRows from cache."); 
            setArtistRows(parsedData);
            setLoading(false);
            return; 
          } else {
            console.warn("[GridMotion] Cached data structure mismatch, clearing cache.");
            localStorage.removeItem('artistImages');
            localStorage.removeItem('artistImagesTimestamp');
          }
        } catch (_e) { 
            console.warn("[GridMotion] Failed to parse cached artist images, clearing cache. Error:", _e); 
            localStorage.removeItem('artistImages');
            localStorage.removeItem('artistImagesTimestamp');
        }
      } else {
         console.log("[GridMotion] No valid cache or cache expired, proceeding to fetch images."); 
      }
      
      setArtistRows(ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE)));
      console.log("[GridMotion] Initialized/Reset artistRows with placeholders before fetch."); 


      let successfulLoads = 0;
      const totalImagesToLoad = ARTISTS_BY_ROW.flat().length;
      const newArtistRowsData = [...ARTISTS_BY_ROW.map(row => Array(row.length).fill(FALLBACK_IMAGE))];
      console.log(`[GridMotion] Starting to fetch ${totalImagesToLoad} images row by row.`);


      for (let rowIndex = 0; rowIndex < ARTISTS_BY_ROW.length; rowIndex++) {
        console.log(`[GridMotion] Fetching images for row ${rowIndex}`); 
        const currentRowArtists = ARTISTS_BY_ROW[rowIndex];
        const rowImagePromises = currentRowArtists.map(artistName => 
          fetchArtistImage(artistName, isDev, requestTimeout)
        );
        
        const imagesForThisRow = await Promise.all(rowImagePromises);
        console.log(`[GridMotion] Images fetched for row ${rowIndex}:`, imagesForThisRow); 
        newArtistRowsData[rowIndex] = imagesForThisRow;
        successfulLoads += imagesForThisRow.filter(img => img !== FALLBACK_IMAGE).length;

        setArtistRows(prevRows => {
            const updatedRows = [...prevRows];
            updatedRows[rowIndex] = imagesForThisRow;
            return updatedRows;
        });
      }

      console.log(`[GridMotion] Finished fetching all rows. Successful loads: ${successfulLoads}/${totalImagesToLoad}`); // NEW LOG
      
      const hasAtLeastOneRealImage = newArtistRowsData.flat().some(imageUrl => imageUrl !== FALLBACK_IMAGE);

      if (hasAtLeastOneRealImage) {
        localStorage.setItem('artistImages', JSON.stringify(newArtistRowsData));
        localStorage.setItem('artistImagesTimestamp', Date.now().toString());
      } else {
        localStorage.removeItem('artistImages');
        localStorage.removeItem('artistImagesTimestamp');
      }


      if (!isDev && totalImagesToLoad > 0 && successfulLoads < totalImagesToLoad * 0.75) { 
        setLoadMessage('Some artist images could not be loaded due to network issues. Displaying available data.');
      }
      setLoading(false);
      console.log('[GridMotion] loadAllImages finished. Timestamp:', Date.now()); // NEW LOG
    };

    loadAllImages();
    console.log('[GridMotion] loadAllImages() called from useEffect. Timestamp:', Date.now()); // NEW LOG

    return () => {
      console.log('[GridMotion] useEffect cleanup (unmounting or re-running). Timestamp:', Date.now()); // NEW LOG for StrictMode
    };
  }, [fetchArtistImage]);

  console.log('[GridMotion] Rendering JSX. Loading:', loading, 'Message:', loadMessage, 'artistRows sample:', artistRows[0] ? artistRows[0][0] : 'empty'); // NEW LOG

  if (loading && artistRows.flat().every(img => img === FALLBACK_IMAGE)) {
    console.log('[GridMotion] Rendering Loading component.'); // NEW LOG
    return <Loading />;
  }

  return (
    <>
      {loadMessage && <p style={{ textAlign: 'center', color: 'orange', padding: '10px' }}>{loadMessage}</p>}
      <div className="grid-container">
        {artistRows.map((rowArtists, rowIndex) => {
          if (!rowArtists || rowArtists.length === 0) return null;
          const duplicatedRow = [...rowArtists, ...rowArtists]; 
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