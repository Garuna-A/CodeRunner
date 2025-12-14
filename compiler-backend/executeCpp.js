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
        const command = `docker run --rm -v "${path.dirname(filepath)}":/app cpp-runner sh -c "g++ /app/${filename} -o /app/${jobId}.out && /app/${jobId}.out"`;

        exec(command,(error,stdout,stderr)=>{
            if(error){
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