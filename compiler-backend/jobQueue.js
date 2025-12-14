const { Queue, Worker } = require("bullmq");
const { executeCpp } = require("./executeCpp");

// 1. Create the Queue
// We connect to the Redis instance running in Docker on port 6379
const jobQueue = new Queue("job-runner-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// 2. The Worker Logic
// This function sits and waits for jobs. When a job appears, it runs this code.
// 'numWorkers' determines how many jobs run in parallel.
const numWorkers = 5; 

const worker = new Worker(
  "job-runner-queue",
  async (job) => {
    console.log(`Job ${job.id} started...`);
    // job.data contains the { filepath } we sent from index.js
    const output = await executeCpp(job.data.filepath);
    
    // We can store the output here (in a real app, you'd save to DB)
    // For now, just logging it
    console.log(`Job ${job.id} finished. Output: \n${output}`);
    return output;
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
    concurrency: numWorkers, 
  }
);

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error ${err.message}`);
});


const addJob = async (jobId, filepath) => {
  await jobQueue.add("job", { filepath }, { jobId });
  console.log(`Job ${jobId} added to queue.`);
};

module.exports = { addJob,jobQueue };