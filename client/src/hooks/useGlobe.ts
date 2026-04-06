import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useDashboardStore } from '../store/dashboardStore';
import { geoToXYZ } from '../utils/geoToXYZ';
import type { CrisisSignal } from '../types';

// Shaders
const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0,0,1)), 2.0);
    gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity;
  }
`;
const markerVertex = `
  uniform float uTime;
  uniform float uPulse;
  void main() {
    float pulse = uPulse * (0.08 * sin(uTime * 4.0));
    vec3 pos = position * (1.0 + pulse);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const markerFragment = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPulse;
  void main() {
    float glow = 1.0 + uPulse * (0.5 + 0.5 * sin(uTime * 4.0)) * 0.6;
    gl_FragColor = vec4(uColor * glow, 1.0);
  }
`;
const beaconVertex = `
  uniform float uTime;
  uniform float uPhase;
  void main() {
    float scale = 1.0 + mod(uTime * 0.8 + uPhase, 1.0) * 3.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
  }
`;
const beaconFragment = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPhase;
  void main() {
    float progress = mod(uTime * 0.8 + uPhase, 1.0);
    gl_FragColor = vec4(uColor, (1.0 - progress) * 0.6);
  }
`;

function getMarkerColor(signal: CrisisSignal): number {
  switch (signal.type) {
    case 'environmental': return signal.severity === 'critical' ? 0xFF3B3B : 0xFF9500;
    case 'weather': return 0xFF6BDF;
    case 'market': return 0x4DA6FF;
    default: return 0x50E3C2;
  }
}

// Plain function — no hooks, safe to call from anywhere
function buildMarkers(
  group: THREE.Group,
  signals: CrisisSignal[],
  activeFilter: string
) {
  // Dispose and clear
  while (group.children.length > 0) {
    const child = group.children[0] as any;
    child.geometry?.dispose();
    if (child.material) {
      Array.isArray(child.material)
        ? child.material.forEach((m: any) => m.dispose())
        : child.material.dispose();
    }
    group.remove(child);
  }

  const filtered = signals.filter(s => activeFilter === 'all' || s.type === activeFilter);

  filtered.forEach(signal => {
    const color = getMarkerColor(signal);
    const threeColor = new THREE.Color(color);
    const isCritical = signal.severity === 'critical';
    const tipHeight = isCritical ? 1.18 : 1.13;

    const base = geoToXYZ(signal.lat, signal.lng, 1.0);
    const tip = geoToXYZ(signal.lat, signal.lng, tipHeight);
    const bv = new THREE.Vector3(base.x, base.y, base.z);
    const tv = new THREE.Vector3(tip.x, tip.y, tip.z);

    // Spike
    const spikeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: isCritical ? 0.9 : 0.7 });
    const spike = new THREE.Line(new THREE.BufferGeometry().setFromPoints([bv, tv]), spikeMat);
    group.add(spike);

    // Orb at tip
    const orbSize = isCritical ? 0.028 : 0.020;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(orbSize, 16, 16),
      new THREE.ShaderMaterial({
        vertexShader: markerVertex,
        fragmentShader: markerFragment,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: isCritical ? 1.0 : 0.3 },
          uColor: { value: threeColor.clone() },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    orb.position.copy(tv);
    orb.userData = { signal };
    group.add(orb);

    // Halo
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(orbSize * 2.5, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, depthWrite: false })
    );
    halo.position.copy(tv);
    group.add(halo);

    // Beacon rings for critical/warning
    if (isCritical || signal.severity === 'warning') {
      const ringCount = isCritical ? 3 : 2;
      for (let i = 0; i < ringCount; i++) {
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(orbSize * 1.2, 16, 16),
          new THREE.ShaderMaterial({
            vertexShader: beaconVertex,
            fragmentShader: beaconFragment,
            uniforms: {
              uTime: { value: 0 },
              uPhase: { value: i / ringCount },
              uColor: { value: threeColor.clone() },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        beacon.position.copy(tv);
        beacon.userData = { isBeacon: true };
        group.add(beacon);
      }
    }

    // Ground disc
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.018, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    );
    disc.position.copy(bv);
    disc.lookAt(0, 0, 0);
    disc.rotateX(Math.PI / 2);
    group.add(disc);
  });
}

export const useGlobe = (containerRef: React.RefObject<HTMLDivElement>) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number>();
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group>(new THREE.Group());
  const flyTargetRef = useRef<THREE.Vector3 | null>(null);
  const earthRotationPausedRef = useRef(false);

  const { signals, setSelectedSignal, activeFilter } = useDashboardStore();

  // Marker update effect — only runs when scene already exists
  useEffect(() => {
    if (!sceneRef.current) return;
    buildMarkers(markersGroupRef.current, signals, activeFilter);
  }, [signals, activeFilter]);

  // Initialization effect
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(renderer.domElement.style, { position: 'absolute', top: '0', left: '0', display: 'block', zIndex: '0' });
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 5.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controlsRef.current = controls;

    // Cancel fly-to the instant the user touches the globe
    controls.addEventListener('start', () => {
      flyTargetRef.current = null;
      earthRotationPausedRef.current = false;
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const loader = new THREE.TextureLoader();
    const loadTex = (url: string, isColor = true) => {
      const t = loader.load(url, undefined, undefined, () => console.error(`Failed: ${url}`));
      if (isColor) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: loadTex('/textures/earth_daymap.jpg'),
        emissiveMap: loadTex('/textures/earth_nightmap.jpg'),
        emissive: new THREE.Color(0xffffcc),
        emissiveIntensity: 0.8,
        normalMap: loadTex('/textures/earth_normalmap.jpg', false),
        normalScale: new THREE.Vector2(0.05, 0.05),
        specularMap: loadTex('/textures/earth_specularmap.jpg', false),
        specular: new THREE.Color(0x333333),
        shininess: 15,
      })
    );
    earthRef.current = earth;
    scene.add(earth);

    // Attach markers to earth and build them immediately with current signals
    earth.add(markersGroupRef.current);
    buildMarkers(markersGroupRef.current, signals, activeFilter);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.01, 64, 64),
      new THREE.MeshPhongMaterial({ map: loadTex('/textures/earth_clouds.jpg'), transparent: true, opacity: 0.4, depthWrite: false })
    );
    cloudsRef.current = clouds;
    scene.add(clouds);

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 64, 64),
      new THREE.ShaderMaterial({ vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true })
    ));

    const starPos: number[] = [];
    for (let i = 0; i < 15000; i++) {
      const r = 50, t = 2 * Math.PI * Math.random(), p = Math.acos(2 * Math.random() - 1);
      starPos.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.07, color: 0xffffff, transparent: true, opacity: 0.8 })));

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(markersGroupRef.current.children, true).find(h => h.object.userData?.signal);
      if (hit) {
        setSelectedSignal(hit.object.userData.signal);
        controls.autoRotate = false;
      }
    };
    renderer.domElement.addEventListener('click', onClick);

    const flyTo = (lat: number, lng: number) => {
      const dist = camera.position.length();
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180) + (earthRef.current?.rotation.y ?? 0);
      flyTargetRef.current = new THREE.Vector3(
        -dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.cos(phi),
        dist * Math.sin(phi) * Math.sin(theta)
      );
      controls.autoRotate = false;
      earthRotationPausedRef.current = true;
    };
    (window as any).giccFlyTo = flyTo;

    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate);
      if (flyTargetRef.current) {
        camera.position.lerp(flyTargetRef.current, 0.06);
        if (camera.position.distanceTo(flyTargetRef.current) < 0.015) {
          flyTargetRef.current = null;
          earthRotationPausedRef.current = false;
        }
      }
      controls.update();
      if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0001;
      if (earthRef.current && !earthRotationPausedRef.current) earthRef.current.rotation.y += 0.00007;
      const t = time * 0.001;
      markersGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.uTime.value = t;
        }
      });
      renderer.render(scene, camera);
    };
    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(requestRef.current!);
      renderer.dispose();
      delete (window as any).giccFlyTo;
      sceneRef.current = null;
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, setSelectedSignal]);

  return { sceneRef, cameraRef, rendererRef };
};
