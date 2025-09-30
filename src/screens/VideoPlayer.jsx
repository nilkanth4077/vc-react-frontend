import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ stream, muted }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay playsInline muted={muted} width="200" height="100" />;
};

export default VideoPlayer;