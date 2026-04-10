import * as THREE from 'three';

const STATE_CONFIG = {
  idle: {
    coreColor:  0x378ADD,
    wireColor:  0x85B7EB,
    lightColor: 0x185FA5,
    spinSpeed:  0.004,
    pulseFreq:  1.2,
    pulseAmp:   0.04,
    wireOpacity:0.20,
    label:      'idle',
    ringClass:  'ring-idle',
    statusText: 'Online',
  },
  thinking: {
    coreColor:  0x7F77DD,
    wireColor:  0xCECBF6,
    lightColor: 0x534AB7,
    spinSpeed:  0.045,
    pulseFreq:  6.0,
    pulseAmp:   0.07,
    wireOpacity:0.45,
    label:      'thinking...',
    ringClass:  'ring-thinking',
    statusText: 'Thinking...',
  },
  responding: {
    coreColor:  0x1D9E75,
    wireColor:  0x5DCAA5,
    lightColor: 0x0F6E56,
    spinSpeed:  0.012,
    pulseFreq:  3.0,
    pulseAmp:   0.08,
    wireOpacity:0.38,
    label:      'responding',
    ringClass:  'ring-responding',
    statusText: 'Responding...',
  },
  error: {
    coreColor:  0xD85A30,
    wireColor:  0xF0997B,
    lightColor: 0x993C1D,
    spinSpeed:  0.008,
    pulseFreq:  8.0,
    pulseAmp:   0.05,
    wireOpacity:0.35,
    label:      'error',
    ringClass:  'ring-error',
    statusText: 'Error',
  },
};

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(ca, cb, t) {
  const ar = (ca >> 16) & 0xff, ag = (ca >> 8) & 0xff, ab = ca & 0xff;
  const br = (cb >> 16) & 0xff, bg = (cb >> 8) & 0xff, bb = cb & 0xff;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8)  |
    Math.round(ab + (bb - ab) * t)
  );
}

function buildScene(canvas, size, detail) {
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 3.4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const geo  = new THREE.IcosahedronGeometry(1, detail);
  const mat  = new THREE.MeshPhongMaterial({
    color: STATE_CONFIG.idle.coreColor,
    shininess: 90,
    transparent: true,
    opacity: 0.93,
  });
  const mesh = new THREE.Mesh(geo, mat);

  const wireGeo = new THREE.IcosahedronGeometry(1.015, detail);
  const wireMat = new THREE.MeshBasicMaterial({
    color: STATE_CONFIG.idle.wireColor,
    wireframe: true,
    transparent: true,
    opacity: STATE_CONFIG.idle.wireOpacity,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  mesh.add(wire);

  scene.add(mesh);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const ptLight = new THREE.PointLight(STATE_CONFIG.idle.lightColor, 2.2, 12);
  ptLight.position.set(2.5, 2.5, 2);
  scene.add(ptLight);

  const rimLight = new THREE.PointLight(0x4488ff, 0.6, 10);
  rimLight.position.set(-2, -1, -1);
  scene.add(rimLight);

  return { scene, camera, renderer, mesh, mat, wire, wireMat, ptLight };
}

export class Avatar {
  constructor(mainCanvasId, miniCanvasId) {
    this.state    = 'idle';
    this.time     = 0;
    this.shake    = { active: false, timer: 0, duration: 0.65 };
    this.transition = { t: 1, from: STATE_CONFIG.idle, to: STATE_CONFIG.idle };

    const mainCanvas = document.getElementById(mainCanvasId);
    const miniCanvas = document.getElementById(miniCanvasId);

    this.main = buildScene(mainCanvas, 160, 3);
    this.mini = buildScene(miniCanvas, 40,  1);

    this._bindUI();
    this._startLoop();
  }

  setState(newState) {
    if (newState === this.state) return;
    this.transition.from = STATE_CONFIG[this.state];
    this.transition.to   = STATE_CONFIG[newState];
    this.transition.t    = 0;
    this.state = newState;

    if (newState === 'error') {
      this.shake.active = true;
      this.shake.timer  = this.shake.duration;
    }

    this._updateDOMState(newState);
  }

  _updateDOMState(state) {
    const cfg = STATE_CONFIG[state];

    const ring = document.getElementById('state-ring');
    if (ring) {
      ring.className = `ring-${state}`;
    }
    const lbl = document.getElementById('state-label');
    if (lbl) lbl.textContent = cfg.label;

    const status = document.getElementById('status-text');
    if (status) status.textContent = cfg.statusText;

    const dot = document.getElementById('online-dot');
    if (dot) {
      const colors = { idle: '#1D9E75', thinking: '#7F77DD', responding: '#1D9E75', error: '#D85A30' };
      dot.style.background   = colors[state];
      dot.style.boxShadow    = `0 0 6px ${colors[state]}`;
    }

    document.querySelectorAll('.state-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.state === state);
    });
  }

  _applyToOrb(orbs, t, dt) {
    const cfg     = STATE_CONFIG[this.state];
    const fromCfg = this.transition.from;
    const toCfg   = this.transition.to;
    const tr      = this.transition.t;

    const coreHex  = lerpColor(fromCfg.coreColor,  toCfg.coreColor,  tr);
    const wireHex  = lerpColor(fromCfg.wireColor,   toCfg.wireColor,  tr);
    const lightHex = lerpColor(fromCfg.lightColor,  toCfg.lightColor, tr);
    const wOpacity = lerp(fromCfg.wireOpacity, toCfg.wireOpacity, tr);

    for (const o of orbs) {
      o.mat.color.setHex(coreHex);
      o.wireMat.color.setHex(wireHex);
      o.wireMat.opacity = wOpacity;
      o.ptLight.color.setHex(lightHex);

      o.mesh.rotation.y += cfg.spinSpeed;
      o.mesh.rotation.x  = 0.12 * Math.sin(t * 0.4);

      const pulse = 1 + cfg.pulseAmp * Math.sin(t * cfg.pulseFreq);
      o.mesh.scale.set(pulse, pulse, pulse);

      if (this.state === 'responding') {
        o.wireMat.opacity = wOpacity + 0.22 * Math.abs(Math.sin(t * cfg.pulseFreq));
      }

      if (this.shake.active) {
        o.mesh.position.x = 0.14 * Math.sin(t * 32);
        if (this.shake.timer <= 0) {
          this.shake.active = false;
          o.mesh.position.x = 0;
        }
      }
    }

    if (this.shake.active) this.shake.timer -= dt;
    if (this.transition.t < 1) this.transition.t = Math.min(1, this.transition.t + dt * 2.5);
  }

  _startLoop() {
    const dt   = 1 / 60;
    const loop = () => {
      requestAnimationFrame(loop);
      this.time += dt;
      const orbs = [this.main, this.mini];
      this._applyToOrb(orbs, this.time, dt);
      this.main.renderer.render(this.main.scene, this.main.camera);
      this.mini.renderer.render(this.mini.scene, this.mini.camera);
    };
    loop();
  }

  _bindUI() {
    document.querySelectorAll('.state-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setState(btn.dataset.state));
    });
    document.querySelectorAll('.cart-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('active-chip'));
    });
  }
}
