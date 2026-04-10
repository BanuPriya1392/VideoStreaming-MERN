// Use env override to switch sources easily
const SHEETY_API_URL =
  import.meta.env.VITE_SHEETY_API_URL ||
  "https://api.sheety.co/d61260f6816cba31f23a7b2706a55d31/videos/sheet1";
import { API_BASE_URL as BACKEND_API_URL, SERVER_URL } from "./config";


const resolveMediaUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return `${SERVER_URL}${url}`;
};

async function fetchFromBackend(category = "All", searchTerm = "") {
  const url = new URL(`${BACKEND_API_URL}/videos`);
  if (category && category !== "All") url.searchParams.append("tag", category);
  if (searchTerm) url.searchParams.append("search", searchTerm);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Backend Error: ${response.statusText}`);

  const data = await response.json();
  const rawArray = data.data || [];
  // Adapt MongoDB _id to the generic id expected by React and resolve URLs
  return rawArray.map((v) => ({
    ...v,
    id: v._id || v.id,
    url: resolveMediaUrl(v.url),
    thumbnail: resolveMediaUrl(v.thumbnail)
  }));
}

/**
 * Upload a new video to the backend
 */
export const uploadVideoMetadata = async (videoData) => {
  const token = localStorage.getItem("nexus_token") || ""; // Optional auth token
  const response = await fetch(`${BACKEND_API_URL}/videos/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(videoData)
  });
  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.data;
};

export const uploadVideoFile = async (formData) => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/videos/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.data;
};

export const deleteVideoRequest = async (id) => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/videos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Delete failed");
  return response.json();
};

/**
 * Get AI Tags directly from backend (Secure architecture)
 */
export const getBackendAITags = async (title, description) => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/ai/tag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description })
  });
  if (!response.ok) throw new Error("AI Analysis failed");
  const data = await response.json();
  // Return the full data object so we can use suggested descriptions too
  return data;
};

/**
 * Fetch many videos (with optional filtering by category or search term)
 */
export const fetchVideos = async (category = "All", searchTerm = "") => {
  try {
    return await fetchFromBackend(category, searchTerm);
  } catch (error) {
    console.error("Failed to fetch videos from backend:", error);
    return [];
  }
};

/**
 * Fetch a specific video by its ID
 */
export const fetchVideoById = async (id) => {
  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/videos/${id}`);
    if (!backendResponse.ok) throw new Error("Video not found");
    const backendData = await backendResponse.json();
    const videoObj = backendData.data;
    if (videoObj) {
      videoObj.id = videoObj._id || videoObj.id;
      videoObj.url = resolveMediaUrl(videoObj.url);
      videoObj.thumbnail = resolveMediaUrl(videoObj.thumbnail);
    }
    return videoObj || null;
  } catch (error) {
    console.error(`Error fetching video with ID ${id}:`, error);
    return null;
  }
};

export const fetchComments = async (videoId) => {
  const response = await fetch(`${BACKEND_API_URL}/videos/${videoId}/comments`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  const data = await response.json();
  return data.data;
};

export const postComment = async (videoId, text) => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/videos/${videoId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error("Failed to post comment");
  const data = await response.json();
  return data.data;
};

export const fetchRecommendations = async (videoId) => {
  const response = await fetch(`${BACKEND_API_URL}/videos/${videoId}/recommendations`);
  if (!response.ok) throw new Error("Failed to fetch recommendations");
  const data = await response.json();
  return data.data.map(v => ({
    ...v,
    id: v._id || v.id,
    url: resolveMediaUrl(v.url),
    thumbnail: resolveMediaUrl(v.thumbnail)
  }));
};
