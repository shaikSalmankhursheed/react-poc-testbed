import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VideoRecorderNative from "./components/videoRecorderNative";
import VideoRecorderCustom from "./components/VideoRecorderCustom";
import VideoRecorderNativeTest from "./components/videoRecordNativetest";

function Home() {
  return <h2>Home Page</h2>;
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li style={{ marginBottom: "50px" }}>
              <Link to="/VideoRecorderNative">Native Video</Link>
            </li>
            <li>
              <Link to="/VideoRecorderCustom">Custom Video</Link>
            </li>
            <li>
              <Link to="/VideoRecorderCustomSize">
                Custom Video with sizing
              </Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/VideoRecorderNative"
            element={<VideoRecorderNative />}
          />
          <Route
            path="/VideoRecorderCustom"
            element={<VideoRecorderCustom />}
          />
          VideoRecorderNativeTest
          <Route
            path="/VideoRecorderCustomSize"
            element={<VideoRecorderNativeTest />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
