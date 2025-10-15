import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useLocation, useNavigate } from "react-router-dom";
import peer from "../service/peer";

import MyScreen from "./MyScreen";
import PeerScreen from "./PeerScreen";

const RoomScreen = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const { state } = useLocation();
    const myEmail = state?.myEmail;

    // --- Socket + Peer Events (same as your old code) ---
    const handleUserJoined = useCallback(({ email, id }) => {
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMyStream(stream);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            sendStreams();
        },
        [sendStreams]
    );

    const toggleAudio = () => {
        if (!myStream) return;
        const audioTrack = myStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (!myStream) return;
        const videoTrack = myStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const togglrScreenShare = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            document.getElementById("local-video").srcObject = mediaStream;
        } catch (ex) {
            console.log("Error occurred", ex);
        }
    };

    const handleCallEnd = () => {
        myStream?.getTracks().forEach((track) => track.stop());
        navigate("/");
    };

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
        };
    }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted]);

    return (
        <div className="relative w-full h-screen bg-black">
            {/* Remote User */}
            <PeerScreen remoteStream={remoteStream} />

            {/* My Self */}
            <MyScreen
                myStream={myStream}
                myEmail={myEmail}
                isAudioOn={isAudioOn}
                isVideoOn={isVideoOn}
                toggleAudio={toggleAudio}
                toggleVideo={toggleVideo}
                togglrScreenShare={togglrScreenShare}
                handleCallEnd={handleCallEnd}
            />

            {/* Join/Call buttons before call starts */}
            <div className="absolute top-4 left-4 flex gap-2">
                {myStream && (
                    <button
                        onClick={sendStreams}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        JOIN
                    </button>
                )}
                {remoteSocketId && (
                    <button
                        onClick={handleCallUser}
                        className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        CALL
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomScreen;