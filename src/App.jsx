import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import LobbyScreen from './screens/Lobby'
import RoomScreen from './screens/Room'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/room/:roomId" element={<RoomScreen />} />
        </Routes>
      </div>
    </>
  )
}

export default App
