import React, { useState, useEffect, useContext, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  History,
  PlusSquare,
  Video,
  Tag,
  Upload,
  Loader2,
  X,
  FileText,
  Type,
  ExternalLink,
  Mic,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { AuthContext } from "../App";
import { getBackendAITags, uploadVideoFile } from "../api/videosapi";
import { SERVER_URL } from "../api/config";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "../api/notificationsapi";
import { fetchProfile } from "../api/authapi";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Upload Functional States
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [aiTags, setAiTags] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [duration, setDuration] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
    } else if (location.pathname !== "/explore") {
      setSearchQuery("");
    }
  }, [location.pathname, location.search]);

  const [notifications, setNotifications] = useState([]);

  // Fetch notifications and profile on mount
  useEffect(() => {
    if (user && !user.isGuest) {
      fetchNotifications().then(setNotifications);
      fetchProfile()
        .then(setProfile)
        .catch((err) => console.error("Header profile fetch failed", err));
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    const success = await markNotificationRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    const success = await markAllNotificationsRead();
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleClearNotifications = async (e) => {
    e.stopPropagation();
    const success = await clearAllNotifications();
    if (success) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const query = searchQuery.trim();
      navigate(`/explore${query ? `?q=${encodeURIComponent(query)}` : ""}`, {
        replace: true,
      });
      e.target.blur();
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Your browser does not support voice search. Please try Chrome or Edge.",
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log("Voice Search: Listening...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ");
      const cleanedTranscript = transcript.trim().replace(/[.!?]+$/, "");
      console.log("Voice Search Result:", transcript, "=>", cleanedTranscript);
      if (cleanedTranscript) {
        setSearchQuery(cleanedTranscript);
        navigate(`/explore?q=${encodeURIComponent(cleanedTranscript)}`, {
          replace: true,
        });
      } else {
        console.warn("Voice Search: No transcript captured.");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      if (event.error === "not-allowed") {
        alert(
          "Microphone access denied. Please enable microphone permissions in your browser settings.",
        );
      } else if (event.error !== "no-speech") {
        alert(`Voice search error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Voice Search: Stopped.");
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice search:", err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowNotifications(false);
      setShowAccountMenu(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = Math.max(video.duration * 0.1, 0.5);
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const thumbFile = new File([blob], "thumbnail.jpg", {
              type: "image/jpeg",
            });
            const duration = video.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const durationStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            resolve({ thumbFile, duration: durationStr });
          },
          "image/jpeg",
          0.7,
        );
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(baseName.replace(/\b\w/g, (l) => l.toUpperCase()));
      const { thumbFile, duration: capturedDuration } =
        await generateThumbnail(file);
      setThumbnailFile(thumbFile);
      setDuration(capturedDuration);
    }
  };

  const handleGetTags = async () => {
    if (!title)
      return alert("Please provide a title for AI analysis.");
    setIsAnalyzing(true);
    try {
      const result = await getBackendAITags(title, description);
      setAiTags(result.hashtags || [result.tag] || ["Other"]);
      
      // If description is empty or very short, use the AI suggested description
      if (result.description && (!description || description.length < 10)) {
        setDescription(result.description);
      }
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Falling back to simple tags.");
      setAiTags(["Other"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinalUpload = async () => {
    setUploadStatus("uploading");
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 20, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("title", title || "Unknown Title");
      formData.append("description", description || "");
      formData.append("tag", aiTags[0] || "Other");
      aiTags.forEach((t) => formData.append("tags[]", t));
      formData.append(
        "author",
        user?.username || user?.name || "Neural Operative",
      );
      formData.append("duration", duration || "0:00");
      formData.append("videoFile", videoFile);
      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }

      await uploadVideoFile(formData);

      if (user) {
        fetchNotifications().then(setNotifications);
      }

      clearInterval(interval);
      setProgress(100);
      setUploadStatus("success");

      setTimeout(() => {
        setShowUploadModal(false);
        resetForm();
        window.location.reload();
      }, 1500);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert("Uplink failed. Ensure your backend is running.");
      setUploadStatus("idle");
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle("");
    setDescription("");
    setAiTags([]);
    setThumbnailFile(null);
    setUploadStatus("idle");
    setProgress(0);
  };

  const resolveUrl = (url) => {
    if (!url) return url;
    if (url.startsWith("http")) return url;
    return `${SERVER_URL}${url}`;
  };



  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white flex font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="bg-[#0A0E1A]/80 backdrop-blur-md p-4 flex justify-between items-center gap-4 border-b border-white/5 relative z-50">
          <div className="relative flex-1 max-w-2xl group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00F0FF]"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={isListening ? "Listening..." : "Search the Nexus..."}
              className={`w-full bg-[#0D1223] border ${isListening ? "border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "border-white/10"} rounded-full py-2.5 pl-12 pr-12 focus:border-[#00F0FF]/50 outline-none text-sm transition-all`}
            />
            <button
              onClick={startVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all flex items-center justify-center ${
                isListening
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Search with your voice"
              aria-pressed={isListening}
            >
              <Mic size={16} />
            </button>
            {isListening && (
              <span className="absolute right-3 top-full mt-2 text-[10px] uppercase tracking-[0.2em] text-[#00F0FF]">
                Listening...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowAccountMenu(false);
                }}
                className={`p-2 rounded-xl transition-all ${showNotifications ? "bg-[#00F0FF]/10 text-[#00F0FF]" : "text-gray-400 hover:text-[#00F0FF]"}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0D1223] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center text-[10px] font-black uppercase text-[#00F0FF] tracking-widest">
                    <span>Signal Log</span>
                    <div className="flex gap-3">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="hover:text-white transition-colors"
                      >
                        Mark All Read
                      </button>
                      <button
                        onClick={handleClearNotifications}
                        className="hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-xs font-bold">
                        No signals intercepted.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-4 hover:bg-white/5 border-b border-white/5 cursor-pointer flex gap-3 ${!n.isRead ? "bg-[#00F0FF]/5" : ""}`}
                        >
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] mt-1.5 shrink-0" />
                          )}
                          <div>
                            <p
                              className={`text-sm ${!n.isRead ? "font-bold" : "font-medium text-gray-400"}`}
                            >
                              {n.text}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00F0FF] to-[#2D60FF] text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse hover:animate-none group"
            >
              <PlusSquare
                size={16}
                className="group-hover:rotate-90 transition-transform duration-500"
              />{" "}
              Uplink
            </button>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div
                onClick={() => {
                  setShowAccountMenu(!showAccountMenu);
                  setShowNotifications(false);
                }}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#7000FF] p-[1px] cursor-pointer transition-all ${showAccountMenu ? "ring-2 ring-[#00F0FF]" : ""}`}
              >
                <div className="w-full h-full bg-[#0A0E1A] rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                  {profile?.profile?.avatarUrl ? (
                    <img
                      src={resolveUrl(profile.profile.avatarUrl)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
              </div>
              {showAccountMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-[#0D1223] border border-white/10 rounded-3xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 p-4 border-b border-white/5 mb-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[#00F0FF]/20">
                      <img
                        src={
                          resolveUrl(profile?.profile?.avatarUrl) ||
                          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100"
                        }
                        className="w-full h-full object-cover"
                        alt="User"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#00F0FF] uppercase truncate max-w-[160px]">
                        {profile?.username || user?.name || "Neural Operative"}
                      </p>
                      <button
                        onClick={() => navigate("/profile")}
                        className="text-[#55A0FF] text-[10px] font-bold hover:underline mt-1 flex items-center gap-1"
                      >
                        View your channel <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-2 mx-2" />
                  <MenuButton
                    icon={<History size={16} />}
                    text="History Log"
                    onClick={() => navigate("/history")}
                  />
                  <MenuButton
                    icon={<Settings size={16} />}
                    text="Nexus Settings"
                    onClick={() => navigate("/settings")}
                  />
                  <div className="h-px bg-white/5 my-2 mx-2" />
                  <MenuButton
                    icon={<LogOut size={16} />}
                    text="De-authorize Link"
                    color="text-red-400"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* UPLOAD MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0D1223] border border-white/10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Upload className="text-[#00F0FF]" /> Nexus Studio Uplink
                </h2>
                <button
                  onClick={() => {
                    if (uploadStatus !== "uploading") {
                      setShowUploadModal(false);
                      resetForm();
                    }
                  }}
                  className="hover:bg-red-500/20 hover:text-red-500 p-2 rounded-full transition-colors text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Type
                        className="absolute left-3 top-3 text-gray-500"
                        size={18}
                      />
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Video Title"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00F0FF] outline-none"
                      />
                    </div>
                    <div className="relative">
                      <FileText
                        className="absolute left-3 top-3 text-gray-500"
                        size={18}
                      />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description..."
                        rows="4"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#00F0FF] outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleGetTags}
                      disabled={isAnalyzing || !videoFile}
                      className="w-full bg-[#7000FF]/20 border border-[#7000FF]/50 text-[#CCAAFF] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#7000FF]/30 transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Tag size={18} />
                      )}
                      {isAnalyzing
                        ? "ANALYZING NEURAL DATA..."
                        : "GENERATE AI SMART TAGS"}
                    </button>

                    {aiTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-black/40 border border-white/5 rounded-2xl">
                        {aiTags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-black uppercase rounded-lg animate-in fade-in zoom-in-95 duration-300"
                          >
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                    {previewUrl ? (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="text-center cursor-pointer"
                      >
                        <Video
                          size={48}
                          className="text-gray-700 mx-auto mb-2"
                        />
                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                          Select Video Source
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <button
                    onClick={handleFinalUpload}
                    disabled={
                      !videoFile ||
                      aiTags.length === 0 ||
                      uploadStatus !== "idle"
                    }
                    className="w-full bg-[#00F0FF] text-black py-4 rounded-2xl font-black uppercase transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] disabled:grayscale disabled:opacity-50"
                  >
                    {uploadStatus === "uploading"
                      ? `Transmitting ${progress}%`
                      : uploadStatus === "success"
                        ? "Uplink Complete"
                        : "Authorize Uplink"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MenuButton = ({ icon, text, onClick, color = "text-gray-300" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group ${color}`}
  >
    <span className="group-hover:text-[#00F0FF] transition-colors">{icon}</span>
    <span className="text-xs font-bold">{text}</span>
  </button>
);

export default Layout;
