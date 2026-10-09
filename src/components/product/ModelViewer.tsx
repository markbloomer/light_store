import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
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
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!running) return;
      apply();
      if (!interactive) {
        spin += 0.004;
        camera.position.set(Math.sin(spin) * dist * 0.85, target.y - 0.16, Math.cos(spin) * dist * 0.85);
        camera.lookAt(target);
      }
      controls?.update();
      renderer.render(scene, camera);
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
      renderer.dispose();
      renderer.domElement.remove();
    };
    }
    // Appearance is read from a ref, so the scene is built once per model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, interactive]);

  return <div ref={rootRef} className={`${styles.root} ${interactive ? styles.interactive : ''} ${className ?? ''}`} />;
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
