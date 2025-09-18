import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { getSharedMessage } from 'shared/utils'

function App() {
  const [greeting, setGreeting] = useState('')

  async function greet() {
    setGreeting(await invoke('greet', { name: 'Desktop App' }))
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          VAudio Desktop
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {getSharedMessage()}
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={greet}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Testar Tauri
          </button>
          
          {greeting && (
            <p className="text-green-600 font-medium">{greeting}</p>
          )}
          
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
            Começar
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
