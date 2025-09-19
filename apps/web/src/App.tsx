import { getSharedMessage } from 'shared/utils';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">VAudio Web</h1>
        <p className="text-lg text-gray-600 mb-8">{getSharedMessage()}</p>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Começar
        </button>
      </div>
    </div>
  );
}

export default App;
