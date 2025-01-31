import { useState } from "react";
import axios from "axios";



export default function App() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/token/`, {
        email: username,
        password: password,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.data && response.data.data.length > 0) {
        setAccessToken(response.data.data[0].access_token);
      } else {
        throw new Error("Invalid credentials or unexpected response format");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!accessToken) return;
    setError(null);
    setLoading(true);

    try {
      const studentId = username; // Extract student ID from email
      const response = await axios.get(
        `${API_URL}/api/student-details/${studentId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }, // Pass token
        }
      );

      if (!response.data.success) {
        setStudentData(response.data.data);
      } else {
        setError("Failed to fetch student details.");
        console.log(response);
      }
    } catch (err) {
      setError("Error fetching student data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="flex flex-col items-center min-h-screen bg-white p-6">
      <h1 className="text-3xl font-semibold text-black mb-8">xIRAS</h1>
      {!accessToken ? (
        <>
        <form className="bg-white p-8 rounded-lg shadow-xl w-96 border" onSubmit={handleLogin}>
          <h2 className="text-2xl font-semibold text-black mb-6">Login</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <label className="block mb-4">
            <span className="text-black">Username:</span>
            <input
              type="text"
              className="w-full p-3 border-2 border-gray-300 rounded mt-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your student id"
            />
          </label>
          <label className="block mb-6">
            <span className="text-black">Password:</span>
            <input
              type="password"
              className="w-full p-3 border-2 border-gray-300 rounded mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your encrypted IRAS password"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="p-8"><strong>Clone or download the <a className="underline" href="https://github.com/itsal-me/Capture-IRAS">"Capture IRAS"</a> git repository to your computer. Since it's a browser extension, enable Developer Mode in your Chrome-based browser and upload the extension in the "Extensions" section. Follow the instructions of "readme.md" file in git repository to upload it. Use it after logging into IRAS to capture your encrypted password.</strong></p>
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 border">
          <h2 className="text-2xl font-semibold text-black mb-6">Welcome to xIRAS!</h2>
          <button
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
            onClick={fetchStudentData}
            disabled={loading}
          >
            {loading ? "Fetching Data..." : "Load Your Data"}
          </button>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {studentData && (
            <div className="mt-6 text-left text-black">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <p><strong>Name:</strong> {studentData.studentName}</p>
              <p><strong>ID:</strong> {studentData.studentId}</p>
              <p><strong>CGPA:</strong> {studentData.cgpa}</p>
              <p><strong>Major:</strong> {studentData.firstMajor}</p>
              <p><strong>Email:</strong> {studentData.email}</p>
            </div>
          )}
        </div>
      )}
    </div>
    
  );
}
