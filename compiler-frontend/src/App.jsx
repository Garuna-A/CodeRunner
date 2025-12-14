import { useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react'; // Import the Editor
import './App.css';

function App() {
  const [code, setCode] = useState('#include <iostream>\n\nint main() {\n    std::cout << "Hello World!";\n    return 0;\n}');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState(null);

  const handleSubmit = async () => {
    setStatus('Processing...');
    setOutput('');
    
    try {
      const { data } = await axios.post('http://localhost:5000/run', {
        language: 'cpp',
        code: code
      });

      if (data.jobId) {
        setJobId(data.jobId);
        setStatus('Submitted. Polling for results...');
        pollStatus(data.jobId);
      }
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.error || err.message}`);
      setStatus('Failed');
    }
  };

  const pollStatus = async (id) => {
    const intervalId = setInterval(async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/status', {
          params: { id }
        });

        if (data.state === 'completed') {
          setOutput(data.output);
          setStatus('Success');
          clearInterval(intervalId);
        } else if (data.state === 'failed') {
          setOutput(`Error: ${data.error}`);
          setStatus('Failed');
          clearInterval(intervalId);
        } else {
          setStatus(`Status: ${data.state}...`);
        }
      } catch (err) {
        setStatus('Error polling status');
        clearInterval(intervalId);
      }
    }, 1000);
  };

  return (
    <div className="container">
      <h1>Online C++ Compiler</h1>
      
      <div className="editor-container">
        <Editor
          height="50vh"               
          defaultLanguage="cpp"       // Syntax highlighting for C++
          defaultValue={code}         // Initial value
          theme="vs-dark"             // Dark Mode (like VS Code)
          onChange={(value) => setCode(value)} // Handle updates
        />
      </div>

      <button onClick={handleSubmit} disabled={status.includes('...')}>
        Run Code
      </button>

      <div className="status-bar">Status: {status}</div>

      <div className="output-box">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;