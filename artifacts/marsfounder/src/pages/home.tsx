import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useListBots } from "@workspace/api-client-react";
import { CanvasErrorBoundary } from "@/components/canvas-error-boundary";

gsap.registerPlugin(ScrollTrigger);

function Mars() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x = 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -2, -5]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial 
        color="#cc4422" 
        roughness={0.9} 
        metalness={0.1}
        wireframe={true}
        wireframeLinewidth={1}
      />
    </mesh>
  );
}

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: bots, isLoading: loadingBots } = useListBots();
  const [webglOk, setWebglOk] = useState(false);
  useEffect(() => {
    setWebglOk(detectWebGL());
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero sequence
      gsap.from(".hero-text > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2
      });

      // Scroll sections
      gsap.utils.toArray(".reveal-section").forEach((section: any) => {
        gsap.from(section.querySelectorAll(".reveal-item"), {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out"
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          {webglOk ? (
            <CanvasErrorBoundary
              fallback={
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(204,68,34,0.35),_transparent_60%)]" />
              }
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffa07a" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Mars />
              </Canvas>
            </CanvasErrorBoundary>
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(204,68,34,0.35),_transparent_60%)]" />
          )}
        </div>
        
        <div className="absolute inset-0 z-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-30" />
        
        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center hero-text">
          <div className="inline-block border border-primary text-primary px-3 py-1 text-xs font-mono mb-8 tracking-widest bg-primary/10">
            SYSTEM INITIALIZED • CONNECTION ESTABLISHED
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6 text-foreground drop-shadow-[0_0_15px_rgba(204,68,34,0.5)]">
            Earth Labor<br/>Is Obsolete
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-mono max-w-3xl mb-12">
            The AWS of Mars labor. Rent industrial bots already deployed on the surface. Execute missions. Pay in credits. No launch required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/bots" className="bg-primary hover:bg-accent hover:text-primary-foreground text-primary-foreground px-8 py-4 font-bold font-mono uppercase tracking-widest transition-all duration-300 border border-primary hover:border-accent shadow-[0_0_20px_rgba(204,68,34,0.3)]">
              View Fleet
            </Link>
            <Link href="/waitlist" className="bg-transparent hover:bg-primary/10 text-foreground px-8 py-4 font-bold font-mono uppercase tracking-widest transition-all duration-300 border border-border hover:border-primary">
              Join Waitlist
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute bottom-8 left-8 font-mono text-xs text-muted-foreground/50 tracking-widest hidden md:block">
          LAT 4.5895° N<br/>LON 137.4417° E
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-32 border-b border-border bg-card/30 reveal-section relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="reveal-item flex flex-col gap-4 border-l border-primary/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Zero Launch Wait</h3>
              <p className="font-mono text-sm text-muted-foreground">Our hardware is already on the dirt. Skip the 9-month transit. Start operations in 9 minutes.</p>
            </div>
            <div className="reveal-item flex flex-col gap-4 border-l border-primary/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Usage Based</h3>
              <p className="font-mono text-sm text-muted-foreground">You don't own the bot. You own the results. Pay hourly in MarsFounder credits. We handle maintenance.</p>
            </div>
            <div className="reveal-item flex flex-col gap-4 border-l border-primary/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Modular Loadouts</h3>
              <p className="font-mono text-sm text-muted-foreground">Configure chassis with specialized tools and addons. Swap drills for welders based on mission parameters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-32 border-b border-border relative reveal-section bg-[url('/bot-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="absolute inset-0 bg-background/90 mix-blend-multiply" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal-item">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Available Chassis</h2>
              <p className="font-mono text-muted-foreground">5 CLASSES. ENDLESS CONFIGURATIONS.</p>
            </div>
            <Link href="/configure" className="text-primary font-mono text-sm hover:text-accent tracking-widest mt-4 md:mt-0 flex items-center gap-2">
              OPEN CONFIGURATOR <span className="text-xl">→</span>
            </Link>
          </div>

          {loadingBots ? (
            <div className="h-64 border border-border flex items-center justify-center font-mono text-muted-foreground animate-pulse">
              INITIALIZING FLEET TELEMETRY...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots?.slice(0, 3).map((bot, i) => (
                <Link key={bot.id} href={`/bots/${bot.id}`} className="reveal-item group block bg-card border border-border hover:border-primary transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1">{bot.role}</span>
                      <span className="font-mono text-sm text-muted-foreground">{bot.hourlyCredits} CR/HR</span>
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-3xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{bot.codename}</h3>
                      <p className="font-mono text-sm text-muted-foreground mt-2">{bot.tagline}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 reveal-section bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 reveal-item">Ready to break dirt?</h2>
          <p className="font-mono text-xl max-w-2xl mx-auto mb-12 opacity-80 reveal-item">
            Launch windows don't apply when the hardware is already there. Secure your credits and deploy today.
          </p>
          <div className="reveal-item">
            <Link href="/waitlist" className="inline-block bg-background hover:bg-foreground text-foreground hover:text-background px-12 py-5 font-bold font-mono uppercase tracking-widest transition-colors duration-300 border border-transparent shadow-2xl">
              REQUEST ACCESS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}