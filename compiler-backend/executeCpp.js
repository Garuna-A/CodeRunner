const { rejects } = require("assert");
const {exec} = require("child_process");
const fs = require("fs");
const path = require("path");
const { stdout, stderr } = require("process");

const outputPath = path.join(__dirname,"outputs");
if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive:true});
}

const executeCpp=(filepath)=>{
    const jobId = path.basename(filepath).split(".")[0];
    const filename = `${jobId}.cpp`;

    return new Promise((resolve,reject)=>{
        const hostPath = path.dirname(filepath).replace(/\\/g, '/');
        const command = `docker run --rm -v ${hostPath}:/app cpp-runner sh -c "g++ /app/${filename} -o /app/${jobId}.out && /app/${jobId}.out"`;
       
        exec(command,{timeout:6000},(error,stdout,stderr)=>{
            console.log("error:", error);
            console.log("stdout:", stdout);
            console.log("stderr",stderr);
            if(error){
                if(error.killed)return resolve("TLE:Time Limit Exceeded")
                return resolve(stderr||error.message);
            }
            if(stderr){
                return resolve(stderr);
            }
            resolve(stdout);
        });
    });
};

module.exports = {executeCpp};