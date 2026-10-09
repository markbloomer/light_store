import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { cctToRgb } from '../../lib/color';
import styles from './ModelViewer.module.css';

type Props = {
  src: string;
  cct: number;
  finish: string;
  lit?: boolean;
  /** Orbit, and clicks on the housing or the light. Cards leave this off so the link still works. */
  interactive?: boolean;
  onLightClick?: () => void;
  onBodyClick?: () => void;
  className?: string;
};

const FINISH: Record<string, { color: string; rough: number }> = {
  Black: { color: '#16171a', rough: 0.45 },
  White: { color: '#f4f2ec', rough: 0.4 },
};

const BEAM_LEN = 0.42;
const BEAM_Y = 0.004;
const APERTURE = 0.09;
const LED_RINGS = [0.0405, 0.0495, 0.0585, 0.0675, 0.0765, 0.0855];

type ViewName = 'hero' | 'top' | 'front' | 'under' | 'hook';

/** Same camera bookmarks as the standalone viewer. */
const VIEWS: Record<ViewName, { dir: [number, number, number]; dist: number; target: [number, number, number] }> = {
  hero: { dir: [0, -0.34, 0.95], dist: 0.62, target: [0, 0.075, 0] },
  top: { dir: [0.62, 0.55, 0.78], dist: 0.62, target: [0, 0.075, 0] },
  front: { dir: [0, -0.2, 1], dist: 1.15, target: [0, -0.08, 0] },
  under: { dir: [-0.22, -0.48, 0.4], dist: 0.62, target: [0, 0.01, 0] },
  hook: { dir: [0.22, 0.24, 0.42], dist: 0.3, target: [0, 0.11, 0] },
};

type ViewCommand = { view: ViewName; rotate: boolean; dims: boolean; hideLens: boolean; wire: boolean };

let draco: DRACOLoader | null = null;
const cache = new Map<string, Promise<GLTF>>();

function loadModel(src: string) {
  let pending = cache.get(src);
  if (!pending) {
    if (!draco) draco = new DRACOLoader().setDecoderPath('/draco/');
    const loader = new GLTFLoader().setDRACOLoader(draco);
    pending = loader.loadAsync(src);
    cache.set(src, pending);
  }
  return pending;
}

function kelvin(k: number) {
  const [r, g, b] = cctToRgb(k);
  return new THREE.Color(r / 255, g / 255, b / 255);
}

/**
 * The HCY0823L viewer from lighting_render, fitted to a product image.
 * Materials are cloned per instance so two listings can show different finishes.
 */
export function ModelViewer({ src, cct, finish, lit = true, interactive = false, onLightClick, onBodyClick, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const appearance = useRef({ cct, finish, lit, onLightClick, onBodyClick });
  appearance.current = { cct, finish, lit, onLightClick, onBodyClick };
  const [view, setView] = useState<ViewName>('hero');
  const [rotate, setRotate] = useState(false);
  const [dims, setDims] = useState(false);
  const [hideLens, setHideLens] = useState(false);
  const [wire, setWire] = useState(false);
  const viewCommand = useRef<ViewCommand>({ view, rotate, dims, hideLens, wire });
  viewCommand.current = { view, rotate, dims, hideLens, wire };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let disposed = false;
    try {
    const started = setup();
    return () => {
      disposed = true;
      started?.();
    };
    } catch (err) {
      el.dataset.error = err instanceof Error ? err.stack ?? err.message : String(err);
      return;
    }

    function setup(): (() => void) | void {
    const host = el!;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, interactive ? 2 : 1.5));
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = styles.canvas;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const key = new THREE.DirectionalLight(0xfff4ea, 2.2);
    key.position.set(-1, 1.2, 1);
    const rim = new THREE.DirectionalLight(0xeef3ff, 1.4);
    rim.position.set(1.2, 0.4, -0.6);
    const under = new THREE.DirectionalLight(0xffffff, 1.2);
    under.position.set(0.2, -1.2, 0.5);
    scene.add(key, rim, under);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.005, 20);
    const target = new THREE.Vector3(0, interactive ? 0.02 : 0.05, 0);
    const dist = interactive ? 0.92 : 0.72;
    camera.position.copy(new THREE.Vector3(0, -0.22, 1).normalize().multiplyScalar(dist).add(target));

    let controls: OrbitControls | null = null;
    if (interactive) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.12;
      controls.maxDistance = 2.2;
      controls.target.copy(target);
      controls.zoomToCursor = true;
      controls.autoRotateSpeed = 1.6;
    }

    const beamTargets: Array<THREE.ShaderMaterial | THREE.MeshBasicMaterial> = [];
    const meshes: THREE.Mesh[] = [];
    const lightRig = buildBeam(beamTargets);
    scene.add(lightRig);
    lightRig.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) meshes.push(mesh);
    });

    const owned: THREE.Material[] = [];
    const coats: THREE.MeshStandardMaterial[] = [];
    let phosphor: THREE.MeshStandardMaterial | null = null;
    let lens: THREE.MeshPhysicalMaterial | null = null;
    let lensMesh: THREE.Mesh | null = null;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = styles.labels;
    host.appendChild(labelRenderer.domElement);
    const dimsGroup = buildDimensions(styles.dimLabel);
    scene.add(dimsGroup);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      labelRenderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = w / h < 0.9 ? 46 : 36;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let seen = '';
    const apply = () => {
      const a = appearance.current;
      const sig = `${a.cct}|${a.finish}|${a.lit}`;
      if (sig === seen) return;
      seen = sig;
      const color = kelvin(a.cct);
      for (const m of beamTargets) {
        if (m instanceof THREE.ShaderMaterial) m.uniforms.uColor.value.copy(color);
        else m.color.copy(color);
      }
      lightRig.visible = a.lit;
      const paint = FINISH[a.finish];
      if (paint) {
        for (const coat of coats) {
          coat.color.set(paint.color);
          coat.roughness = paint.rough;
        }
      }
      if (phosphor) {
        phosphor.emissive.copy(color);
        phosphor.emissiveIntensity = a.lit ? 3.5 : 1.2;
      }
      if (lens) {
        lens.emissive.copy(color);
        lens.emissiveIntensity = a.lit ? 0.06 : 0;
      }
      const studio = !a.lit;
      scene.environmentIntensity = studio ? 0.55 : 0.3;
      key.intensity = studio ? 2.2 : 0.75;
      rim.intensity = studio ? 1.4 : 0.55;
      under.intensity = studio ? 1.2 : 0.18;
    };

    let running = true;
    let frame = 0;
    let spin = 0;
    let shownView: ViewName = 'hero';
    let tween: { t: number; p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3 } | null = null;
    let last = performance.now();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const goTo = (name: ViewName, instant = false) => {
      const v = VIEWS[name];
      const nextTarget = new THREE.Vector3(...v.target);
      const pos = new THREE.Vector3(...v.dir).normalize().multiplyScalar(v.dist).add(nextTarget);
      if (instant || !controls) {
        camera.position.copy(pos);
        controls?.target.copy(nextTarget);
        return;
      }
      tween = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: nextTarget };
    };
    if (interactive) goTo('hero', true);
    controls?.addEventListener('start', () => {
      tween = null;
    });

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!running) return;
      apply();
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const cmd = viewCommand.current;
      dimsGroup.visible = cmd.dims;
      if (lensMesh) lensMesh.visible = !cmd.hideLens;
      for (const material of owned) {
        if ('wireframe' in material) material.wireframe = cmd.wire;
      }
      if (!interactive) {
        spin += 0.004;
        camera.position.set(Math.sin(spin) * dist * 0.85, target.y - 0.16, Math.cos(spin) * dist * 0.85);
        camera.lookAt(target);
      } else if (controls) {
        if (cmd.view !== shownView) {
          shownView = cmd.view;
          goTo(cmd.view);
        }
        if (tween) {
          tween.t = Math.min(tween.t + dt / 0.9, 1);
          const k = ease(tween.t);
          camera.position.lerpVectors(tween.p0, tween.p1, k);
          controls.target.lerpVectors(tween.t0, tween.t1, k);
          if (tween.t >= 1) tween = null;
        }
        controls.autoRotate = cmd.rotate && !tween;
      }
      controls?.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down: [number, number] | null = null;
    const onDown = (e: PointerEvent) => {
      down = [e.clientX, e.clientY];
    };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit) return;
      const role = roleOf(hit.object);
      const a = appearance.current;
      if (role === 'light') a.onLightClick?.();
      else a.onBodyClick?.();
    };
    if (interactive) {
      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('pointerup', onUp);
    }

    const visibility = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    visibility.observe(host);

    loadModel(src)
      .then((gltf) => {
        if (disposed) return;
        const root = gltf.scene.clone(true);
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone();
          mesh.material = material;
          owned.push(material);
          meshes.push(mesh);
          if (material.name === 'PowderCoat_Black') coats.push(material as THREE.MeshStandardMaterial);
          if (material.name === 'LED_Phosphor') phosphor = material as THREE.MeshStandardMaterial;
          if (material.name === 'Polycarbonate_Frosted') {
            lensMesh = mesh;
            lens = material as THREE.MeshPhysicalMaterial;
            lens.transmission = 0.9;
            lens.roughness = 0.42;
            lens.thickness = 0.002;
            lens.ior = 1.586;
            lens.color.set(0xf2f3f5);
            lens.side = THREE.DoubleSide;
          }
        });
        scene.add(root);
        seen = '';
        apply();
        host.dataset.ready = 'true';
      })
      .catch((err) => {
        console.error(err);
      });

    resize();
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls?.dispose();
      for (const m of owned) m.dispose();
      lightRig.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const material = mesh.material as THREE.Material;
        const map = (material as THREE.MeshBasicMaterial).map;
        map?.dispose();
        material.dispose();
      });
      pmrem.dispose();
      dimsGroup.traverse((o) => {
        const line = o as THREE.Line;
        line.geometry?.dispose();
        (line.material as THREE.Material | undefined)?.dispose?.();
      });
      labelRenderer.domElement.remove();
      renderer.dispose();
      renderer.domElement.remove();
    };
    }
    // Appearance is read from a ref, so the scene is built once per model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, interactive]);

  return (
    <div ref={rootRef} className={`${styles.root} ${interactive ? styles.interactive : ''} ${className ?? ''}`}>
      {interactive && (
        <div className={styles.views} role="toolbar" aria-label="View">
          <ViewButton label="Catalog angle" pressed={view === 'hero'} onClick={() => setView('hero')}>
            <path d="M12 3 4 7.5v9L12 21l8-4.5v-9Z" />
            <path d="m12 12-8-4.5M12 12v9M12 12l8-4.5" />
          </ViewButton>
          <ViewButton label="Top three-quarter" pressed={view === 'top'} onClick={() => setView('top')}>
            <ellipse cx="12" cy="9" rx="8" ry="3" />
            <path d="M4 9v2.5c0 3.2 3.6 5.5 8 5.5s8-2.3 8-5.5V9" />
          </ViewButton>
          <ViewButton label="Front" pressed={view === 'front'} onClick={() => setView('front')}>
            <path d="M12 3v4" />
            <path d="M9 7h6" />
            <path d="M4 14c1.4-4 4-6.5 8-6.5S18.6 10 20 14" />
            <path d="M3 16.5h18" />
          </ViewButton>
          <ViewButton label="Underside" pressed={view === 'under'} onClick={() => setView('under')}>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          </ViewButton>
          <ViewButton label="Hook" pressed={view === 'hook'} onClick={() => setView('hook')}>
            <path d="M7 4h10" />
            <path d="M12 4v7" />
            <path d="M12 11c0 4 6 3.5 6 8" />
            <path d="M14 16.5 18 15" />
          </ViewButton>
          <span className={styles.sep} />
          <ViewButton label="Auto-rotate" pressed={rotate} onClick={() => setRotate((v) => !v)}>
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </ViewButton>
          <ViewButton label="Dimensions" pressed={dims} onClick={() => setDims((v) => !v)}>
            <path d="M4 7h16M4 17h16" />
            <path d="M7 7v10M17 7v10M12 7v10" />
          </ViewButton>
          <ViewButton label="Hide lens" pressed={hideLens} onClick={() => setHideLens((v) => !v)}>
            <path d="m3 3 18 18" />
            <path d="M10.5 10.7A3 3 0 0 0 13.3 13.5" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.6 11.6 0 0 1-4.2 5.2M6.1 6.1C3.8 7.6 2 10.2 1 12.5 2.7 16.9 7 20 12 20c1.5 0 2.9-.3 4.2-.8" />
          </ViewButton>
          <ViewButton label="Wireframe" pressed={wire} onClick={() => setWire((v) => !v)}>
            <rect x="4" y="4" width="16" height="16" rx="1" />
            <path d="M4 12h16M12 4v16" />
          </ViewButton>
        </div>
      )}
    </div>
  );
}

function ViewButton({ label, pressed, onClick, children }: { label: string; pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.viewBtn} aria-pressed={pressed} aria-label={label} title={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function buildDimensions(labelClass: string) {
  const group = new THREE.Group();
  group.visible = false;
  const add = (a: [number, number, number], b: [number, number, number], text: string, offset: [number, number, number] = [0, 0, 0]) => {
    const material = new THREE.LineBasicMaterial({ color: 0x0f7c9e, depthTest: false, transparent: true });
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 10;
    group.add(line);
    for (const p of [a, b]) {
      const tick = new THREE.Mesh(
        new THREE.SphereGeometry(0.0018),
        new THREE.MeshBasicMaterial({ color: 0x0f7c9e, depthTest: false }),
      );
      tick.position.set(...p);
      tick.renderOrder = 10;
      group.add(tick);
    }
    if (!text) return;
    const div = document.createElement('div');
    div.className = labelClass;
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.set((a[0] + b[0]) / 2 + offset[0], (a[1] + b[1]) / 2 + offset[1], (a[2] + b[2]) / 2 + offset[2]);
    group.add(label);
  };
  add([-0.14, -0.012, 0], [0.14, -0.012, 0], 'Ø 11" (280 mm)', [0, -0.01, 0]);
  add([-0.165, 0, 0], [-0.165, 0.182, 0], '7-1/8" (182 mm)', [-0.012, 0.02, 0]);
  add([-0.165, 0, 0], [-0.142, 0, 0], '');
  add([-0.165, 0.182, 0], [0, 0.182, 0], '');
  add([-0.0565, 0.0815, 0], [0.0565, 0.0815, 0], 'Ø 113 mm driver', [0, 0.01, 0]);
  return group;
}

function roleOf(object: THREE.Object3D): 'light' | 'body' {
  for (let o: THREE.Object3D | null = object; o; o = o.parent) {
    if (o.userData.role === 'light') return 'light';
    const mesh = o as THREE.Mesh;
    const name = !Array.isArray(mesh.material) ? mesh.material?.name ?? '' : '';
    if (/LED|Polycarbonate|Phosphor/.test(name)) return 'light';
  }
  return 'body';
}

/** The same beam the standalone viewer draws under the lens: aperture, rays, and a floor pool. */
function buildBeam(targets: Array<THREE.ShaderMaterial | THREE.MeshBasicMaterial>) {
  const rig = new THREE.Group();
  const color = kelvin(4000);

  const apertureMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: color.clone() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uColor; void main(){
      float r = length(vUv - 0.5) * 2.0;
      float band = smoothstep(0.34, 0.52, r) * (1.0 - smoothstep(0.78, 0.98, r));
      float a = band * 0.4;
      if (a < 0.01) discard;
      gl_FragColor = vec4(uColor * a, 1.0);
    }`,
  });
  const aperture = new THREE.Mesh(new THREE.CircleGeometry(APERTURE + 0.012, 64), apertureMat);
  aperture.rotation.x = -Math.PI / 2;
  aperture.position.y = -BEAM_Y;
  aperture.userData.role = 'light';
  rig.add(aperture);
  targets.push(apertureMat);

  const s = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = s;
  const g = canvas.getContext('2d')!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(255,255,255,0.95)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.4)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const poolMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas),
    color: color.clone(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    opacity: 0.28,
  });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 48), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -BEAM_LEN - BEAM_Y;
  pool.scale.setScalar(APERTURE + Math.tan(THREE.MathUtils.degToRad(55)) * BEAM_LEN);
  pool.userData.role = 'light';
  rig.add(pool);
  targets.push(poolMat);

  const rayMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: color.clone() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uColor; void main(){
      float across = exp(-pow((vUv.x - 0.5) * 2.2, 2.0));
      float along = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 1.05);
      float a = across * along * 0.22;
      if (a < 0.004) discard;
      gl_FragColor = vec4(uColor * a, 1.0);
    }`,
  });
  const positions: number[] = [];
  const uvs: number[] = [];
  const push = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, ua: number[], ub: number[], uc: number[]) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    uvs.push(...ua, ...ub, ...uc);
  };
  LED_RINGS.forEach((ring, ri) => {
    const count = 8 + ri * 2;
    for (let j = 0; j < count; j++) {
      const az = (j / count) * Math.PI * 2 + ri * 0.31;
      const origin = new THREE.Vector3(Math.cos(az) * ring, -BEAM_Y, Math.sin(az) * ring);
      const nadir = THREE.MathUtils.degToRad(12 + ((j + ri) % 5) * 9);
      const dir = new THREE.Vector3(Math.cos(az) * Math.sin(nadir), -Math.cos(nadir), Math.sin(az) * Math.sin(nadir));
      const tip = origin.clone().addScaledVector(dir, BEAM_LEN * (0.7 + ((j + ri) % 4) * 0.08));
      const side = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az));
      const w0 = 0.007;
      const w1 = 0.022 + nadir * 0.02;
      const a = origin.clone().addScaledVector(side, w0);
      const b = origin.clone().addScaledVector(side, -w0);
      const c = tip.clone().addScaledVector(side, -w1);
      const d = tip.clone().addScaledVector(side, w1);
      push(a, b, c, [0, 0], [1, 0], [1, 1]);
      push(a, c, d, [0, 0], [1, 1], [0, 1]);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  const rays = new THREE.Mesh(geo, rayMat);
  rays.frustumCulled = false;
  rays.userData.role = 'light';
  rig.add(rays);
  targets.push(rayMat);

  return rig;
}
