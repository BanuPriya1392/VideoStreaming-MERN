import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Camera,
  Save,
  Edit3,
  Grid,
  List as ListIcon,
  Play,
  Info,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Users,
  Video,
  Trash2,
  Settings2,
  X,
  Upload,
} from "lucide-react";
import { AuthContext } from "../App";
import { SERVER_URL } from "../api/config";
import { fetchProfile, fetchProfileByUsername, updateProfile, uploadAvatarFile, uploadBannerFile } from "../api/authapi";

import { fetchVideos, deleteVideoRequest } from "../api/videosapi";
import VideoCard from "../Components/VideoCard";

const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("Home");
  const [isEditing, setIsEditing] = useState(false);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [videoSort, setVideoSort] = useState("Recent");
  const [editData, setEditData] = useState({
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const tabs = ["Home", "Videos", "About"];
  const { username } = useParams();
  const isOwnProfile =
    !username || username.toLowerCase() === authUser?.username?.toLowerCase() || username.toLowerCase() === authUser?.name?.toLowerCase();

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      let data;
      if (isOwnProfile) {
        data = await fetchProfile();
      } else {
        data = await fetchProfileByUsername(username);
      }
      
      setProfile(data);
      
      if (isOwnProfile) {
        setEditData({
          bio: data.profile?.bio || "",
          avatarUrl: data.profile?.avatarUrl || "",
          bannerUrl: data.profile?.bannerUrl || "",
        });
      }

      const userIdentifier = data.username || data.name || "";
      const myVideos = await fetchVideos("All", "", userIdentifier);
      setUserVideos(myVideos);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [username, authUser.name]);

  const handleUpdate = async () => {
    try {
      const updated = await updateProfile(editData);
      setProfile(updated);
      setIsEditing(false);
      alert("Nexus Identity Synchronized.");
    } catch (err) {
      alert("Synchronization failed.");
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const updatedUser = await uploadAvatarFile(file);
      setProfile(updatedUser);
      setEditData((prev) => ({
        ...prev,
        avatarUrl: updatedUser.profile.avatarUrl,
      }));
    } catch (err) {
      alert("Avatar upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerClick = () => {
    if (isEditing) {
      bannerInputRef.current?.click();
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const updatedUser = await uploadBannerFile(file);
      setProfile(updatedUser);
      setEditData((prev) => ({
        ...prev,
        bannerUrl: updatedUser.profile.bannerUrl,
      }));
    } catch (err) {
      alert("Banner upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Permanently delete this transmission?")) {
      try {
        await deleteVideoRequest(id);
        setUserVideos(userVideos.filter((v) => v.id !== id));
      } catch (err) {
        alert("Deletion failed.");
      }
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A]">
        <div className="w-12 h-12 border-4 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin"></div>
      </div>
    );

  const DEFAULT_BANNER =
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200";
  const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=300";

  // Resolve media URL helper (same logic as videosapi)
  const resolveUrl = (url) => {
    if (!url) return url;
    if (url.startsWith("http")) return url;
    return `${SERVER_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* HIDDEN FILE INPUTS */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleBannerChange}
      />

      {/* CHANNEL BANNER */}
      <section 
        className={`relative h-48 md:h-64 overflow-hidden group border-b border-white/5 ${isEditing ? 'cursor-pointer' : ''}`}
        onClick={handleBannerClick}
      >
        <img
          src={
            isEditing
              ? resolveUrl(editData.bannerUrl) || DEFAULT_BANNER
              : resolveUrl(profile?.profile?.bannerUrl) || DEFAULT_BANNER
          }
          alt="Channel Banner"
          className="w-full h-full object-cover object-center transition-all duration-1000 group-hover:scale-110 contrast-[1.1] brightness-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent opacity-80" />

        {isEditing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-xl space-y-4 bg-[#0D1223]/80 border border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="text-[#00F0FF]" size={16} />
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F0FF]">
                  Visual Branding Uplink
                </label>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editData.bannerUrl}
                  onChange={(e) =>
                    setEditData({ ...editData, bannerUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-[#00F0FF] outline-none transition-all placeholder:text-gray-600"
                />
                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-loose">
                  Enter a direct image URL above, or <span className="text-[#00F0FF] font-black cursor-pointer hover:underline" onClick={handleBannerClick}>click here to upload</span> from your device.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CHANNEL HEADER */}
      <section className="max-w-7xl mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 md:-mt-16">
          {/* AVATAR */}
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#7000FF] p-[3px] shadow-2xl relative z-10">
              <div className="w-full h-full bg-[#0D1223] rounded-full overflow-hidden border-4 border-[#0A0E1A] relative">
                <img
                  src={
                    resolveUrl(profile?.profile?.avatarUrl) || DEFAULT_AVATAR
                  }
                  alt={profile?.username}
                  className={`w-full h-full object-cover ${isUploading ? "opacity-30" : ""}`}
                />

                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="text-[#00F0FF] mb-2" />
                    <span className="text-[10px] font-black uppercase">
                      Change Avatar
                    </span>
                    <span className="text-[8px] text-gray-400 mt-1">
                      Upload from device
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            {isEditing && !isUploading && (
              <div className="absolute bottom-2 right-2 z-20 p-2.5 bg-[#00F0FF] text-black rounded-full shadow-xl hover:scale-110 transition-transform">
                <Camera size={16} />
              </div>
            )}
          </div>

          {/* CHANNEL INFO */}
          <div className="flex-1 pb-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
                {profile?.username}
              </h1>
              <CheckCircle2
                size={18}
                className="text-[#00F0FF]"
                fill="currentColor"
                fillOpacity={0.2}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-400 font-medium">
              <span className="text-white font-bold">
                @nexus_{profile?.username?.toLowerCase()}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> 1.2M Operatives
              </span>
              <span className="flex items-center gap-1">
                <Video size={14} /> {userVideos.length} Transmissions
              </span>
            </div>

            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              {isOwnProfile && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <Settings2 size={14} /> Customize Channel
                  </button>
                  <button
                    onClick={() => {
                      setIsManagementMode(!isManagementMode);
                      if (!isManagementMode) setActiveTab("Videos");
                    }}
                    className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      isManagementMode
                        ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        : "bg-white/10 backdrop-blur-md border border-white/5 hover:bg-white/20"
                    }`}
                  >
                    {isManagementMode ? <X size={14} /> : <Edit3 size={14} />}
                    {isManagementMode ? "Exit Management" : "Manage Videos"}
                  </button>
                </>
              )}
              {isOwnProfile && isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-[#00F0FF] text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                  >
                    <Save size={14} className="inline mr-2" /> Synchronize
                    Identity
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white/5 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {!isOwnProfile && (
                 <button className="bg-[#00F0FF] text-black px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-all">
                   Follow Operative
                 </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CHANNEL TABS */}
      <section className="mt-8 border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-[0.2em] relative transition-all ${
                activeTab === tab
                  ? "text-[#00F0FF]"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00F0FF] rounded-t-full shadow-[0_-2px_10px_rgba(0,240,255,0.5)]" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {activeTab === "Home" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* FEATURED SECTION */}
            {userVideos.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-8 bg-[#0D1223]/40 border border-white/5 rounded-[2.5rem] p-6 lg:p-8">
                <div className="lg:w-[45%] aspect-video rounded-3xl overflow-hidden relative group cursor-pointer shadow-2xl bg-black">
                  {/* BLURRED BACKGROUND */}
                  <img
                    src={userVideos[0].thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-60"
                  />
                  {/* MAIN IMAGE */}
                  <img
                    src={userVideos[0].thumbnail}
                    alt={userVideos[0].title}
                    className="w-full h-full object-contain relative z-10 contrast-[1.1] brightness-[1.1]"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-[#00F0FF] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,240,255,0.5)] scale-90 group-hover:scale-100 transition-transform">
                      <Play fill="currentColor" size={24} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-full inline-block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF]">
                      Featured Transmission
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight italic">
                    {userVideos[0].title}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed italic">
                    {userVideos[0].description ||
                      "Nexus transmission data pending. Standard operative feed initiated."}
                  </p>
                  <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest">
                    {userVideos[0].views} Views • {userVideos[0].time}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <Video size={48} className="mx-auto mb-4 text-gray-700" />
                <h3 className="text-xl font-bold italic uppercase tracking-widest text-gray-500">
                  Your Nexus channel is empty.
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Initialize your first uplink to begin broadcasting.
                </p>
              </div>
            )}

            {/* LATEST UPLINKS (Only if more than 1) */}
            {userVideos.length > 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <Grid className="text-[#00F0FF]" /> Latest Broadcats
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userVideos.slice(1, 4).map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Videos" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-4">
                <button
                  onClick={() => setVideoSort("Recent")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    videoSort === "Recent"
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setVideoSort("Popular")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    videoSort === "Popular"
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  Popular
                </button>
              </div>
              {isManagementMode && (
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-lg">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                    Destructive Mode Active
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userVideos.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-gray-500 uppercase font-black text-xs tracking-[0.2em]">
                    No transmissions found in this sector
                  </p>
                </div>
              ) : (
                [...userVideos]
                  .sort((a, b) => {
                    if (videoSort === "Popular") {
                      const getVal = (v) => {
                        const str = String(v.views || "0").toLowerCase();
                        let num = parseFloat(str);
                        if (str.includes("m")) num *= 1000000;
                        else if (str.includes("k")) num *= 1000;
                        return num;
                      };
                      return getVal(b) - getVal(a);
                    }
                    // Sort by createdAt or id as proxy for date
                    return (
                      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                  })
                  .map((video) => (
                    <div key={video.id} className="relative group/vid">
                      <VideoCard video={video} />
                      {isManagementMode && (
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="absolute top-2 right-2 z-30 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover/vid:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === "About" && (
          <div className="max-w-4xl grid md:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-widest text-[#00F0FF]">
                  Neural Transmission Bio
                </h3>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-[#00F0FF] outline-none h-40 resize-none"
                    placeholder="Enter biosignature data..."
                  />
                ) : (
                  <p className="text-gray-400 leading-relaxed italic">
                    {profile?.profile?.bio ||
                      "No biography transmitted. Initialize neural link to bridge data."}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-widest text-[#00F0FF]">
                  Direct Comm-Link
                </h3>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Mail className="text-[#00F0FF]" />
                  <span className="text-sm font-bold">{profile?.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-[#00F0FF]">
                  Sector Data
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                    <Calendar size={18} />
                    <span className="text-xs font-bold uppercase transition-colors hover:text-[#00F0FF]">
                      Joined {new Date(profile?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                    <Users size={18} />
                    <span className="text-xs font-bold uppercase transition-colors hover:text-[#00F0FF]">
                      1,241,562 Operatives
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
