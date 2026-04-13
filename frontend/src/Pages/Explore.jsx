import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Play, Filter, Search as SearchIcon, Clock, CheckCircle2 } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { fetchVideos } from "../api/videosapi.js";
const Explore = () => {
  const { toggleWatchlist, watchlist } = useLibrary();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Get the search query from the URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q") || "";

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const data = await fetchVideos("All", searchTerm);
      setVideos(data);
      setLoading(false);
    };
    loadVideos();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0A0E1A] min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#00F0FF] mb-2">
          <Filter size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Sector Scan
          </span>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          {searchTerm ? `Results for: ${searchTerm}` : "Global Transmissions"}
        </h1>
      </div>

      {/* RESULTS GRID */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.id}`}
              className="group bg-[#0D1223] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00F0FF]/30 transition-all duration-500 shadow-xl"
            >
              {/* THUMBNAIL */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 contrast-[1.1] brightness-[1.1]"
                />

                {/* WATCH LATER BUTTON */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWatchlist(video);
                    }}
                    className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all ${
                      watchlist.some(
                        (v) => (v.id || v._id) === (video.id || video._id),
                      )
                        ? "bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]"
                        : "bg-black/60 text-white hover:bg-[#00F0FF]/20"
                    }`}
                    title="Watch Later"
                  >
                    <Clock
                      size={16}
                      fill={
                        watchlist.some(
                          (v) => (v.id || v._id) === (video.id || video._id),
                        )
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 bg-[#00F0FF] text-black p-2 rounded-full translate-y-12 group-hover:translate-y-0 transition-transform shadow-[0_0_15px_#00F0FF]">
                  <Play size={16} fill="black" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-bold text-sm line-clamp-2 group-hover:text-[#00F0FF] transition-colors uppercase tracking-tight">
                  {video.title}
                </h3>
                <Link 
                  to={`/profile/${video.author}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest hover:text-[#00F0FF] transition-colors flex items-center gap-1"
                >
                  {video.author} <CheckCircle2 size={10} />
                </Link>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[9px] text-gray-600 font-black">
                    {video.views} Views
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-[#00F0FF] border border-[#00F0FF]/20 font-bold">
                    {video.tag}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* NO RESULTS STATE */
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <SearchIcon className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-xl font-black uppercase italic text-gray-400">
            No signals found
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Try searching for a different frequency or sector.
          </p>
        </div>
      )}
    </div>
  );
};

export default Explore;
