import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, ListPlus, Check, FolderPlus } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";

const VideoCard = ({ video }) => {
  const { toggleWatchlist, watchlist, playlists, addToPlaylist } = useLibrary();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  // Check if video is already in watchlist
  const isSavedToWatchlist = watchlist.some((v) => (v.id || v._id) === (video.id || video._id));

  // Stop the card click from navigating when clicking buttons
  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="relative group">
      <Link to={`/video/${video.id}`} className="block">
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-white/5 bg-[#0D1223]">
          {/* THUMBNAIL */}
          {/* BLURRED BACKGROUND GLOW */}
          <img
            src={video.thumbnail}
            alt=""
            className="absolute inset-x-0 bottom-0 w-full h-full object-cover scale-110 blur-[30px] opacity-40 -z-10"
          />
          {/* MAIN CLEAR THUMBNAIL - Set to contain to ensure full face/image fits */}
          <img
            src={video.thumbnail}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 contrast-[1.15] brightness-[1.1] relative z-10 drop-shadow-2xl"
          />

          {/* OVERLAY ON HOVER */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-[#00F0FF] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,240,255,0.5)] transform scale-75 group-hover:scale-100 transition-transform">
              <Play size={24} fill="currentColor" />
            </div>
          </div>

          {/* ACTION BUTTONS (TOP RIGHT) */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-20">
            <button
              onClick={(e) => handleAction(e, () => toggleWatchlist(video))}
              className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all ${
                isSavedToWatchlist
                  ? "bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]"
                  : "bg-black/60 text-white hover:bg-[#00F0FF]/20"
              }`}
              title="Watch Later"
            >
              <Clock
                size={16}
                fill={isSavedToWatchlist ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={(e) =>
                handleAction(e, () => setShowPlaylistMenu(!showPlaylistMenu))
              }
              className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all ${
                showPlaylistMenu
                  ? "bg-[#7B68EE] text-white"
                  : "bg-black/60 text-white hover:bg-[#7B68EE]/20"
              }`}
              title="Add to Playlist"
            >
              <ListPlus size={16} />
            </button>
          </div>

          {/* PLAYLIST DROPDOWN */}
          {showPlaylistMenu && (
            <div
              className="absolute top-12 right-2 w-44 bg-[#0D1223] border border-white/10 rounded-xl shadow-2xl z-30 py-2 animate-in fade-in zoom-in duration-200 backdrop-blur-xl"
              onClick={(e) => e.preventDefault()}
            >
              <p className="px-3 py-1 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">
                Save to...
              </p>
              <div className="max-h-32 overflow-y-auto custom-scrollbar">
                {playlists.map((pl) => {
                  const isInPlaylist = pl.videos?.some(
                    (v) => v.id === video.id
                  );
                  return (
                    <button
                      key={pl.id}
                      onClick={(e) =>
                        handleAction(e, () => {
                          addToPlaylist(pl.id, video);
                          setShowPlaylistMenu(false);
                        })
                      }
                      className="w-full text-left px-3 py-2 text-[11px] font-bold flex items-center justify-between hover:bg-[#00F0FF]/10 text-white hover:text-[#00F0FF] transition-colors"
                    >
                      {pl.title}
                      {isInPlaylist && (
                        <Check size={12} className="text-[#00F0FF]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DURATION TAG */}
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#00F0FF] border border-[#00F0FF]/20">
            {video.duration || "12:45"}
          </span>
        </div>

        {/* METADATA */}
        <div className="flex gap-3 px-1">
          <Link 
            to={`/profile/${video.author}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#7000FF]/20 border border-white/5 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-[#00F0FF] hover:scale-110 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
          >
            {video.author ? video.author[0] : "N"}
          </Link>
          <div className="space-y-1">
            <h4 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-[#00F0FF] transition-colors">
              {video.title}
            </h4>
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 overflow-hidden h-4">
                {video.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[#00F0FF] text-[8px] font-black uppercase tracking-tighter hover:underline">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
