import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Make sure to create this for spinner CSS
import config from "./config";


function App() {
  const [rollNo, setRollNo] = useState("");
  const [exam, setExam] = useState("");
  const [marks, setMarks] = useState({
    "1": "", "2": "", "3": "",
    "4a": "", "4b": "",
    "5a": "", "5b": "",
    "6a": "", "6b": "",
    "7a": "", "7b": ""
  });
  const [message, setMessage] = useState(null);

 
  const API = config.API_URL;


  const handleChange = (q, value) => {
    setMarks(prev => ({ ...prev, [q]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!rollNo.trim()) {
      setMessage({ type: "danger", text: "Roll No required" });
      return;
    }

    try {
      const res = await fetch(`${API}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, exam, marks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setMessage({ type: "success", text: "Saved successfully" });

      // Reset form
      setRollNo("");
      setExam("");
      setMarks({
        "1": "", "2": "", "3": "",
        "4a": "", "4b": "",
        "5a": "", "5b": "",
        "6a": "", "6b": "",
        "7a": "", "7b": ""
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "danger", text: err.message });
    }
  };

  const questions = Object.keys(marks);

  return (
    <div className="container py-4">
      <div className="card mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h4 className="card-title mb-3">Marks Entry Form</h4>

          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Exam (optional)"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {questions.map(q => <th key={q}>{q}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {questions.map(q => (
                      <td key={q}>
                        <input
                          type="number"
                          min="0"
                          className="form-control no-spinner"
                          value={marks[q]}
                          onChange={(e) => handleChange(q, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn btn-primary">Save Marks</button>
          </form>

          <div className="mt-3">
            <p className="text-muted">Excel download is available from backend.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
