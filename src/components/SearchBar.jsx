import { useState } from 'react'
import Logo from "../assets/ChatGPT_Image_3_juin_2025__14_48_42-removebg-preview.png"

function SearchBar({ onSearch, onLogoClick }) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchQuery)
    setSearchQuery("")
  }

  return (
    <div className='nav'>
        <img 
          className='logo' 
          src={Logo} 
          alt="Lyrics App Logo" 
          onClick={onLogoClick}
        />

        <form onSubmit={handleSubmit}>
        <input 
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for a song..."
        />
        <button className='search' type="submit">Search</button>
        </form>
    </div>
  )
}

export default SearchBar