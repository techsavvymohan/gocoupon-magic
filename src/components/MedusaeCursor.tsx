import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type MedusaeConfig = {
  cursor?: {
    radius?: number;
    strength?: number;
    dragFactor?: number;
  };
  halo?: {
    outerOscFrequency?: number;
    outerOscAmplitude?: number;
    radiusBase?: number;
    radiusAmplitude?: number;
    shapeAmplitude?: number;
    rimWidth?: number;
    outerStartOffset?: number;
    outerEndOffset?: number;
    scaleX?: number;
    scaleY?: number;
  };
  particles?: {
    baseSize?: number;
    activeSize?: number;
    blobScaleX?: number;
    blobScaleY?: number;
    rotationSpeed?: number;
    rotationJitter?: number;
    cursorFollowStrength?: number;
    oscillationFactor?: number;
    colorBase?: string;
    colorOne?: string;
    colorTwo?: string;
    colorThree?: string;
  };
};

const DEFAULT_CONFIG: Required<MedusaeConfig> = {
  cursor: {
    radius: 0.065,
    strength: 3,
    dragFactor: 0.03,
  },
  halo: {
    outerOscFrequency: 2.6,
    outerOscAmplitude: 0.76,
    radiusBase: 2.4,
    radiusAmplitude: 0.5,
    shapeAmplitude: 0.75,
    rimWidth: 1.8,
    outerStartOffset: 0.4,
    outerEndOffset: 2.2,
    scaleX: 1.3,
    scaleY: 1,
  },
  particles: {
    baseSize: 0.016,
    activeSize: 0.044,
    blobScaleX: 1,
    blobScaleY: 0.6,
    rotationSpeed: 0.1,
    rotationJitter: 0.2,
    cursorFollowStrength: 1,
    oscillationFactor: 1,
    colorBase: "#4F46E5",
    colorOne: "#38BDF8",
    colorTwo: "#10B981",
    colorThree: "#FACC15",
  },
};

const ParticlesMesh = ({ config }: { config?: MedusaeConfig }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { viewport } = useThree();

  const merged = useMemo(() => {
    return {
      cursor: { ...DEFAULT_CONFIG.cursor, ...(config?.cursor ?? {}) },
      halo: { ...DEFAULT_CONFIG.halo, ...(config?.halo ?? {}) },
      particles: { ...DEFAULT_CONFIG.particles, ...(config?.particles ?? {}) },
    };
  }, [config]);

  const countX = 90;
  const countY = 50;
  const count = countX * countY;

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uOuterOscFrequency: { value: merged.halo.outerOscFrequency },
      uOuterOscAmplitude: { value: merged.halo.outerOscAmplitude },
      uHaloRadiusBase: { value: merged.halo.radiusBase },
      uHaloRadiusAmplitude: { value: merged.halo.radiusAmplitude },
      uHaloShapeAmplitude: { value: merged.halo.shapeAmplitude },
      uHaloRimWidth: { value: merged.halo.rimWidth },
      uHaloOuterStartOffset: { value: merged.halo.outerStartOffset },
      uHaloOuterEndOffset: { value: merged.halo.outerEndOffset },
      uHaloScaleX: { value: merged.halo.scaleX },
      uHaloScaleY: { value: merged.halo.scaleY },
      uParticleBaseSize: { value: merged.particles.baseSize },
      uParticleActiveSize: { value: merged.particles.activeSize },
      uBlobScaleX: { value: merged.particles.blobScaleX },
      uBlobScaleY: { value: merged.particles.blobScaleY },
      uParticleRotationSpeed: { value: merged.particles.rotationSpeed },
      uParticleRotationJitter: { value: merged.particles.rotationJitter },
      uParticleOscillationFactor: { value: merged.particles.oscillationFactor },
      uParticleColorBase: { value: new THREE.Color(merged.particles.colorBase) },
      uParticleColorOne: { value: new THREE.Color(merged.particles.colorOne) },
      uParticleColorTwo: { value: new THREE.Color(merged.particles.colorTwo) },
      uParticleColorThree: { value: new THREE.Color(merged.particles.colorThree) },
    }),
    []
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uOuterOscFrequency;
            uniform float uOuterOscAmplitude;
            uniform float uHaloRadiusBase;
            uniform float uHaloRadiusAmplitude;
            uniform float uHaloShapeAmplitude;
            uniform float uHaloRimWidth;
            uniform float uHaloOuterStartOffset;
            uniform float uHaloOuterEndOffset;
            uniform float uHaloScaleX;
            uniform float uHaloScaleY;
            uniform float uParticleBaseSize;
            uniform float uParticleActiveSize;
            uniform float uBlobScaleX;
            uniform float uBlobScaleY;
            uniform float uParticleRotationSpeed;
            uniform float uParticleRotationJitter;
            uniform float uParticleOscillationFactor;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;
            
            attribute vec3 aOffset; 
            attribute float aRandom;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix( mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
                vUv = uv;
                vec3 pos = aOffset;
                float driftSpeed = uTime * 0.15;
                
                float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
                float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);
                pos.x += dx * 0.25; 
                pos.y += dy * 0.25;

                vec2 relToMouse = pos.xy - uMouse;
                vec2 haloScale = max(vec2(uHaloScaleX, uHaloScaleY), vec2(0.0001));
                float distFromMouse = length(relToMouse / haloScale);
                vec2 dirToMouse = normalize(relToMouse + vec2(0.0001, 0.0));
                
                float shapeFactor = noise(dirToMouse * 2.0 + vec2(0.0, uTime * 0.1));
                float breathCycle = sin(uTime * 0.8);
                
                float baseRadius = uHaloRadiusBase + breathCycle * uHaloRadiusAmplitude;
                float currentRadius = baseRadius + (shapeFactor * uHaloShapeAmplitude);
                
                float rimInfluence = smoothstep(uHaloRimWidth, 0.0, abs(distFromMouse - currentRadius));
                vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
                float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;
                
                pos.xy += pushDir * pushAmt * rimInfluence;
                pos.z += rimInfluence * 0.3 * sin(uTime);

                float outerInfluence = smoothstep(baseRadius + uHaloOuterStartOffset, baseRadius + uHaloOuterEndOffset, distFromMouse);
                float outerOsc = sin(uTime * uOuterOscFrequency + pos.x * 0.6 + pos.y * 0.6);
                pos.xy += normalize(relToMouse + vec2(0.0001, 0.0)) * outerOsc * uOuterOscAmplitude * outerInfluence;

                float baseSize = uParticleBaseSize + (sin(uTime + pos.x) * 0.003);
                float currentScale = baseSize + (rimInfluence * uParticleActiveSize);
                float stretch = rimInfluence * 0.02;
                
                vec3 transformed = position;
                transformed.x *= (currentScale + stretch) * uBlobScaleX;
                transformed.y *= currentScale * uBlobScaleY; 
                
                vSize = rimInfluence;
                vPos = pos.xy;
                
                float dirLen = max(length(relToMouse), 0.0001);
                vec2 dir = relToMouse / dirLen;
                float oscPhase = aRandom * 6.28318530718;
                float osc = 0.5 + 0.5 * sin(uTime * (0.25 + uParticleOscillationFactor * 0.35) + oscPhase);
                float speedScale = mix(0.55, 1.35, osc) * (0.8 + uParticleOscillationFactor * 0.2);
                float jitterScale = mix(0.7, 1.45, osc) * (0.85 + uParticleOscillationFactor * 0.15);
                float jitter = sin(uTime * uParticleRotationSpeed * speedScale + pos.x * 0.35 + pos.y * 0.35) * (uParticleRotationJitter * jitterScale);
                vec2 perp = vec2(-dir.y, dir.x);
                vec2 jitteredDir = normalize(dir + perp * jitter);
                mat2 rot = mat2(jitteredDir.x, jitteredDir.y, -jitteredDir.y, jitteredDir.x);
                transformed.xy = rot * transformed.xy;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uParticleColorBase;
            uniform vec3 uParticleColorOne;
            uniform vec3 uParticleColorTwo;
            uniform vec3 uParticleColorThree;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;

            void main() {
                vec2 center = vec2(0.5);
                vec2 pos = abs(vUv - center) * 2.0; 
                float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0/2.6);
                float alpha = 1.0 - smoothstep(0.8, 1.0, d);
                if (alpha < 0.01) discard;

                vec3 black = uParticleColorBase;
                vec3 cBlue = uParticleColorOne;
                vec3 cRed = uParticleColorTwo;
                vec3 cYellow = uParticleColorThree;
                
                float t = uTime * 1.2;
                float p1 = sin(vPos.x * 0.8 + t);
                float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);
                
                vec3 activeColor = mix(cBlue, cRed, p1 * 0.5 + 0.5);
                activeColor = mix(activeColor, cYellow, p2 * 0.5 + 0.5);
                
                vec3 finalColor = mix(black, activeColor, smoothstep(0.1, 0.8, vSize));
                float finalAlpha = alpha * mix(0.2, 0.85, vSize);

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms]
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const offsets = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const gridWidth = 38;
    const gridHeight = 20;
    const jitter = 0.25;

    let i = 0;
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        let px = (u - 0.5) * gridWidth + (Math.random() - 0.5) * jitter;
        let py = (v - 0.5) * gridHeight + (Math.random() - 0.5) * jitter;
        offsets[i * 3] = px;
        offsets[i * 3 + 1] = py;
        offsets[i * 3 + 2] = 0;
        randoms[i] = Math.random();
        i++;
      }
    }
    meshRef.current.geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    meshRef.current.geometry.setAttribute("aRandom", new THREE.InstancedBufferAttribute(randoms, 1));
  }, [count, countX, countY]);

  const globalPointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      globalPointer.current = { x, y };
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state) => {
    const { clock, pointer } = state;
    material.uniforms.uTime.value = clock.getElapsedTime();

    const pointerSource = globalPointer.current ?? pointer;
    const baseX = (pointerSource.x * viewport.width) / 2;
    const baseY = (pointerSource.y * viewport.height) / 2;
    const t = clock.getElapsedTime();
    const cursorRadius = (merged.cursor?.radius ?? DEFAULT_CONFIG.cursor.radius) as number;
    const cursorStrength = (merged.cursor?.strength ?? DEFAULT_CONFIG.cursor.strength) as number;
    const dragFactor = (merged.cursor?.dragFactor ?? DEFAULT_CONFIG.cursor.dragFactor) as number;
    const followStrength = (merged.particles?.cursorFollowStrength ?? DEFAULT_CONFIG.particles.cursorFollowStrength) as number;

    const jitterRadius = Math.min(viewport.width, viewport.height) * cursorRadius;
    const jitterX = (Math.sin(t * 0.35) + Math.sin(t * 0.77 + 1.2)) * 0.5;
    const jitterY = (Math.cos(t * 0.31) + Math.sin(t * 0.63 + 2.4)) * 0.5;
    const targetX = (baseX + jitterX * jitterRadius * cursorStrength) * followStrength;
    const targetY = (baseY + jitterY * jitterRadius * cursorStrength) * followStrength;

    const current = material.uniforms.uMouse.value;
    current.x += (targetX - current.x) * dragFactor;
    current.y += (targetY - current.y) * dragFactor;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
};

export function MedusaeCursor({ config }: { config?: MedusaeConfig }) {
  useEffect(() => {
    // Touch device bypass
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <Canvas
        className="h-full w-full pointer-events-none"
        camera={{ position: [0, 0, 5] }}
        gl={{ alpha: true, antialias: true }}
      >
        <ParticlesMesh config={config} />
      </Canvas>
    </div>
  );
}
