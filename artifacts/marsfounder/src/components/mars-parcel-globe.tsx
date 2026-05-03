import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { Maximize2 } from "lucide-react";
import * as THREE from "three";
import { CanvasErrorBoundary } from "@/components/canvas-error-boundary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateMarsParcels, type MarsParcel, type MarsParcelStatus } from "@/lib/mars-registry";

type MarsParcelGlobeProps = {
  parcels?: MarsParcel[];
  latitude: number;
  longitude: number;
  selectedParcelId?: string;
  onSelectParcel?: (parcel: MarsParcel) => void;
  interactive?: boolean;
  className?: string;
};

const GLOBE_RADIUS = 1;
const MARS_MODEL_SCALE = GLOBE_RADIUS / 500;
const STATUS_COLORS: Record<MarsParcelStatus, string> = {
  UNSURVEYED: "#5d5149",
  SURVEYING: "#ff9f1c",
  READY: "#cc4422",
  UNDER_CONSTRUCTION: "#f6c85f",
  ACTIVE: "#65f0a3",
};

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

function latLngToVector(lat: number, lng: number, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function tangentQuaternion(position: THREE.Vector3) {
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    position.clone().normalize(),
  );
}

function MarsModel() {
  const gltf = useGLTF("/3d/mars.glb");
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.receiveShadow = false;
        object.castShadow = false;
        const material = object.material;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.roughness = 0.95;
          material.metalness = 0;
        }
      }
    });
    return cloned;
  }, [gltf.scene]);

  return <primitive object={scene} scale={MARS_MODEL_SCALE} />;
}

function ParcelCell({
  parcel,
  selected,
  hovered,
  interactive,
  onSelect,
  onHover,
}: {
  parcel: MarsParcel;
  selected: boolean;
  hovered: boolean;
  interactive: boolean;
  onSelect?: (parcel: MarsParcel) => void;
  onHover: (parcel?: MarsParcel) => void;
}) {
  const position = useMemo(
    () => latLngToVector(parcel.centerLat, parcel.centerLng, GLOBE_RADIUS + 0.012),
    [parcel.centerLat, parcel.centerLng],
  );
  const quaternion = useMemo(() => tangentQuaternion(position), [position]);
  const color = STATUS_COLORS[parcel.status];
  const scale = selected ? 1.3 : hovered ? 1.16 : 1;
  const opacity = selected ? 0.42 : hovered ? 0.32 : 0.12;

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (interactive) onHover(parcel);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (interactive) onHover(undefined);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactive) onSelect?.(parcel);
  };

  return (
    <mesh
      position={position}
      quaternion={quaternion}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <circleGeometry args={[0.065, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function CoordinateMarker({ latitude, longitude }: { latitude: number; longitude: number }) {
  const position = useMemo(
    () => latLngToVector(latitude, longitude, GLOBE_RADIUS + 0.06),
    [latitude, longitude],
  );

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh scale={1.7}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ff9f1c" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GlobeScene({
  parcels,
  latitude,
  longitude,
  selectedParcelId,
  interactive,
  onSelectParcel,
  onHoverParcel,
}: {
  parcels: MarsParcel[];
  latitude: number;
  longitude: number;
  selectedParcelId?: string;
  interactive: boolean;
  onSelectParcel?: (parcel: MarsParcel) => void;
  onHoverParcel: (parcel?: MarsParcel) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string>();

  useFrame((_, delta) => {
    if (!interactive && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.035;
    }
  });

  const handleHover = (parcel?: MarsParcel) => {
    setHoveredId(parcel?.id);
    onHoverParcel(parcel);
  };

  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[3, 3, 4]} intensity={2.4} color="#ffd2a0" />
      <pointLight position={[-4, -2, 2]} intensity={0.45} color="#cc4422" />
      <Stars radius={70} depth={30} count={1000} factor={3} saturation={0} fade speed={0.4} />
      <group ref={groupRef} rotation={[0.18, -0.45, 0]}>
        <MarsModel />
        {parcels.map((parcel) => (
          <ParcelCell
            key={parcel.id}
            parcel={parcel}
            selected={parcel.id === selectedParcelId}
            hovered={parcel.id === hoveredId}
            interactive={interactive}
            onSelect={onSelectParcel}
            onHover={handleHover}
          />
        ))}
        <CoordinateMarker latitude={latitude} longitude={longitude} />
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={interactive}
        enableRotate={interactive}
        minDistance={2.35}
        maxDistance={4.2}
        rotateSpeed={0.55}
        zoomSpeed={0.55}
      />
    </>
  );
}

    function GlobeViewport({
      webglOk,
      parcels,
      latitude,
      longitude,
      selectedParcelId,
      interactive,
      onSelectParcel,
      onHoverParcel,
      heightClass,
    }: {
      webglOk: boolean;
      parcels: MarsParcel[];
      latitude: number;
      longitude: number;
      selectedParcelId?: string;
      interactive: boolean;
      onSelectParcel?: (parcel: MarsParcel) => void;
      onHoverParcel: (parcel?: MarsParcel) => void;
      heightClass: string;
    }) {
      return (
        <div className={`relative overflow-hidden bg-background ${heightClass}`}>
          {webglOk ? (
            <CanvasErrorBoundary fallback={<GlobeFallback />}>
              <Suspense fallback={<GlobeFallback />}>
                <Canvas
                  camera={{ position: [0, 0, 3.15], fov: 42 }}
                  dpr={[1, 1.5]}
                  gl={{ antialias: true, powerPreference: "high-performance" }}
                >
                  <GlobeScene
                    parcels={parcels}
                    latitude={latitude}
                    longitude={longitude}
                    selectedParcelId={selectedParcelId}
                    interactive={interactive}
                    onSelectParcel={onSelectParcel}
                    onHoverParcel={onHoverParcel}
                  />
                </Canvas>
              </Suspense>
            </CanvasErrorBoundary>
          ) : (
            <GlobeFallback />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background to-transparent" />
          <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-widest text-muted-foreground">
            LAT {latitude.toFixed(2)} / LON {longitude.toFixed(2)}
          </div>
        </div>
      );
    }

function GlobeFallback() {
  return (
    <div className="h-full min-h-96 w-full bg-[radial-gradient(circle_at_50%_45%,rgba(204,68,34,0.3),rgba(0,0,0,0)_55%)] flex items-center justify-center border border-border">
      <div className="font-mono text-[10px] tracking-widest text-muted-foreground">
        SURFACE GRID OFFLINE
      </div>
    </div>
  );
}

function ParcelReadout({ parcel }: { parcel?: MarsParcel }) {
  if (!parcel) {
    return (
      <div className="grid grid-cols-2 gap-px bg-border/60 border border-border font-mono text-[10px]">
        <div className="bg-background/80 p-3 text-muted-foreground">SECTOR</div>
        <div className="bg-background/80 p-3 text-right text-muted-foreground">32 REGISTERED</div>
        <div className="bg-background/80 p-3 text-muted-foreground">PARCEL</div>
        <div className="bg-background/80 p-3 text-right text-muted-foreground">UNLOCKED</div>
        <div className="bg-background/80 p-3 text-muted-foreground">STATUS</div>
        <div className="bg-background/80 p-3 text-right text-muted-foreground">AWAITING VECTOR</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px bg-border/60 border border-border font-mono text-[10px]">
      <div className="bg-background/80 p-3 text-muted-foreground">SECTOR</div>
      <div className="bg-background/80 p-3 text-right text-primary">{parcel.sectorName}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">SECTOR LABEL</div>
      <div className="bg-background/80 p-3 text-right text-muted-foreground">{parcel.sectorLabel}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">PARCEL</div>
      <div className="bg-background/80 p-3 text-right text-foreground">{parcel.parcelName}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">PARCEL ID</div>
      <div className="bg-background/80 p-3 text-right text-primary">{parcel.id}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">STATUS</div>
      <div className="bg-background/80 p-3 text-right text-foreground">{parcel.status}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">TERRAIN</div>
      <div className="bg-background/80 p-3 text-right text-foreground">{parcel.terrainClass}</div>
      <div className="bg-background/80 p-3 text-muted-foreground">ICE / METALS</div>
      <div className="bg-background/80 p-3 text-right text-accent">
        {parcel.resourceSignals.ice}% / {parcel.resourceSignals.metals}%
      </div>
    </div>
  );
}

export function MarsParcelGlobe({
  parcels: parcelsProp,
  latitude,
  longitude,
  selectedParcelId,
  onSelectParcel,
  interactive = true,
  className = "",
}: MarsParcelGlobeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [webglOk, setWebglOk] = useState(false);
  const [hoveredParcel, setHoveredParcel] = useState<MarsParcel>();
  const parcels = useMemo(() => parcelsProp ?? generateMarsParcels(), [parcelsProp]);
  const sectorCount = useMemo(
    () => new Set(parcels.map((parcel) => parcel.sectorId)).size,
    [parcels],
  );
  const selectedParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedParcelId),
    [parcels, selectedParcelId],
  );
  const readoutParcel = hoveredParcel ?? selectedParcel;
  const parcelSummary = `${sectorCount} SECTORS / ${parcels.length} PARCELS`;

  useEffect(() => {
    setWebglOk(detectWebGL());
  }, []);

  const handleExpandedChange = (open: boolean) => {
    setIsExpanded(open);
    if (!open) setHoveredParcel(undefined);
  };

  return (
    <>
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className="border border-border bg-card/30">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-secondary p-4 text-secondary-foreground">
            <h3 className="font-sans font-black uppercase tracking-tight">Surface Parcels</h3>
            <div className="ml-auto flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {parcelSummary}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="rounded-none border-border bg-background/70 text-foreground hover:border-primary/50 hover:text-primary"
                aria-label="Open enlarged parcel globe"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <GlobeViewport
            webglOk={webglOk}
            parcels={parcels}
            latitude={latitude}
            longitude={longitude}
            selectedParcelId={selectedParcelId}
            interactive={interactive}
            onSelectParcel={onSelectParcel}
            onHoverParcel={setHoveredParcel}
            heightClass="h-105"
          />
          <div className="p-4">
            <ParcelReadout parcel={readoutParcel} />
          </div>
        </div>
      </div>

      <Dialog open={isExpanded} onOpenChange={handleExpandedChange}>
        <DialogContent className="w-[min(96vw,1200px)] max-w-6xl gap-0 border border-border bg-card p-0 sm:rounded-none">
          <DialogHeader className="gap-2 border-b border-border bg-secondary px-4 py-4 pr-14 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DialogTitle className="font-sans font-black uppercase tracking-tight text-secondary-foreground">
                Expanded Surface Parcels
              </DialogTitle>
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {parcelSummary}
              </span>
            </div>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Drag to rotate, scroll to zoom, and select parcels without leaving the current workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="border-b border-border lg:border-b-0 lg:border-r">
              <GlobeViewport
                webglOk={webglOk}
                parcels={parcels}
                latitude={latitude}
                longitude={longitude}
                selectedParcelId={selectedParcelId}
                interactive={interactive}
                onSelectParcel={onSelectParcel}
                onHoverParcel={setHoveredParcel}
                heightClass="h-[60vh] min-h-[420px] max-h-[760px]"
              />
            </div>

            <div className="flex flex-col gap-4 bg-card/50 p-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Active Readout
                </div>
                <p className="mt-2 font-mono text-xs leading-6 text-muted-foreground">
                  The enlarged view stays connected to the same parcel selection and coordinate focus as the inline panel.
                </p>
              </div>
              <ParcelReadout parcel={readoutParcel} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
