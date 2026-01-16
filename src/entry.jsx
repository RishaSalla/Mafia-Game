import React from 'react'
import ReactDOM from 'react-dom/client'
// بما أننا داخل مجلد src، نستدعي الملفات مباشرة بنقطة فقط
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
