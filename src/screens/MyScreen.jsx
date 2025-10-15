import React from "react";
import VideoPlayer from "./VideoPlayer";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash } from "react-icons/fa";

const MyScreen = ({
    myStream,
    myEmail,
    isAudioOn,
    isVideoOn,
    toggleAudio,
    toggleVideo,
    togglrScreenShare,
    handleCallEnd
}) => {
    return (
        <>
            {myStream && (
                <div className="absolute bottom-4 right-4 w-48 h-32 sm:w-32 sm:h-20 rounded-lg overflow-hidden shadow-lg border border-white/20">
                    <VideoPlayer stream={myStream} muted={true} />
                </div>
            )}

            {myStream && (
                <div className="absolute bottom-0 w-full flex justify-center gap-4 p-3 bg-black/30">
                    <button
                        onClick={toggleAudio}
                        className="p-3 rounded-full bg-gray-800 text-white"
                    >
                        {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className="p-3 rounded-full bg-gray-800 text-white"
                    >
                        {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                    </button>
                    <button
                        onClick={togglrScreenShare}
                        className="p-3 rounded-full bg-gray-800 text-white"
                    >
                        <FaDesktop />
                    </button>
                    <button
                        onClick={handleCallEnd}
                        className="p-3 rounded-full bg-red-600 text-white"
                    >
                        <FaPhoneSlash />
                    </button>
                </div>
            )}
        </>
    );
};

export default MyScreen;