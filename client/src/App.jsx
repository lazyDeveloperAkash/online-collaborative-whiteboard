import React, { useState } from 'react'
import Signup from './pages/Singup'
import Login from './components/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WhiteBoard from './components/WhieBoard';
import JoinOrCreateRoom from './components/JoinOrCreateRoom';

const App = () => {
  const [login, setLogin] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"
          element={login ?
            <Login setLogin={setLogin} />
            :
            <Signup setLogin={setLogin} />}
        />

        <Route path="/dashboard"
          element={<Dashboard />}
        />

        <Route path="/join"
          element={<JoinOrCreateRoom />}
        />

        {/* <Route
          path="/dashboard"
          element={
            // <ProtectedRoutes>
              <Dashboard />
            // </ProtectedRoutes>
          }
        /> */}
      </Routes>
    </BrowserRouter>
    // <>
    //   {login ? <Login setLogin={setLogin} /> : <Signup setLogin={setLogin} />}
    // </>
  )
}

export default App