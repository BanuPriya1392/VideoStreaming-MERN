import { API_BASE_URL as BACKEND_API_URL } from "./config";


export const fetchProfile = async () => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = new Error("Failed to fetch profile");
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  return data.data;
};

export const fetchProfileByUsername = async (username) => {
  const response = await fetch(`${BACKEND_API_URL}/auth/profile/${username}`);
  if (!response.ok) throw new Error("User not found");
  const data = await response.json();
  return data.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("nexus_token") || "";
  const response = await fetch(`${BACKEND_API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ profile: profileData }) 
  });
  if (!response.ok) throw new Error("Failed to update profile");
  const data = await response.json();
  return data.data;
};

export const uploadAvatarFile = async (file) => {
  const token = localStorage.getItem("nexus_token") || "";
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${BACKEND_API_URL}/auth/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) throw new Error("Avatar upload failed");
  const data = await response.json();
  return data.data;
};

export const uploadBannerFile = async (file) => {
  const token = localStorage.getItem("nexus_token") || "";
  const formData = new FormData();
  formData.append("banner", file);

  const response = await fetch(`${BACKEND_API_URL}/auth/profile/banner`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) throw new Error("Banner upload failed");
  const data = await response.json();
  return data.data;
};
