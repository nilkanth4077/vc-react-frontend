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
        // console.log(`Got form with ${room} and ${email}`);
        socket.emit('room:join', { email, room });
    }, [email, room, socket]);

    const handleRoomJoin = useCallback((data) => {
        const { email, room } = data;
        // console.log(`Joined room ${room} as ${emaiwebsocket, pollingl}`);
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
                <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md sm:max-w-lg md:max-w-xl">
                    <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Lobby</h1>

                    <form onSubmit={handleSubmitForm} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-start text-gray-700 font-semibold mb-2"
                            >
                                Email:
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="room"
                                className="block text-start text-gray-700 font-semibold mb-2"
                            >
                                Room ID:
                            </label>
                            <input
                                type="text"
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                placeholder="Enter room number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Join
                        </button>
                    </form>
                    <p className='mt-5'>Go to <a href='https://healthcare-frontend-omega.vercel.app/' className='font-bold cursor-pointer'>Homepage</a></p>
                </div>
            </div>
        </>
    )
}

export default LobbyScreen