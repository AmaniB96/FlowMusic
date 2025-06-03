import { useState } from 'react'
import './App.css'
import axios from 'axios'
import GridMotion from './components/GridMotion'
import SearchBar from './components/SearchBar'
import SongResults from './components/SongResults'


function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [displayLimit, setDisplayLimit] = useState(6)
  const [artistImage, setArtistImage] = useState("") 

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${query}`, {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
      setData(response.data.data) 
      if (response.data.data.length > 0) {
        setArtistImage(response.data.data[0].artist.picture_xl)
      }
      setError(null)
    } catch (err) {
      setError('Error fetching data from Deezer')
      console.error(err)
    }
  }

  const handleSeeMore = () => {
    setDisplayLimit(prevLimit => prevLimit + 6)
  }

  const handleLogoClick = () => {
    setData(null)
    setArtistImage("")
    setDisplayLimit(6)
    setError(null)
  }

  return (
    <div className='app' style={{
      backgroundImage: artistImage ? 
        `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${artistImage})` : 
        'none'
    }}>
      <SearchBar onSearch={handleSearch} onLogoClick={handleLogoClick} />

      {error && <p style={{color: 'red'}}>{error}</p>}

      {!data && <GridMotion />}  

      {data && (
        <SongResults 
          songs={data} 
          displayLimit={displayLimit} 
          onLoadMore={handleSeeMore} 
        />
      )}
    </div>
  )
}

export default App