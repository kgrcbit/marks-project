
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import UploadPage from './UploadPage';
import StudentLogin from './StudentLogin';
import StudentView from './StudentView';
import Home from './Home';

function App(){
  return (<BrowserRouter>
    <nav className="navbar navbar-expand bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">MarksApp</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/admin">Admin</Link>
          <Link className="nav-link" to="/student">Student</Link>
        </div>
      </div>
    </nav>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/admin" element={<AdminLogin/>} />
      <Route path="/upload" element={<UploadPage/>} />
      <Route path="/student" element={<StudentLogin/>} />
      <Route path="/student/:roll" element={<StudentView/>} />
    </Routes>
  </BrowserRouter>);
}

export default App;
