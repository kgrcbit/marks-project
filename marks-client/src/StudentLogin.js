
import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin(){
  const [user,setUser]=useState('');
  const [pass,setPass]=useState('');
  const [msg,setMsg]=useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post('/api/student/login',{username:user,password:pass});
      if(res.data.ok){
        nav('/student/'+res.data.rollno);
      } else setMsg('Login failed');
    }catch(err){
      setMsg('Login failed');
    }
  };

  return (<div className="container mt-4">
    <h3>Student Login</h3>
    <form onSubmit={submit}>
      <div className="mb-2"><input className="form-control" placeholder="rollno" value={user} onChange={e=>setUser(e.target.value)} /></div>
      <div className="mb-2"><input className="form-control" type="password" placeholder="password" value={pass} onChange={e=>setPass(e.target.value)} /></div>
      <button className="btn btn-primary">Login</button>
      <div className="mt-2 text-danger">{msg}</div>
    </form>
  </div>);
}
