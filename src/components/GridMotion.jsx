import { useState, useEffect } from 'react'
import axios from 'axios'
import './GridMotion.css'
import Loading from './Loading'

function GridMotion() {
  const [artistRows, setArtistRows] = useState([[], [], []])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      const artistsByRow = [
        ['drake', 'beyonce', 'aya nakamura', 'asake', 'rihanna', 'adele', 'weeknd', 'ayra starr'],
        ['dave', 'central cee', 'burna boy', 'wizkid', 'skepta', 'stormzy', 'clavish', 'ateyaba'],
        ['ninho', 'pnl', 'booba', 'jul', 'gazo', 'tiakola', 'klm', 'dadju']
      ]
      
      // Try to get cached images from localStorage
      const cachedData = localStorage.getItem('artistImages')
      
      // If we have cache, use it immediately and stop loading
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        setArtistRows(parsedData)
        
        // Check if cache is recent (less than 24 hours old)
        const cacheTimestamp = localStorage.getItem('artistImagesTimestamp')
        const isRecent = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 24 * 60 * 60 * 1000
        
        // If cache is recent, don't refetch and stop loading
        if (isRecent) {
          setLoading(false)
          return
        }
      }
      
      // Set placeholders if no cache is available but keep loading true
      if (!cachedData) {
        const placeholders = artistsByRow.map(row => Array(row.length).fill('https://via.placeholder.com/150'))
        setArtistRows(placeholders)
      }
      
      try {
        // Fetch images for all rows in parallel
        const newRows = []
        
        for (let rowIndex = 0; rowIndex < artistsByRow.length; rowIndex++) {
          const artists = artistsByRow[rowIndex]
          
          // Create an array of promises for this row
          const rowPromises = artists.map(async (artist) => {
            try {
              const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.deezer.com/search?q=${artist}`)}`)
              const data = JSON.parse(response.data.contents)
              
              if (data.data && data.data.length > 0) {
                return data.data[0].artist.picture_xl
              }
              return fallbackImage
            } catch (err) {
              console.error(`Error fetching ${artist}:`, err)
              return fallbackImage
            }
          })
          
          // Wait for all promises in this row to resolve
          const results = await Promise.all(rowPromises)
          newRows.push(results)
        }
        
        // Update state with the new images
        setArtistRows(newRows)
        
        // Save to localStorage
        localStorage.setItem('artistImages', JSON.stringify(newRows))
        localStorage.setItem('artistImagesTimestamp', Date.now().toString())
        
      } catch (err) {
        console.error('Error fetching artists:', err)
      } finally {
        // Always stop loading when done (success or error)
        setLoading(false)
      }
    }
    
    loadImages()
  }, [])

  // Show loading component while fetching
  if (loading) {
    return <Loading />
  }

  // Show grid when loading is complete
  return (
    <div className="grid-container">
      {artistRows.map((rowArtists, rowIndex) => {
        if (rowArtists.length === 0) return null
        
        const duplicatedRow = [...rowArtists, ...rowArtists]
        const slideClass = rowIndex % 2 === 0 ? 'slide-left' : 'slide-right'
        
        return (
          <div key={`row-${rowIndex}`} className={`grid-row ${slideClass}`}>
            {duplicatedRow.map((imageUrl, index) => (
              <div key={`row${rowIndex}-${index}`} className="grid-item">
                <img 
                  src={imageUrl} 
                  alt={`Artist ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150'
                  }}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default GridMotion