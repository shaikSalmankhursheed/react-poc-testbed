import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VideoRecorder from "./components/videoRecorder";
import VideoRecorderCapture from "./components/videoRecorderCapture";

function Home() {
  return <h2>Home Page</h2>;
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/videotest">Desktop</Link>
            </li>
            <li>
              <Link to="/videotestcapture">mobile</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videotest" element={<VideoRecorder />} />

          <Route path="/videotestcapture" element={<VideoRecorderCapture />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
