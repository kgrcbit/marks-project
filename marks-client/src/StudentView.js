
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function StudentView(){
  const { roll } = useParams();
  const [data,setData]=useState(null);
  useEffect(()=>{
    const fetch = async ()=> {
      try{
        const res = await axios.get('/api/student/'+roll);
        setData(res.data);
      }catch(err){
        setData({ error: 'Not found' });
      }
    };
    fetch();
  },[roll]);
  return (<div className="container mt-4">
    <h3>Student: {roll}</h3>
    {data ? (data.error ? <div className="text-danger">{data.error}</div> : 
      <table className="table table-sm"><tbody>
        {Object.entries(data).map(([k,v])=>(
          <tr key={k}><th style={{width:200}}>{k}</th><td>{String(v)}</td></tr>
        ))}
      </tbody></table>
    ) : <div>Loading...</div>}
  </div>);
}
