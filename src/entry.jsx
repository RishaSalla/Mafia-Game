import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'        // لاحظ: حذفنا src
import './index.css'               // لاحظ: حذفنا src

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
