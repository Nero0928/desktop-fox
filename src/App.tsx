import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { PetDisplay } from './components/Pet/PetDisplay'
import { ChatPanel } from './components/Chat/ChatPanel'
import { SettingsPanel } from './components/Settings/SettingsPanel'

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/pet" element={<PetDisplay />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/settings" element={<SettingsPanel />} />
      </Routes>
    </HashRouter>
  )
}
