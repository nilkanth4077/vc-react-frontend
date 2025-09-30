import React, { useState, useCallback, useEffect, use } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';

const LobbyScreen = () => {
    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');

    const navigate = useNavigate();
    const socket = useSocket();
    // console.log("Socket in Lobby:", socket);

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', { email, room });
    }, [email, room, socket]);

    const handleRoomJoin = useCallback((data) => {
        const { email, room } = data;
        // console.log(`Joined room ${room} as ${email}`);
        navigate(`/room/${room}`, { state: { myEmail: email } });
    },
        [navigate]
    );

    useEffect(() => {
        socket.on('room:join', handleRoomJoin)
        return () => {
            socket.off('room:join', handleRoomJoin)
        }
    }, [socket, handleRoomJoin]);

    return (
        <>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <br />
                <label htmlFor="room">Room No:</label>
                <input
                    type="text"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Room"
                />
                <br />
                <button type="submit">Join</button>
            </form>
        </>
    )
}

export default LobbyScreen