// src/App.js
import React from 'react';
import CustomForm from './Components/CustomForm';
import Login from './Components/Login';
import { Route, Routes } from 'react-router-dom';
import AssetPage from './Components/AssetPage';

function App() {
  return (
    <div className="App">
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/dashboard' element={<CustomForm/>}/>
      <Route path='/assets' element={<AssetPage/>}/>
    </Routes>
    </div>
  );
}


export default App;
