const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { addJob,jobQueue } = require("./jobQueue"); 

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  const jobId = uuidv4();
  const filename = `${jobId}.cpp`;
  const filepath = path.join(dirCodes, filename);

  fs.writeFileSync(filepath, code);

  await addJob(jobId, filepath);

  res.json({ jobId, status: "queued" });
});

app.get("/status", async (req, res) => {
    const jobId = req.query.id;
  
    if (!jobId) {
      return res.status(400).json({ success: false, error: "missing id query param" });
    }
  
    try {
      const job = await jobQueue.getJob(jobId);
  
      if (!job) {
        return res.status(404).json({ success: false, error: "invalid job id" });
      }
  
      const state = await job.getState(); // completed, failed, delayed, etc.
      const result = job.returnvalue; // This is the 'output' returned from the worker
  
      res.json({ success: true, jobId, state, output: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => {
  console.log("Listening on port 5000!");
});