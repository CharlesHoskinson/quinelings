#!/usr/bin/env node
import {createV1A2AApp} from './v1-a2a.js';
import {Session} from './v1.js';
const port=Number(process.env.QUINELING_V1_A2A_PORT??8050);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('QUINELING_V1_A2A_PORT must be an integer between 1 and 65535');
const host='127.0.0.1',baseUrl=`http://${host}:${port}`,{app}=createV1A2AApp(new Session(),{baseUrl});
const server=app.listen(port,host,()=>process.stderr.write(`Quinelings v1 A2A: ${baseUrl}/.well-known/agent-card.json\n`));
server.on('error',error=>{process.stderr.write(`${error.message}\n`);process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>server.close(()=>{process.exitCode=0;}));
