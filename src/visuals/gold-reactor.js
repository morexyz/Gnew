/**
 * Gnew Gold Lab: original WebGL1 fragment shader; no 3D library or market data.
 * A softly ray-marched, sculptural metallic field explores heritage/intelligence/freedom.
 * Fallback: lightweight Canvas2D abstract rings. Offscreen/reduced-motion: stopped.
 */
const VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() { v_uv = a_position * .5 + .5; gl_Position = vec4(a_position, 0.0, 1.0); }
`;
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
uniform float u_time;
uniform float u_aspect;
uniform float u_mode;
uniform float u_energy;
uniform vec2 u_pointer;
mat2 spin(float a) { float s = sin(a), c = cos(a); return mat2(c,-s,s,c); }
float map(vec3 p) {
  p.xy *= spin(.22 + (u_pointer.y-.5)*.48);
  p.xz *= spin(.13 + u_time*.12 + (u_pointer.x-.5)*.9);
  float wave = sin(p.y * (7.0 + u_mode*2.0) + atan(p.z,p.x)*6.0 + u_time*(.45+u_mode*.12));
  float groove = sin(atan(p.z,p.x)*(11.0+u_mode*2.0) - p.y*4.0 + u_time*.32);
  float base = length(p * vec3(1.0, 1.10 - u_mode*.06, .9)) - .94;
  return base + wave*.058*u_energy + groove*.018;
}
vec3 normalAt(vec3 p) {
  vec2 e = vec2(.003, 0.0);
  return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
}
void main() {
  vec2 uv = (v_uv - .5) * vec2(u_aspect, 1.0) * 2.15;
  vec3 bg = mix(vec3(.025,.030,.028), vec3(.062,.046,.030), .5+.5*uv.y);
  float glint = pow(max(0.0,1.0-length(uv-vec2(0.0,.02))*.68), 3.0);
  bg += vec3(.17,.095,.028) * glint;
  vec3 ro = vec3(0.0,0.0,3.4);
  vec3 rd = normalize(vec3(uv,-2.4));
  float t = 0.0, d = 0.0;
  bool hit = false;
  for(int i=0; i<54; i++) {
    vec3 p = ro + rd*t;
    d = map(p);
    if (d < .0026) { hit = true; break; }
    t += max(d*.77,.011);
    if(t>6.3) break;
  }
  vec3 color = bg;
  if(hit) {
    vec3 p = ro + rd*t, n = normalAt(p);
    vec3 light = normalize(vec3(-.65,.82,1.25));
    float diff = max(dot(n, light),0.0);
    float rim = pow(1.0-max(dot(n,-rd),0.0), 3.1);
    float spec = pow(max(dot(reflect(-light,n),-rd),0.0), 48.0);
    float shine = pow(max(dot(reflect(normalize(vec3(.8,.25,.1)),n),-rd),0.0), 22.0);
    vec3 gold = mix(vec3(.38,.19,.055), vec3(1.0,.79,.40), clamp(diff*.88+.18,0.0,1.0));
    if(u_mode > .5 && u_mode < 1.5) gold = mix(gold,vec3(.62,.73,.67),.27);
    if(u_mode > 1.5) gold = mix(gold,vec3(.67,.79,.76),.32);
    color = gold * (.51 + .43*diff) + vec3(1.0,.85,.59)*spec*1.25 + vec3(1.0,.75,.34)*shine*.56;
    color += vec3(.77,.52,.21) * rim*.74;
  }
  float ring = abs(length(uv) - (1.09 + .026*sin(u_time*.3)));
  color += vec3(.55,.38,.18) * .105 * (1.0-smoothstep(0.0,.035,ring));
  color = color/(color+.52); // simple filmic tone compression
  color = pow(color,vec3(.94));
  gl_FragColor = vec4(color,1.0);
}
`;

function compile(gl, type, code) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader,code); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
    const why = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(`Gold shader: ${why}`);
  }
  return shader;
}
function renderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power', preserveDrawingBuffer:false });
  if (!gl) return null;
  const vs = compile(gl,gl.VERTEX_SHADER,VERTEX);
  const fs = compile(gl,gl.FRAGMENT_SHADER,FRAGMENT);
  const program = gl.createProgram();
  gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  const position = gl.getAttribLocation(program,'a_position');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.useProgram(program); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms = Object.fromEntries(['u_time','u_aspect','u_mode','u_energy','u_pointer'].map(key => [key,gl.getUniformLocation(program,key)]));
  return {
    draw(time, mode, energy, pointer, w, h) {
      gl.viewport(0,0,w,h); gl.useProgram(program);
      gl.uniform1f(uniforms.u_time,time); gl.uniform1f(uniforms.u_aspect,w/h);
      gl.uniform1f(uniforms.u_mode,mode); gl.uniform1f(uniforms.u_energy,energy);
      gl.uniform2f(uniforms.u_pointer,pointer[0],pointer[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    },
    destroy() { gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}
function canvasFallback(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { draw() {}, destroy() {} };
  return {
    draw(time,mode,energy,pointer,w,h) {
      ctx.clearRect(0,0,w,h);
      const x = w*(.5+(pointer[0]-.5)*.1), y = h*(.47+(pointer[1]-.5)*.08);
      const r = Math.min(w*.42,h*.4), g = ctx.createRadialGradient(x-r*.28,y-r*.28,r*.08,x,y,r);
      g.addColorStop(0,'#fff0c2'); g.addColorStop(.24,mode===2?'#b3d4c6':'#e8c480');
      g.addColorStop(.52,mode===1?'#8f9f85':'#8a5826'); g.addColorStop(.8,'#201c14');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      for(let i=0;i<11;i++){
        ctx.beginPath();ctx.ellipse(x,y,r*(.75+i*.025),r*(.32+i*.019),time*.075+i*.14,0,Math.PI*2);
        ctx.strokeStyle=`rgba(227,181,102,${.05+energy*.075})`;ctx.lineWidth=1;ctx.stroke();
      }
    }, destroy() {},
  };
}
export function createGoldReactor(canvas,{ scheduler }) {
  let drawSystem;
  try { drawSystem=renderer(canvas); } catch (error) { console.warn('WebGL scene unavailable',error); canvas.classList.add('resonance__canvas--unavailable'); }
  if (!drawSystem) {
    try { drawSystem=canvasFallback(canvas); } catch { drawSystem={ draw(){},destroy(){} }; }
  }
  let w=0,h=0,mode=0,energy=.68, pointer=[.5,.5], unsubscribe=null,last=0,clock=0;
  const resize=()=>{
    const r=canvas.getBoundingClientRect();
    if(!r.width||!r.height)return;
    // Limit shader workload to <=850k pixels independent of device resolution.
    const dpr=Math.min(window.devicePixelRatio||1,innerWidth<760?.95:1.1,Math.sqrt(850000/(r.width*r.height)));
    const nw=Math.max(1,Math.floor(r.width*dpr)),nh=Math.max(1,Math.floor(r.height*dpr));
    if(w===nw&&h===nh)return;
    w=nw;h=nh;canvas.width=w;canvas.height=h;
  };
  const resizer=new ResizeObserver(resize);resizer.observe(canvas);resize();
  const render=(now,delta)=>{
    if(document.hidden||!w||!h||now-last<39)return;
    last=now;clock+=Math.min(40,delta)/1000;
    drawSystem.draw(clock,mode,energy,pointer,w,h);
  };
  return {
    setMode(v){mode=v;},setEnergy(v){energy=v/100;},setPointer(x,y){pointer=[Math.max(0,Math.min(1,x)),Math.max(0,Math.min(1,y))];},
    start(){if(!unsubscribe)unsubscribe=scheduler.add(render);},
    stop(){unsubscribe?.();unsubscribe=null;},
    destroy(){unsubscribe?.();resizer.disconnect();drawSystem.destroy();},
  };
}
