import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.jsx'      // <-- أضفنا src هنا
import './src/index.css'             // <-- أضفنا src هنا

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
