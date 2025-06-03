import './Loading.css'
import Logo from "../assets/ChatGPT_Image_3_juin_2025__14_48_42-removebg-preview.png"

function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img src={Logo} alt="Logo" className="bouncing-logo" />
        <div className="loading-text">
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  )
}

export default Loading