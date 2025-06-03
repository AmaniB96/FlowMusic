import SongCard from './SongCard'

function SongResults({ songs, displayLimit, onLoadMore }) {
  if (!songs) return null
  
  return (
    <>
      <h1>Top Songs</h1>
      <div className="results-container">
        {songs.slice(0, displayLimit).map((song, index) => (
          <SongCard key={song.id} song={song} index={index} />
        ))}
      </div>
      
      {songs.length > displayLimit && (
        <button 
          onClick={onLoadMore}
          className="see-more-btn"
        >
          See More
        </button>
      )}
    </>
  )
}

export default SongResults