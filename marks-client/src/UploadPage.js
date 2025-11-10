
import React, {useState} from 'react';
import axios from 'axios';

export default function UploadPage(){
  const [file,setFile]=useState(null);
  const [msg,setMsg]=useState('');
  const upload = async (e) => {
    e.preventDefault();
    if(!file){ setMsg('Please choose file'); return; }
    const fd = new FormData();
    fd.append('file', file);
    try{
      const token = localStorage.getItem('admin_token');
      const res = await axios.post('/api/upload', fd, { headers: {'Content-Type':'multipart/form-data', 'Authorization': token?('Bearer '+token):''}});
      setMsg('Uploaded: '+ (res.data.count || 0) + ' records');
    }catch(err){
      setMsg('Upload failed');
    }
  };
  return (<div className="container mt-4">
    <h3>Upload Excel (.xlsx)</h3>
    <form onSubmit={upload}>
      <div className="mb-2">
        <input type="file" accept=".xlsx" onChange={e=>setFile(e.target.files[0])}/>
      </div>
      <button className="btn btn-primary">Upload</button>
    </form>
    <div className="mt-2">{msg}</div>
  </div>);
}
