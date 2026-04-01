'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function CursorDot() {
  const containerRef = useRef(null)
  const dotsRef = useRef([])
  
  // Configuration: How many dots and how fast they follow
  const DOT_COUNT = 12
  const LAG_FACTOR = 0.2 // Lower = slower/floatier, Higher = tighter
  
  useGSAP(() => {
    // 1. Initial Setup: Hide all dots initially and set transform origin
    gsap.set(dotsRef.current, { 
      xPercent: -50, 
      yPercent: -50,
      opacity: 0,
      scale: 0,
      x: -1000, // Start off-screen
      y: -1000
    })

    // 2. State to track mouse and dot positions
    const mouse = { x: 0, y: 0 }
    // Initialize dots at a far position so they're not visible initially
    const dots = dotsRef.current.map(() => ({ x: -1000, y: -1000 }))
    let isMoving = false
    let timeoutId = null
    let rafId = null

    // 3. The Animation Loop (Using requestAnimationFrame for better sync with browser)
    const render = () => {
      // Calculate position for the first dot (Leader)
      // Increased lerp speed (0.8 → 0.95) for much tighter sync with mouse
      dots[0].x += (mouse.x - dots[0].x) * 0.95
      dots[0].y += (mouse.y - dots[0].y) * 0.95

      // Move the Leader Dot immediately
      if (dotsRef.current[0]) {
        gsap.set(dotsRef.current[0], { 
          x: dots[0].x, 
          y: dots[0].y,
          xPercent: -50,
          yPercent: -50
        })
      }

      // Calculate positions for the followers (The Tail)
      for (let i = 1; i < DOT_COUNT; i++) {
        const prev = dots[i - 1]
        const curr = dots[i]
        
        // Follow the previous dot with lag
        curr.x += (prev.x - curr.x) * LAG_FACTOR
        curr.y += (prev.y - curr.y) * LAG_FACTOR

        // Apply movement immediately
        if (dotsRef.current[i]) {
          gsap.set(dotsRef.current[i], { 
            x: curr.x, 
            y: curr.y,
            xPercent: -50,
            yPercent: -50
          })
        }
      }
      
      // Continue animation loop
      if (isMoving) {
        rafId = requestAnimationFrame(render)
      }
    }

    // 4. Mouse Event Listeners
    const onMouseMove = (e) => {
      // Update mouse position immediately
      mouse.x = e.clientX
      mouse.y = e.clientY
      
      // If this is the first movement, initialize leader dot at mouse position
      if (!isMoving) {
        dots[0].x = mouse.x
        dots[0].y = mouse.y
        // Initialize all dots at mouse position for instant appearance
        dots.forEach((dot, i) => {
          dot.x = mouse.x
          dot.y = mouse.y
        })
        isMoving = true
        rafId = requestAnimationFrame(render)
        // Fade in dots
        gsap.to(dotsRef.current, { 
          opacity: (i) => 1 - (i / DOT_COUNT), // Head is bright, tail fades
          scale: (i) => 1 - (i / DOT_COUNT) * 0.5, // Tail shrinks
          duration: 0.3 
        })
      }

      // Hide trail when mouse stops moving for a bit
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId)
        isMoving = false
        gsap.to(dotsRef.current, { opacity: 0, scale: 0, duration: 0.5 })
      }, 2000) // Keep visible for 2s after stop
    }

    window.addEventListener('mousemove', onMouseMove)
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
    }
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {[...Array(DOT_COUNT)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (dotsRef.current[i] = el)}
          className="pointer-events-none absolute w-3 h-3 bg-white rounded-full mix-blend-difference will-change-transform"
          style={{ 
            opacity: 0, // Handled by GSAP
            // Use 'mix-blend-difference' to invert colors over white backgrounds, 
            // making it visible everywhere.
          }}
        />
      ))}
    </div>
  )
}