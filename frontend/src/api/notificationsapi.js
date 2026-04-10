const BACKEND_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("nexus_token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

export const fetchNotifications = async () => {
  if (!localStorage.getItem("nexus_token")) return [];
  try {
    const response = await fetch(`${BACKEND_API_URL}/notifications`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (err) {
    return false;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (err) {
    return false;
  }
};

export const clearAllNotifications = async () => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/notifications`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (err) {
    return false;
  }
};
