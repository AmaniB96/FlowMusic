function SongCard({ song, index }) {
  return (
    <div className="song-card" style={{"--index": index}}>
      <div className="song-card__image">
        <img src={song.album.cover_big || song.album.cover_medium} alt={song.album.title} />
        <div className="song-card__play-overlay">
          <div className="song-card__play-btn" onClick={() => {
            const audio = document.getElementById(`audio-${song.id}`);
            audio.paused ? audio.play() : audio.pause();
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="song-card__content">
        <h3 className="song-card__title">{song.title}</h3>
        <p className="song-card__artist">{song.artist.name}</p>
        <p className="song-card__album">{song.album.title}</p>
        <div className="song-card__player">
          <audio id={`audio-${song.id}`} className="snippetBox" controls src={song.preview}></audio>
        </div>
      </div>
    </div>
  )
}

export default SongCard