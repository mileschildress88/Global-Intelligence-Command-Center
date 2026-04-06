import { useEffect, useRef, useCallback } from 'react';
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
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float pulse = uPulse * (0.1 * sin(uTime * 3.0));
    vec3 pos = position * (1.0 + pulse);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const markerFragment = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPulse;
  void main() {
    float pulse = uPulse * (0.5 + 0.5 * sin(uTime * 3.0));
    float glow = 0.8 + pulse * 0.4;
    gl_FragColor = vec4(uColor * glow, 1.0);
  }
`;

export const useGlobe = (containerRef: React.RefObject<HTMLDivElement>) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number>();
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  
  const { signals, setSelectedSignal } = useDashboardStore();
  const markersGroupRef = useRef<THREE.Group>(new THREE.Group());

  const getMarkerColor = (signal: CrisisSignal) => {
    switch (signal.type) {
      case 'environmental': return signal.severity === 'critical' ? 0xE24B4A : 0xEF9F27;
      case 'weather': return 0xF4C0D1;
      case 'market': return 0x378ADD;
      default: return 0x5DCAA5;
    }
  };

  // Marker Update Effect
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear existing
    while(markersGroupRef.current.children.length > 0) {
      const child = markersGroupRef.current.children[0] as any;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      markersGroupRef.current.remove(child);
    }

    signals.forEach(signal => {
      const { x, y, z } = geoToXYZ(signal.lat, signal.lng, 1.05);
      
      const geometry = new THREE.SphereGeometry(0.02, 16, 16);
      const material = new THREE.ShaderMaterial({
        vertexShader: markerVertex,
        fragmentShader: markerFragment,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: signal.severity === 'critical' ? 1.0 : 0.0 },
          uColor: { value: new THREE.Color(getMarkerColor(signal)) }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(x, y, z);
      marker.userData = { signal };
      markersGroupRef.current.add(marker);

      if (signal.severity === 'critical') {
        const ringGeo = new THREE.RingGeometry(0.025, 0.045, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: getMarkerColor(signal),
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(x, y, z);
        ring.lookAt(0, 0, 0); // Face globe center
        ring.userData = { isRing: true, signal };
        markersGroupRef.current.add(ring);
      }

      const spikePoints = [new THREE.Vector3(x/1.05, y/1.05, z/1.05), new THREE.Vector3(x, y, z)];
      const spikeGeo = new THREE.BufferGeometry().setFromPoints(spikePoints);
      const spikeMat = new THREE.LineBasicMaterial({ color: getMarkerColor(signal), transparent: true, opacity: 0.6 });
      const spike = new THREE.Line(spikeGeo, spikeMat);
      markersGroupRef.current.add(spike);
    });
  }, [signals]);

  // Initialization Effect
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    console.log(`GICC: Globe Initializing (${width}x${height})`);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.zIndex = '0';
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const loader = new THREE.TextureLoader();
    const loadTexture = (url: string, isColor: boolean = true) => {
      const tex = loader.load(url, 
        (t) => console.log(`GICC: Loaded ${url}`),
        undefined,
        (err) => console.error(`GICC: Failed to load ${url}`, err)
      );
      if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const textures = {
      day: loadTexture('/textures/earth_daymap.jpg'),
      night: loadTexture('/textures/earth_nightmap.jpg'),
      normal: loadTexture('/textures/earth_normalmap.jpg', false),
      specular: loadTexture('/textures/earth_specularmap.jpg', false),
      clouds: loadTexture('/textures/earth_clouds.jpg'),
    };

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: textures.day,
      emissiveMap: textures.night,
      emissive: new THREE.Color(0xffffcc),
      emissiveIntensity: 0.8,
      normalMap: textures.normal,
      normalScale: new THREE.Vector2(0.05, 0.05),
      specularMap: textures.specular,
      specular: new THREE.Color(0x333333),
      shininess: 15,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthRef.current = earth;
    scene.add(earth);

    const cloudGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: textures.clouds,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    cloudsRef.current = clouds;
    scene.add(clouds);

    const atmoGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 15000; i++) {
      const r = 50;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      starPos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.07, color: 0xffffff, transparent: true, opacity: 0.8 })));

    scene.add(markersGroupRef.current);

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const m = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(m, camera);
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children);
      if (intersects.length > 0) {
        setSelectedSignal(intersects[0].object.userData.signal);
        controls.autoRotate = false;
      }
    };
    renderer.domElement.addEventListener('click', onClick);

    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate);
      controls.update();
      if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0001;
      if (earthRef.current) earthRef.current.rotation.y += 0.00007;
      markersGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.uTime.value = time * 0.001;
        }
        if (child.userData.isRing) {
          const s = 1.0 + (Math.sin(time * 0.004) * 0.5 + 0.5) * 1.5;
          child.scale.set(s, s, s);
          child.lookAt(camera.position);
        }
      });
      renderer.render(scene, camera);
    };
    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
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
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      // Detailed disposal would go here
    };
  }, [containerRef, setSelectedSignal]);

  return { sceneRef, cameraRef, rendererRef };
};
