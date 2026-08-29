import { useEffect, useRef } from 'react';
import { hexToRgb, useSmokeConfig } from '@/lib/smokeConfig';
import { useTheme } from '@/lib/theme';
import { useCoarsePointer, useFinePointer, useReducedMotion } from '@/hooks/useMediaQuery';

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';

/* fbm noise displaced by noise — the domain warp is what gives smoke its curl,
   rather than the soft radial blobs this replaced. */
const FRAG = [
  'precision highp float;',
  'uniform vec2 uRes; uniform float uTime; uniform float uDark;',
  'uniform vec2 uMouse; uniform float uMouseOn;',
  'uniform float uDensity, uSpeed, uScale, uReach;',
  'uniform vec4 uCards[3]; uniform vec3 uTints[3];',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),',
  '            mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}',
  'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=0.5;}return v;}',
  'float sdRound(vec2 p,vec2 c,vec2 h,float r){vec2 d=abs(p-c)-h+r;',
  ' return length(max(d,0.0))+min(max(d.x,d.y),0.0)-r;}',
  'void main(){',
  ' vec2 frag=gl_FragCoord.xy;',
  ' float t=uTime*uSpeed;',
  ' vec2 q0=frag/uScale;',
  ' if(uMouseOn>0.5){vec2 d=(frag-uMouse)/uScale;float f=exp(-dot(d,d)*0.08);',
  '  q0+=vec2(-d.y,d.x)*f*2.4;}',
  ' vec2 w=vec2(fbm(q0*0.9+vec2(0.0,-t*0.55)),fbm(q0*0.9+vec2(5.2,1.3)-vec2(0.0,t*0.35)));',
  ' float n=fbm(q0+w*1.9+vec2(0.0,-t*0.85));',
  ' n=smoothstep(0.34,0.92,n);',
  ' vec3 col=vec3(0.0); float al=0.0;',
  ' for(int i=0;i<3;i++){',
  '  vec4 c=uCards[i];',
  '  float d=sdRound(frag,c.xy,c.zw,22.0);',
  '  float m=smoothstep(uReach,0.0,d)*step(0.0,d);',
  '  float dens=n*m*uDensity;',
  '  col+=uTints[i]*dens; al=max(al,dens);',
  ' }',
  // Colour at full brightness with density in alpha, so the blend applies it once.
  ' vec3 base = al>0.001 ? col/al : vec3(0.0);',
  ' gl_FragColor=vec4(base, al*(uDark>0.5?1.0:0.72));',
  '}',
].join('\n');

/** One WebGL smoke layer behind the whole service row, hugging each panel. */
export function SmokeField({ hostRef }: { hostRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings, palette } = useSmokeConfig();
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const coarse = useCoarsePointer();

  const cfg = useRef({ settings, palette, dark: theme !== 'light' });
  cfg.current = { settings, palette, dark: theme !== 'light' };
  const kick = useRef<(() => void) | null>(null);
  useEffect(() => { kick.current?.(); }, [settings, palette, theme]);

  useEffect(() => {
    const cvs = canvasRef.current;
    const host = hostRef.current;
    if (!cvs || !host) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = cvs.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    } catch { gl = null; }
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const o = gl.createShader(type)!;
      gl.shaderSource(o, src); gl.compileShader(o);
      return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const pl = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(pl);
    gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
    const loc: Record<string, WebGLUniformLocation | null> = {};
    ['uRes', 'uTime', 'uDark', 'uMouse', 'uMouseOn', 'uDensity', 'uSpeed', 'uScale', 'uReach', 'uCards', 'uTints']
      .forEach((k) => { loc[k] = gl!.getUniformLocation(prog, k); });
    gl.enable(gl.BLEND);

    const rects = new Float32Array(12);
    const tints = new Float32Array(9);
    let raf = 0, visible = false, mouseX = -1e4, mouseY = -1e4, mouseOn = 0;
    const dpr = () => Math.min(1.5, devicePixelRatio || 1);

    function measure() {
      const box = cvs!.getBoundingClientRect();
      const pal = cfg.current.palette;
      Array.from(host!.querySelectorAll('.service')).slice(0, 3).forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const d = dpr();
        // GL's origin is bottom-left, the DOM's is top-left.
        rects[i * 4] = (r.left - box.left + r.width / 2) * d;
        rects[i * 4 + 1] = (box.bottom - r.bottom + r.height / 2) * d;
        rects[i * 4 + 2] = (r.width / 2) * d;
        rects[i * 4 + 3] = (r.height / 2) * d;
        const [cr, cg, cb] = hexToRgb(pal[i % pal.length]);
        tints[i * 3] = cr / 255; tints[i * 3 + 1] = cg / 255; tints[i * 3 + 2] = cb / 255;
      });
    }

    function resize() {
      const w = cvs!.clientWidth, h = cvs!.clientHeight;
      if (!w || !h) return;
      const d = dpr();
      cvs!.width = Math.round(w * d);
      cvs!.height = Math.round(h * d);
      gl!.viewport(0, 0, cvs!.width, cvs!.height);
      measure();
    }

    const t0 = performance.now();
    function draw(time: number) {
      const { settings: S, dark } = cfg.current;
      // Additive reads as glow on the dark page; on white it would blow out.
      if (dark) gl!.blendFuncSeparate(gl!.SRC_ALPHA, gl!.ONE, gl!.ONE, gl!.ONE);
      else gl!.blendFuncSeparate(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA, gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(loc.uRes, cvs!.width, cvs!.height);
      gl!.uniform1f(loc.uTime, time);
      gl!.uniform1f(loc.uDark, dark ? 1 : 0);
      gl!.uniform2f(loc.uMouse, mouseX, mouseY);
      gl!.uniform1f(loc.uMouseOn, mouseOn);
      gl!.uniform1f(loc.uDensity, S.density * (coarse ? 0.6 : 1));
      gl!.uniform1f(loc.uSpeed, S.speed);
      gl!.uniform1f(loc.uScale, S.scale * dpr());
      gl!.uniform1f(loc.uReach, S.reach * dpr());
      gl!.uniform4fv(loc.uCards, rects);
      gl!.uniform3fv(loc.uTints, tints);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      cvs!.classList.add('is-ready');
    }

    function frame() {
      raf = 0;
      draw((performance.now() - t0) / 1000);
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const play = () => {
      if (raf || !visible || document.hidden) return;
      if (reduced) { measure(); draw(6); return; }
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => { measure(); play(); };

    resize();
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; play(); }, { rootMargin: '160px' });
    io.observe(host);
    const onVis = () => play();
    document.addEventListener('visibilitychange', onVis);
    const onScroll = () => measure();
    addEventListener('scroll', onScroll, { passive: true });
    let timer: number | undefined;
    const onResize = () => { clearTimeout(timer); timer = window.setTimeout(() => { resize(); play(); }, 160); };
    addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      const box = cvs!.getBoundingClientRect();
      const d = dpr();
      mouseX = (e.clientX - box.left) * d;
      mouseY = (box.bottom - e.clientY) * d;
      mouseOn = (e.clientX > box.left - 120 && e.clientX < box.right + 120
        && e.clientY > box.top - 120 && e.clientY < box.bottom + 120) ? 1 : 0;
    };
    const onLeave = () => { mouseOn = 0; };
    if (fine) {
      addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      kick.current = null;
    };
  }, [hostRef, reduced, fine, coarse]);

  return <canvas className="smoke-field" ref={canvasRef} aria-hidden="true" />;
}
