(function(root){
'use strict';
// Shared batched raster backend. Geometry and ownership still come from the
// same admitted mathematical sampler; the CPU renderer remains a fallback.
let state,unavailable=false;
function setup(){if(state)return state;if(unavailable)return null;try{
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});if(!gl){unavailable=true;return null;}
 function shader(kind,source){const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position; attribute vec4 ink; uniform vec2 viewport; uniform float size; varying vec4 color; void main(){gl_Position=vec4(position.x/viewport.x*2.0-1.0,1.0-position.y/viewport.y*2.0,0.0,1.0);gl_PointSize=size;color=ink;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec4 color; void main(){gl_FragColor=vec4(color.rgb*color.a,color.a);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const buffer=gl.createBuffer();state={canvas,gl,program,buffer,position:gl.getAttribLocation(program,'position'),ink:gl.getAttribLocation(program,'ink'),viewport:gl.getUniformLocation(program,'viewport'),size:gl.getUniformLocation(program,'size'),colors:new Map()};canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state=null;unavailable=true;});return state;
 }catch{unavailable=true;return null;}}
function rgb(s,color){if(s.colors.has(color))return s.colors.get(color);const c=/^#[a-f\d]{6}$/i.test(color)?color:'#beded2',v=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);s.colors.set(color,v);return v;}
function draw(canvas,comp,frame,phase,opts,project,scale,cx,cy){const s=setup();if(!s)return false;const {gl}=s,w=canvas.width,h=canvas.height;
 if(s.canvas.width!==w||s.canvas.height!==h){s.canvas.width=w;s.canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(s.program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_COLOR);gl.bindBuffer(gl.ARRAY_BUFFER,s.buffer);
 const pointCount=frame.points.length/4,lineCount=frame.ridges.reduce((n,r)=>n+Math.max(0,r.line.length-1)*2,0),needed=(pointCount+lineCount)*6;if(!comp.gpuData||comp.gpuData.length<needed)comp.gpuData=new Float32Array(needed);const data=comp.gpuData,colors=opts.palette||comp.palette,inks=comp.nodeIds.map((_,i)=>rgb(s,opts.neutral?'#dce8e4':colors[i]||'#beded2')),selected=opts.selectedNode?comp.nodeIds.indexOf(opts.selectedNode):-1,d=comp.design.composition,ya=Math.cos(d.yaw),ys=Math.sin(d.yaw),pc=Math.cos(d.pitch),ps=Math.sin(d.pitch);let cursor=0;
 const write=(q,owner,alpha,line)=>{const py=q.y*pc-(q.z*ya-q.x*ys)*ps,px=q.x*ya+q.z*ys+d.lean*py,c=inks[owner],active=selected<0||selected===owner,a=Math.max(0,Math.min(1,alpha*(active?1:.20)));data[cursor++]=cx+px*scale;data[cursor++]=cy+py*scale;for(let j=0;j<3;j++)data[cursor++]=line?c[j]*.8+[.902,.973,.929][j]*.2:c[j];data[cursor++]=a;};
 for(let i=0;i<pointCount;i++)write({x:frame.points[i*4],y:frame.points[i*4+1],z:frame.points[i*4+2]},frame.owners[i],1-Math.exp(-2*frame.points[i*4+3]),false);
 const gain=comp.body.cloud?.24:.52;for(const ridge of frame.ridges)for(let j=1;j<ridge.line.length;j++){const a=ridge.line[j-1],b=ridge.line[j];write(a,a.owner,(a.alpha??.2)*gain,true);write(b,b.owner,(b.alpha??.2)*gain,true);}
 gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,cursor),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(s.position);gl.vertexAttribPointer(s.position,2,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(s.ink);gl.vertexAttribPointer(s.ink,4,gl.FLOAT,false,24,8);gl.uniform2f(s.viewport,w,h);gl.uniform1f(s.size,Math.max(.8,Math.min(w,h)/470));gl.drawArrays(gl.POINTS,0,pointCount);gl.lineWidth(1);gl.drawArrays(gl.LINES,pointCount,lineCount);canvas.getContext('2d').drawImage(s.canvas,0,0);return true;
}
root.LifeformWebGL={available:()=>!!setup(),draw};
})(globalThis);
