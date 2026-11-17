'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const H = Math.PI / 2;
const ss = (t: number) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
type K = number[]; // p, x, z, yaw, sit, greet, type

const keys = (sx: number, ax: number, hx: number, z: number, ys: number, fx: number): K[] => [
  [0, sx, z, ys, 0, 0, 0], [0.17, hx, z, ys, 0, 0, 0], [0.2, hx, z, ys, 0, 1, 0], [0.25, hx, z, ys, 0, 1, 0],
  [0.28, hx, z, ys, 0, 0, 0], [0.34, ax, z, ys, 1, 0, 0], [0.78, ax, z, ys, 1, 0, 0], [0.82, ax, z, ys, 0, 0, 0],
  [0.88, hx, z, ys, 0, 0, 0], [0.9, hx, z, ys, 0, 1, 0], [0.93, hx, z, ys, 0, 1, 0], [0.95, hx, z, ys, 0, 0, 0],
  [0.98, fx, -0.7, 0, 1, 0, 0], [1, fx, -0.7, 0, 1, 0, 1],
];
const ev = (k: K[], p: number) => {
  let i = 0; while (i < k.length - 2 && p > k[i + 1][0]) i++;
  const a = k[i], b = k[i + 1], f = ss((p - a[0]) / (b[0] - a[0]));
  return a.map((v, j) => v + (b[j] - v) * f);
};
const cam = [ // p, pos, look
  [0, 0, 2.8, 11, 0, 1.7, 0], [0.2, 0, 2.2, 6.2, 0, 1.6, 0], [0.3, 2, 2.8, 8.5, 0, 2.5, 0],
  [0.5, -2.5, 3, 8.5, 0, 2.5, 0], [0.78, 2, 2.8, 8.5, 0, 2.5, 0], [0.9, 0, 2.2, 6.2, 0, 1.7, 0], [1, 0, 2.4, 6.8, 0, 2.3, 0],
];

const bx = (w: number, h: number, d: number, c: string, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));
  m.position.set(x, y, z); return m;
};
const pivot = (x: number, y: number, z: number, ...kids: THREE.Object3D[]) => { const g = new THREE.Group(); g.position.set(x, y, z); g.add(...kids); return g; };

function makeChar(o: { skin: string; shirt: string; pants: string; hair?: string; long?: boolean; turban?: boolean }) {
  const root = new THREE.Group();
  const head = pivot(0, 1.5, 0, bx(0.5, 0.5, 0.5, o.skin, 0, 0.25, 0),
    bx(0.09, 0.09, 0.02, '#fff', -0.12, 0.3, 0.26), bx(0.09, 0.09, 0.02, '#fff', 0.12, 0.3, 0.26),
    bx(0.05, 0.07, 0.03, '#222', -0.12, 0.3, 0.27), bx(0.05, 0.07, 0.03, '#222', 0.12, 0.3, 0.27));
  if (o.turban) {
    const N1 = '#16255a', N2 = '#1f3478', N3 = '#0c1738';
    [0.4, 0.5, 0.6].forEach((y, i) => { const w = bx(0.62 - i * 0.02, 0.11, 0.62 - i * 0.02, i % 2 ? N2 : N1, 0, y, 0); w.rotation.y = (i - 1) * 0.12; head.add(w); });
    head.add(bx(0.5, 0.14, 0.5, N1, 0, 0.72, 0), bx(0.3, 0.18, 0.3, N2, 0, 0.86, 0), bx(0.34, 0.2, 0.06, N3, 0, 0.52, 0.31), bx(0.2, 0.12, 0.05, N1, 0, 0.44, 0.34),
      bx(0.54, 0.22, 0.54, '#16120f', 0, 0.1, 0), bx(0.18, 0.04, 0.02, '#c98d6a', 0, 0.2, 0.28));
  } else {
    head.add(bx(0.54, 0.16, 0.54, o.hair!, 0, 0.52, 0), bx(0.54, 0.3, 0.1, o.hair!, 0, 0.35, -0.22), bx(0.16, 0.04, 0.02, '#a0524a', 0, 0.12, 0.26));
    if (o.long) head.add(bx(0.54, 0.7, 0.12, o.hair!, 0, 0.1, -0.22), bx(0.08, 0.5, 0.5, o.hair!, -0.29, 0.25, -0.02), bx(0.08, 0.5, 0.5, o.hair!, 0.29, 0.25, -0.02));
  }
  const arm = (x: number) => pivot(x, 1.5, 0, bx(0.25, 0.55, 0.25, o.shirt, 0, -0.275, 0), bx(0.25, 0.2, 0.25, o.skin, 0, -0.65, 0));
  const leg = (x: number) => pivot(x, 0.75, 0, bx(0.25, 0.75, 0.25, o.pants, 0, -0.375, 0));
  const aR = arm(-0.375), aL = arm(0.375), lR = leg(-0.125), lL = leg(0.125);
  root.add(bx(0.5, 0.75, 0.25, o.shirt, 0, 1.125, 0), head, aR, aL, lR, lL);
  return { root, head, aR, aL, lR, lL };
}

function chair() {
  const g = new THREE.Group();
  g.add(bx(0.6, 0.08, 0.6, '#8a5a2b', 0, 0.42, 0), bx(0.6, 0.7, 0.08, '#7a4d22', 0, 0.8, -0.26));
  [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => g.add(bx(0.07, 0.4, 0.07, '#5e3a18', x, 0.2, z)));
  return g;
}
function laptop() {
  const g = new THREE.Group();
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshBasicMaterial({ color: '#6cd4ff' }));
  scr.rotation.y = Math.PI; scr.position.set(0, 0.28, -0.025);
  const s = pivot(0, 0.03, 0.27, bx(0.8, 0.55, 0.04, '#222', 0, 0.28, 0), scr); s.rotation.x = 0.25;
  g.add(bx(0.8, 0.05, 0.55, '#555'), s); return g;
}
function table(w: number, d: number) {
  const g = new THREE.Group();
  g.add(bx(w, 0.1, d, '#a8743a', 0, 1.05, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(bx(0.12, 1, 0.12, '#6b4420', (a * (w - 0.2)) / 2, 0.5, (b * (d - 0.2)) / 2)));
  return g;
}

export default function World() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c9d1dd');
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight('#fff6e8', 1.5));
    const sun = new THREE.DirectionalLight('#fff4d6', 2.2); sun.position.set(6, 12, 8); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 12, bottom: -12, far: 40 });
    scene.add(sun);

    // office
    const glow = (m: THREE.Mesh, c: string) => { (m.material as THREE.MeshLambertMaterial).emissive.set(c); return m; };
    const fl = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), 30 * 18);
    let n = 0; const c = new THREE.Color();
    for (let x = -14; x <= 15; x++) for (let z = -8; z <= 9; z++) {
      fl.setMatrixAt(n, new THREE.Matrix4().makeTranslation(x, -0.5, z));
      fl.setColorAt(n++, c.set((x + z) % 2 ? '#b98b57' : '#a97c4a').offsetHSL(0, 0, (Math.random() - 0.5) * 0.03));
    }
    fl.receiveShadow = true; scene.add(fl);
    scene.add(bx(10.4, 0.03, 6.8, '#e8e1cf', 0, 0.015, 0), bx(10, 0.04, 6.4, '#2f4470', 0, 0.03, 0));
    scene.add(bx(32, 10, 0.4, '#dfe4ec', 0, 5, -6.5), bx(32, 0.4, 0.5, '#8b6b43', 0, 0.2, -6.2),
      bx(0.4, 10, 18, '#d3dae6', -15, 5, 1.5), bx(0.4, 10, 18, '#d3dae6', 15, 5, 1.5));
    [-6, 6].forEach((x) => {
      scene.add(bx(4.4, 3.4, 0.2, '#fff', x, 5, -6.25), glow(bx(4, 3, 0.1, '#9ad8ff', x, 5, -6.15), '#7fc4f0'), bx(0.12, 3, 0.12, '#fff', x, 5, -6.08), bx(4, 0.12, 0.12, '#fff', x, 5, -6.08));
    });
    scene.add(bx(4.3, 2.7, 0.1, '#777', 0, 4.8, -6.25), bx(4, 2.4, 0.12, '#fafafa', 0, 4.8, -6.2));
    for (let i = 0; i < 14; i++) scene.add(bx(0.45, 0.45, 0.02, ['#ffd84a', '#ff8fb3', '#7fe0a0', '#8fc8ff'][i % 4], -1.6 + (i % 7) * 0.53, 5.3 - Math.floor(i / 7) * 0.7, -6.12));
    scene.add(bx(1.8, 0.05, 0.02, '#2255cc', 0.2, 4.2, -6.12), bx(1.2, 0.05, 0.02, '#cc3355', -0.3, 4.05, -6.12));
    [-9.5, 9.5].forEach((x) => {
      scene.add(bx(2.6, 3.8, 0.8, '#7a4d22', x, 1.9, -5.9));
      for (let r = 0; r < 3; r++) for (let b = 0; b < 8; b++) scene.add(bx(0.22, 0.6, 0.5, ['#c0392b', '#2980b9', '#27ae60', '#f1c40f', '#8e44ad', '#ecf0f1'][(b * 5 + r * 3) % 6], x - 1 + b * 0.28, 0.75 + r * 1.1, -5.6));
    });
    [[-7.8, -5.5], [7.8, -5.5], [-13, 2], [13, 2], [-4.5, -5.6]].forEach(([x, z]) => scene.add(bx(0.6, 0.5, 0.6, '#b5654a', x, 0.25, z), bx(0.9, 0.9, 0.9, '#2e8b3d', x, 1, z), bx(0.5, 0.6, 0.5, '#3aa04a', x, 1.75, z)));

    // actors
    const J = makeChar({ skin: '#a9713f', shirt: '#d9dde8', pants: '#26324d', turban: true });
    const M = makeChar({ skin: '#e0b08a', shirt: '#3a8f4e', pants: '#3a3a8a', hair: '#3b2a1a' });
    const W = makeChar({ skin: '#f1c6a0', shirt: '#d6538a', pants: '#4a4a4a', hair: '#6b3f1d', long: true });
    const actors = [
      { ch: J, k: keys(-9, -1.75, -0.8, 0, H, 0), wave: false },
      { ch: M, k: keys(9, 1.75, 0.8, 0.75, -H, 1.7), wave: false },
      { ch: W, k: keys(9.5, 1.75, 0.95, -0.75, -H, -1.7), wave: true },
    ];
    actors.forEach((a) => scene.add(a.ch.root));

    // props
    const tableA = table(1.4, 2.8);
    const chA = [[-1.75, 0, H], [1.75, 0.75, -H], [1.75, -0.75, -H]].map(([x, z, y]) => { const c = chair(); c.position.set(x, 0, z); c.rotation.y = y; return c; });
    const desk = table(5.8, 1.1); desk.position.z = 0.45;
    [-1.7, 0, 1.7].forEach((x) => { const l = laptop(); l.position.set(x, 1.1, 0.0); desk.add(l); });
    const chB = [-1.7, 0, 1.7].map((x) => { const c = chair(); c.position.set(x, 0, -0.7); return c; });
    const props = [tableA, ...chA, desk, ...chB];
    scene.add(...props);
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && o !== fl) o.castShadow = true; });

    let asp = 1;
    const onResize = () => { renderer.setSize(innerWidth, innerHeight, false); asp = innerWidth / innerHeight; camera.aspect = asp; camera.updateProjectionMatrix(); };
    onResize(); addEventListener('resize', onResize);

    let cur = 0, raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime(), dt = clock.getDelta();
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      cur += (Math.min(1, scrollY / max) - cur) * 0.08;
      const p = cur; document.documentElement.style.setProperty('--p', p.toFixed(4));

      actors.forEach(({ ch, k, wave }, id) => {
        const s = ev(k, p), a = ev(k, p + 0.004), b = ev(k, Math.max(0, p - 0.004));
        const mv = Math.min(1, Math.hypot(a[1] - b[1], a[2] - b[2]) / 0.008 / 5) * (1 - s[4]);
        const ph = (s[1] + s[2]) * 4, sw = Math.sin(ph) * 0.85 * mv, sit = s[4], ty = s[6];
        ch.root.position.set(s[1], -0.25 * sit + Math.abs(Math.sin(ph)) * 0.05 * mv, s[2]); ch.root.rotation.y = s[3];
        ch.lL.rotation.x = sw * (1 - sit) - H * sit; ch.lR.rotation.x = -sw * (1 - sit) - H * sit;
        const bob = Math.sin(t * 16 + id) * 0.1 * ty, rest = -1.05 * sit - 0.2 * ty;
        ch.aL.rotation.x = -sw * 0.8 * (1 - sit) + rest + bob;
        const baseR = sw * 0.8 * (1 - sit) + rest - bob, g = s[5];
        const tgt = wave ? -2.7 + Math.sin(t * 9) * 0.25 : -H + Math.sin(t * 12) * 0.16;
        ch.aR.rotation.x = baseR + (tgt - baseR) * g;
        ch.head.rotation.x = Math.sin(t * 2 + id) * 0.03 + 0.25 * ty;
        ch.head.rotation.y = Math.sin(t * 0.9 + id * 2) * 0.12 * (1 - mv);
      });

      const pop = (a: number, b: number) => Math.max(0.0001, ss((p - a) / (b - a)));
      const sA = pop(0.3, 0.34) * (1 - ss((p - 0.82) / 0.06)), sCh = pop(0.3, 0.34) * (1 - ss((p - 0.78) / 0.04)), sB = pop(0.95, 0.98);
      tableA.scale.setScalar(Math.max(0.0001, sA)); chA.forEach((c) => c.scale.setScalar(Math.max(0.0001, sCh)));
      desk.scale.setScalar(sB); chB.forEach((c) => c.scale.setScalar(sB));
      props.forEach((o) => (o.visible = o.scale.x > 0.01));

      let i = 0; while (i < cam.length - 2 && p > cam[i + 1][0]) i++;
      const a = cam[i], b = cam[i + 1], f = ss((p - a[0]) / (b[0] - a[0])), v = a.map((q, j) => q + (b[j] - q) * f);
      const zoom = asp < 0.8 ? 1.7 : asp < 1.2 ? 1.3 : 1;
      camera.position.set(v[1] + Math.sin(t * 0.3) * 0.2, v[2], v[3] * zoom);
      camera.lookAt(v[4], v[5], v[6]);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); };
  }, []);
  return <canvas ref={ref} className="world" aria-hidden="true" />;
}
