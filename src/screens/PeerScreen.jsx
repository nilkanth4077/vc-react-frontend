import React from "react";
import VideoPlayer from "./VideoPlayer";

const PeerScreen = ({ remoteStream }) => {
    return (
        <>
            {remoteStream && (
                <div className="w-full h-screen">
                    <VideoPlayer stream={remoteStream} muted={false} />
                </div>
            )}
        </>
    );
};

export default PeerScreen;