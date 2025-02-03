import { useState, useEffect } from "react";
import axios from "axios";
import { FiLogOut } from "react-icons/fi";

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoadingStudent(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/token/`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.data?.length > 0) {
        setAccessToken(response.data.data[0].access_token);
      } else {
        throw new Error("Invalid credentials or unexpected response format");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchStudentData = async () => {
    if (!accessToken) return;
    setError(null);
    setLoadingStudent(true);

    try {
      const studentId = username;
      const response = await axios.get(
        `${API_URL}/api/student-details/${studentId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.data.success) {
        setStudentData(response.data.data);
      } else {
        setError("Failed to fetch student details.");
      }
    } catch (err) {
      setError("Error fetching student data.");
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchCourses = async () => {
    if (!accessToken) return;
    setError(null);
    setLoadingCourses(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/courses/${username}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.data.success) {
        setCourses(response.data.data);
      } else {
        setError("Failed to fetch courses.");
      }
    } catch (err) {
      setError("Error fetching course data.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchStudentData();
    }
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-white flex">
      {!accessToken ? (
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl font-bold mb-8">xIRAS</h1>
          <form
            className="bg-gray-100 p-8 rounded-lg shadow-xl w-96 border border-gray-300"
            onSubmit={handleLogin}
          >
            <h2 className="text-2xl font-semibold mb-6">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <label className="block mb-4">
              <span className="font-medium">Username:</span>
              <input
                type="text"
                className="w-full p-3 border border-gray-400 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your student ID"
              />
            </label>

            <label className="block mb-6">
              <span className="font-medium">Password:</span>
              <input
                type="password"
                className="w-full p-3 border border-gray-400 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your encrypted IRAS password"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-300"
              disabled={loadingStudent}
            >
              {loadingStudent ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex w-full">
          {/* Sidebar */}
          <aside className="w-64 bg-black text-white min-h-screen p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold">xIRAS</h2>
              <nav className="mt-10">
                <ul className="space-y-4">
                  <li className="text-lg font-medium">Dashboard</li>
                  <li className="text-lg font-medium">Courses</li>
                </ul>
              </nav>
            </div>
            <button
              className="flex items-center space-x-2 text-white bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-all"
              onClick={() => setAccessToken(null)}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-10 bg-gray-50">
            <h2 className="text-4xl font-bold">Welcome, {studentData?.studentName || "Student"}!</h2>
            <p className="text-gray-600 mt-2">Your academic details are below.</p>

            {/* Student Information */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
                <h3 className="text-xl font-semibold">Student Info</h3>
                <p className="mt-2"><strong>ID:</strong> {studentData?.studentId || "N/A"}</p>
                <p><strong>Major:</strong> {studentData?.firstMajor || "N/A"}</p>
                <p><strong>Email:</strong> {studentData?.email || "N/A"}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
                <h3 className="text-xl font-semibold">CGPA</h3>
                <p className="text-3xl font-bold mt-2">{studentData?.cgpa || "N/A"}</p>
              </div>
            </div>

            {/* Course List */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 mt-6">
              <h3 className="text-xl font-semibold">Courses</h3>
              {courses ? (
                <ul className="mt-4 space-y-2">
                  {courses.map((course, index) => (
                    <li key={index} className="border-b border-gray-300 py-2">{course}</li>
                  ))}
                </ul>
              ) : (
                <button
                  className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all duration-300 mt-4"
                  onClick={fetchCourses}
                  disabled={loadingCourses}
                >
                  {loadingCourses ? "Loading..." : "Fetch Courses"}
                </button>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
