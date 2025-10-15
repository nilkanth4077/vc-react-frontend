import React, { useEffect, useCallback, useState, use } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop } from "react-icons/fa";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import VideoPlayer from "./VideoPlayer";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const RoomScreen = () => {

    const navigate = useNavigate();
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [remoteEmail, setRemoteEmail] = useState("");
    const [bothJoined, setBothJoined] = useState(false);
    const [mainStream, setMainStream] = useState("remote");

    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const { state } = useLocation();
    const myEmail = state?.myEmail;

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteEmail(email);
        setRemoteSocketId(id);
        setBothJoined(true);
        toast.info(`${email} joined the room!`);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log(`Incoming Call`, from, offer);
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

    const handleJoinCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);

        if (remoteSocketId) {
            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer });
        }
    }, [remoteSocketId, socket]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

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
        let mediaStream = null;
        try {
            mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: false
            });
            document.getElementById("local-video").srcObject = mediaStream;
        } catch (ex) {
            console.log("Error occurred", ex);
        }
    };

    const handleCallEnd = () => {
        myStream.getTracks().forEach((track) => track.stop());
        navigate('/')
    };

    const activeMain = remoteStream ? mainStream : "me";

    const handleSwap = () => {
        setMainStream((prev) => (prev === "me" ? "remote" : "me"));
    };

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        };
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ]);

    return (
        <div>

            <h4 className="text-2xl font-semibold m-3">
                {!remoteSocketId
                    ? "Wait for your peer to join the room..."
                    : bothJoined
                        ? "Your peer is here! Click below to start the call."
                        : "Peer joined. Preparing call..."}
            </h4>

            {bothJoined && (
                <button
                    onClick={handleJoinCall}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Join Call
                </button>
            )}

            {/* <h4 className="text-2xl font-semibold m-3">
                {remoteSocketId ?
                    "Peer is waiting for you to join the call....." :
                    "Wait for your peer to join the room....."}
            </h4>
            {myStream &&
                <button
                    onClick={sendStreams}
                    className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded"
                >
                    JOIN
                </button>
            }
            {remoteSocketId &&
                <button
                    onClick={handleCallUser}
                    className="bg-green-500 hover:bg-green-700 cursor-pointer text-white font-bold py-2 px-4 rounded"
                >
                    CALL
                </button>
            } */}

            {/* {myStream && (
                <div className="control-bar">
                    <button onClick={toggleAudio} className={`control-btn ${isAudioOn ? "on" : "off"}`}>
                        {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button onClick={toggleVideo} className={`control-btn ${isVideoOn ? "on" : "off"}`}>
                        {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                    </button>
                </div>
            )}

            <div className="video-container">
                {myStream && (
                    <div className="video-box">
                        <h2>My Stream: {myEmail}</h2>
                        <VideoPlayer stream={myStream} muted={true} />
                    </div>
                )}
                {remoteStream && (
                    <div className="video-box">
                        <h2>Remote Stream: {remoteEmail}</h2>
                        <VideoPlayer stream={remoteStream} muted={false} />
                    </div>
                )}
            </div> */}

            <div className="room-container">
                {remoteStream ? (
                    <>
                        <div className="peer-video">
                            <VideoPlayer stream={remoteStream} muted={false} />
                        </div>

                        {myStream && (
                            <div className="my-video-overlay">
                                <VideoPlayer stream={myStream} muted={true} />
                            </div>
                        )}
                    </>
                ) : (
                    myStream && (
                        <div className="my-video-fullscreen">
                            <VideoPlayer stream={myStream} muted={true} />
                        </div>
                    )
                )}

                {myStream && (
                    <div className="control-bar">
                        <button
                            onClick={toggleAudio}
                            className={`control-btn ${isAudioOn ? "on" : "off"}`}
                        >
                            {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`control-btn ${isVideoOn ? "on" : "off"}`}
                        >
                            {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                        <button
                            onClick={togglrScreenShare}
                            className={`control-btn ${isVideoOn ? "on" : "off"}`}
                        >
                            <FaDesktop />
                        </button>
                        <button
                            onClick={handleCallEnd}
                            className={`control-btn end-call-btn ${isVideoOn ? "on" : "off"}`}
                        >
                            <FaPhoneSlash />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default RoomScreen;