import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ThumbsUp, Reply, ChevronDown, Trash2, X, Copy, MessageSquare, Send, User, Play, Clock, CheckCircle2 } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaPinterest, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { fetchVideos, fetchVideoById, deleteVideoRequest, fetchComments, postComment, fetchRecommendations } from "../api/videosapi.js";
import { useLibrary } from "../context/LibraryContext";
import { AuthContext } from "../App";

const VideoDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Destructure library logic from context
  const { addToHistory, toggleLike, likedVideos, toggleWatchlist, watchlist } = useLibrary();

  const [videoData, setVideoData] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(
    location.state?.showDetails || false,
  );
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportText, setExportText] = useState("Copy");
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const videoRef = useRef(null);

  // Autoplay removed to ensure sound works properly when user clicks play.
  // The user will initiate playback manually.

  // Check if current video is liked by looking at the global state
  const isLiked = videoData
    ? likedVideos.some((v) => v.id === videoData.id)
    : false;

  const isSavedToWatchlist = videoData
    ? watchlist.some((v) => (v.id || v._id) === (videoData.id || videoData._id))
    : false;

  const getYouTubeId = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  useEffect(() => {
    const loadData = async () => {
      setVideoData(null); // Force loading spinner on immediate switch
      const data = await fetchVideoById(id);
      setVideoData(data);

      if (data) {
        addToHistory(data);
        
        // Load Dynamic Data
        try {
          const [related, cms] = await Promise.all([
            fetchRecommendations(id),
            fetchComments(id)
          ]);
          setRelatedVideos(related || []);
          setComments(cms || []);
        } catch (err) {
          console.error("Failed to load related signals:", err);
          setRelatedVideos([]);
          setComments([]);
        }
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, [id]); // Removed addToHistory to prevent infinite re-renders

  const handleVideoSwitch = (videoId) => {
    navigate(`/video/${videoId}`, { state: { autoPlay: true } });
  };

  const handleExport = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const linkToCopy = videoData?.url || window.location.href;
    navigator.clipboard.writeText(linkToCopy);
    setExportText("Copied!");
    setTimeout(() => setExportText("Copy"), 2000);
  };
  
  // Social Share Generators
  const shareUrl = videoData?.url || window.location.href;
  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(videoData?.title + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(videoData?.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(videoData?.title)}`
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this transmission?")) {
      try {
        await deleteVideoRequest(videoData._id || videoData.id);
        navigate("/home");
      } catch (err) {
        alert("Failed to delete the video.");
      }
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const cms = await postComment(id, newComment);
      setComments([cms, ...comments]);
      setNewComment("");
    } catch (err) {
      alert("Please login to post comments.");
    } finally {
      setIsPosting(false);
    }
  };

  const isOwner = user && videoData && user.name === videoData.author;

  if (!videoData) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const videoId = getYouTubeId(videoData.url);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-[#0A0E1A] min-h-screen text-white">
      <div className="flex-1 space-y-6">
        {/* PLAYER BOX */}
        <div className="aspect-video bg-black rounded-[2rem] overflow-hidden border border-[#00F0FF]/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={videoData.title}
            />
          ) : (
            <video
              ref={videoRef}
              key={videoData.id}
              src={videoData.url}
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* INFO SECTION */}
        <div className="space-y-4">
          {videoData.tags && videoData.tags.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-1">
              {videoData.tags.map((tag, idx) => (
                <span key={idx} className="text-[#00F0FF] text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tighter">
            {videoData.title}
          </h1>
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <Link to={`/profile/${videoData.author}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-[#00F0FF] to-[#7B68EE] p-0.5">
                <div className="w-full h-full bg-[#0D1223] overflow-hidden rounded-full flex items-center justify-center font-bold text-[#00F0FF]">
                  {videoData.authorAvatar ? (
                    <img src={videoData.authorAvatar} alt={videoData.author} className="w-full h-full object-cover" />
                  ) : (
                    videoData.author ? videoData.author[0] : "N"
                  )}
                </div>
              </div>
              <div>
                <p className="font-bold flex items-center gap-1">
                   {videoData.author} 
                   <CheckCircle2 size={14} className="text-[#00F0FF]" />
                </p>
                <p className="text-xs text-gray-500">
                  {videoData.duration || "0:00"} • {videoData.views} Views • Sector {id}
                </p>
              </div>
            </Link>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleLike(videoData)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isLiked
                    ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "bg-white/5 hover:bg-white/10 text-white border border-transparent"
                }`}
              >
                <ThumbsUp
                  size={18}
                  className={isLiked ? "fill-[#00F0FF]" : ""}
                />
                <span className="text-sm font-bold">
                  {isLiked ? "Liked" : "Like"}
                </span>
              </button>

              <button
                onClick={() => toggleWatchlist(videoData)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isSavedToWatchlist
                    ? "bg-[#7B68EE]/20 text-[#7B68EE] border border-[#7B68EE]/50 shadow-[0_0_15px_rgba(123,104,238,0.2)]"
                    : "bg-white/5 hover:bg-white/10 text-white border border-transparent"
                }`}
              >
                <Clock
                  size={18}
                  className={isSavedToWatchlist ? "fill-[#7B68EE]" : ""}
                />
                <span className="text-sm font-bold">
                  {isSavedToWatchlist ? "Saved" : "Watch Later"}
                </span>
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 px-5 py-2 rounded-full transition-all duration-200 border border-white/10 hover:border-white/25 group"
              >
                <Reply
                  size={20}
                  style={{ transform: 'scaleX(-1)' }}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <span className="text-sm font-semibold tracking-wide">Share</span>
              </button>
              
              {isOwner && (
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 px-4 py-2 rounded-full transition-colors border border-red-500/20"
                >
                  <Trash2 size={18} />{" "}
                  <span className="text-sm font-bold">Delete</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F0FF]">
                Transmission Log
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDescriptionExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
            {isDescriptionExpanded && (
              <p className="mt-4 text-sm text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-2">
                {videoData.description}
              </p>
            )}
          </div>

          {/* COMMENTS SECTION */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare size={20} className="text-[#00F0FF]" /> {comments.length} Signals Intercepted
            </h3>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {user ? (user.username?.[0] || user.name?.[0] || "?").toUpperCase() : <User size={20} />}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a transmission log..."
                  className="w-full bg-white/5 border-b border-white/10 py-2 focus:border-[#00F0FF] outline-none resize-none px-4 rounded-xl"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setNewComment("")}
                    className="px-4 py-1.5 text-sm font-bold opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isPosting}
                    className="bg-[#00F0FF] text-black px-6 py-1.5 rounded-full text-sm font-black uppercase disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 flex items-center justify-center shrink-0 font-bold border border-white/5 uppercase">
                    {(comment.user?.username || "N")[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold hover:text-[#00F0FF] cursor-pointer">@{comment.user?.username || "NeuralOperative"}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="lg:w-80 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F0FF]/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" /> Next Transmissions
          </h3>
          <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">Sector Feed</span>
        </div>

        <div className="space-y-4">
          {relatedVideos.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Searching frequencies... <br/> No matching signals found.
              </p>
            </div>
          ) : relatedVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoSwitch(video.id)}
              className="group cursor-pointer flex gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/5"
            >
              <div className="w-32 h-20 bg-gray-900 rounded-xl overflow-hidden shrink-0 relative border border-white/5">
                <img
                  src={video.thumbnail}
                  className="w-full h-full object-cover filter contrast-[1.1] brightness-[1.1] transition-transform duration-500 group-hover:scale-110"
                  alt={video.title}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={16} fill="white" className="text-white scale-75 group-hover:scale-100 transition-transform" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-black text-[#00F0FF] border border-[#00F0FF]/20 z-10">
                  {video.duration || "0:00"}
                </span>
              </div>
              <div className="flex flex-col justify-center gap-1">
                <h4 className="text-[12px] font-bold line-clamp-2 leading-tight text-gray-200 group-hover:text-[#00F0FF] transition-colors">
                  {video.title}
                </h4>
                <div className="flex flex-col">
                  <p className="text-[10px] text-gray-500 font-medium uppercase truncate">
                    {video.author}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold opacity-40">
                    {video.views} Views
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* SHARE MODAL OVERLAY */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white text-black w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Share</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors text-black"
              >
                <X size={24} />
              </button>
            </div>

            {/* SOCIAL CIRCLES */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              
              <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] group/item">
                <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-[#25D366]/20">
                  <FaWhatsapp size={28} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover/item:text-[#25D366] transition-colors">WhatsApp</span>
              </a>

              <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] group/item">
                <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-[#1877F2]/20">
                  <FaFacebook size={28} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover/item:text-[#1877F2] transition-colors">Facebook</span>
              </a>

              <a href={shareLinks.pinterest} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] group/item">
                <div className="w-14 h-14 rounded-full bg-[#E60023] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-[#E60023]/20">
                  <FaPinterest size={28} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover/item:text-[#E60023] transition-colors">Pinterest</span>
              </a>

              <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] group/item">
                <div className="w-14 h-14 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-[#0A66C2]/20">
                  <FaLinkedin size={28} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover/item:text-[#0A66C2] transition-colors">LinkedIn</span>
              </a>

              <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[70px] group/item">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-black/20">
                  <FaXTwitter size={24} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover/item:text-black transition-colors">X</span>
              </a>

            </div>

            {/* COPY LINK BOX */}
            <div className="mt-4 flex items-center bg-transparent border border-gray-300 rounded-2xl p-1 px-3 w-full">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="bg-transparent border-none outline-none flex-1 text-gray-700 text-sm px-2 truncate"
              />
              <button 
                onClick={handleCopyLink}
                className="bg-[#2D60FF] hover:bg-[#1a4aeb] text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
              >
                {exportText === "Copied!" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoDetail;
