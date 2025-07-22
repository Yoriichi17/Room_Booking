import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Qr from './components/Qr.jsx'
import BookingPage from './components/BookingPage.jsx'
import RegisterRoom from './components/RegisterRoom.jsx'

// define routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element = {<App/>}>
      <Route path='' element={<Qr/>} /> 
      <Route path='/book' element={<BookingPage/>}/>
      <Route path='/registerRoom' element={<RegisterRoom/>}/>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)