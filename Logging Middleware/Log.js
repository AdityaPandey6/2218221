import axios from 'axios';

const BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiI4ODAwNDYxNTk2ZEBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTgyODIsImlhdCI6MTc1MjU1NzM4MiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImYwZTU5N2FiLWE3ZWEtNGY2NC1iZTlmLWY2NGZkMWIxYjIwNSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImFkaXR5YSBwYW5kZXkiLCJzdWIiOiJjZDBkMTk1Ni02MjIxLTQ2NTUtYTQ5OS00NmE5ODc1NzAyYTUifSwiZW1haWwiOiI4ODAwNDYxNTk2ZEBnbWFpbC5jb20iLCJuYW1lIjoiYWRpdHlhIHBhbmRleSIsInJvbGxObyI6IjIyMTgyMjEiLCJhY2Nlc3NDb2RlIjoiUUFoRFVyIiwiY2xpZW50SUQiOiJjZDBkMTk1Ni02MjIxLTQ2NTUtYTQ5OS00NmE5ODc1NzAyYTUiLCJjbGllbnRTZWNyZXQiOiJtTm5mVXhWU0JOUE1xZ1pBIn0.yDr3kkSONQoAa3Qu2iNWLmU0f_6vIKwx_jKwhfCd8cE";

export async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(
      `${BASE_URL}/logs`,
      {
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: pkg.toLowerCase(),
        message: message
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    console.log("Log created:", response.data);
  } catch (error) {
    console.error("Failed to create log:", error.response ? error.response.data : error.message);
  }
}
