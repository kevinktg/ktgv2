'use client'

import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { TextureLoader, ShaderMaterial, Vector2 } from 'three'
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion"

// ============================================================================
// Circular reveal + optional layer parallax (mouse only, no time, no noise)
// Parallax = different UV shift per layer from cursor — stable depth, not a "fluid wipe"
// ============================================================================

const circleRevealFragmentShader = `
  uniform sampler2D topTex;
  uniform sampler2D bottomTex;
  uniform vec2 mouse;
  uniform float aspect;
  uniform float uParallaxTop;
  uniform float uParallaxBottom;
  varying vec2 vUv;

  void main() {
    vec2 center = vUv * 2.0 - 1.0;
    center.x *= aspect;

    vec2 mousePos = mouse * 2.0 - 1.0;
    mousePos.x *= aspect;

    float dist = distance(center, mousePos);

    float radius = 0.14;
    float edgeSoftness = 0.09;
    float reveal = 1.0 - smoothstep(radius, radius + edgeSoftness, dist);

    // Cursor-relative shift (same for all pixels); layers diverge slightly = depth cue
    vec2 m = (mouse - 0.5) * 2.0;
    vec2 uvTop = clamp(vUv + m * uParallaxTop, vec2(0.0), vec2(1.0));
    vec2 uvBottom = clamp(vUv + m * uParallaxBottom, vec2(0.0), vec2(1.0));

    vec4 topColor = texture2D(topTex, uvTop);
    vec4 bottomColor = texture2D(bottomTex, uvBottom);

    vec3 finalColor = mix(topColor.rgb, bottomColor.rgb, reveal);
    float finalAlpha = mix(topColor.a, bottomColor.a, reveal);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

const simpleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

class CircleRevealMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        topTex: { value: null },
        bottomTex: { value: null },
        mouse: { value: new Vector2(0.5, 0.5) },
        aspect: { value: 1.0 },
        uParallaxTop: { value: 0 },
        uParallaxBottom: { value: 0 },
      },
      vertexShader: simpleVertexShader,
      fragmentShader: circleRevealFragmentShader,
      transparent: true
    })
  }
}

extend({ CircleRevealMaterial })

/** Subtle opposite shifts — tune down if any motion sensitivity */
const PARALLAX_TOP = 0.014
const PARALLAX_BOTTOM = -0.02

function RevealPlane({
  topImagePath,
  bottomImagePath,
  onLoaded,
  parallaxTop = 0,
  parallaxBottom = 0,
}) {
  const materialRef = useRef()
  const { viewport } = useThree()
  const [textures, setTextures] = useState({ top: null, bottom: null })

  useEffect(() => {
    const loader = new TextureLoader()
    Promise.all([
      new Promise(resolve => loader.load(topImagePath, resolve)),
      new Promise(resolve => loader.load(bottomImagePath, resolve))
    ]).then(([top, bottom]) => {
      const ani = Math.min(window.devicePixelRatio > 1 ? 4 : 8, 8);
      top.anisotropy = ani;
      bottom.anisotropy = ani;
      setTextures({ top, bottom })
      if (onLoaded) onLoaded();
    })
  }, [topImagePath, bottomImagePath, onLoaded])

  useEffect(() => {
    if (materialRef.current) {
      if (textures.top) materialRef.current.uniforms.topTex.value = textures.top
      if (textures.bottom) materialRef.current.uniforms.bottomTex.value = textures.bottom
    }
  }, [textures])

  useEffect(() => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uParallaxTop.value = parallaxTop
    materialRef.current.uniforms.uParallaxBottom.value = parallaxBottom
  }, [parallaxTop, parallaxBottom])

  useFrame((state) => {
    if (!materialRef.current) return
    const targetX = (state.pointer.x + 1) / 2
    const targetY = (state.pointer.y + 1) / 2

    materialRef.current.uniforms.mouse.value.x += (targetX - materialRef.current.uniforms.mouse.value.x) * 0.1
    materialRef.current.uniforms.mouse.value.y += (targetY - materialRef.current.uniforms.mouse.value.y) * 0.1
    materialRef.current.uniforms.aspect.value = viewport.aspect
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <circleRevealMaterial ref={materialRef} />
    </mesh>
  )
}

export function HeroImages({ topImage, bottomImage }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const parallaxTop = prefersReducedMotion ? 0 : PARALLAX_TOP
  const parallaxBottom = prefersReducedMotion ? 0 : PARALLAX_BOTTOM

  useEffect(() => {
    const hasPlayed = typeof window !== 'undefined' && sessionStorage.getItem('hero-animated') === 'true';
    if (hasPlayed) setIsReady(true);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (window.innerWidth < 768) {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkMobile);
      };
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const handleLoaded = useCallback(() => setIsReady(true), []);

  if (isMobile) {
    return (
      <div
        className={`absolute inset-0 z-10 w-full h-full bg-neutral-900 transition-opacity duration-1000 ${isReady ? 'opacity-50' : 'opacity-0'}`}
        style={{
           backgroundImage: `url(${topImage})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
        }}
      />
    );
  }

  return (
    <div className={`absolute inset-0 z-10 pointer-events-none w-full h-full bg-transparent transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <Canvas
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <RevealPlane
            topImagePath={topImage}
            bottomImagePath={bottomImage}
            onLoaded={handleLoaded}
            parallaxTop={parallaxTop}
            parallaxBottom={parallaxBottom}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
