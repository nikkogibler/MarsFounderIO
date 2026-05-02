import * as THREE from "three";

export type MarsParcelStatus =
  | "UNSURVEYED"
  | "SURVEYING"
  | "READY"
  | "UNDER_CONSTRUCTION"
  | "ACTIVE";

export type MarsTerrainClass =
  | "BASIN"
  | "CRATER"
  | "CANYON"
  | "PLAIN"
  | "ICE_FIELD"
  | "VOLCANIC";

export type MarsParcel = {
  id: string;
  parcelName: string;
  sectorId: string;
  sectorLabel: string;
  sectorName: string;
  centerLat: number;
  centerLng: number;
  regionName: string;
  status: MarsParcelStatus;
  terrainClass: MarsTerrainClass;
  resourceSignals: {
    ice: number;
    regolith: number;
    metals: number;
    solar: number;
  };
};

export type RegistrySectorOverride = {
  sectorId: string;
  displayName: string;
  notes?: string | null;
};

export type RegistryParcelOverride = {
  parcelId: string;
  displayName: string;
  notes?: string | null;
};

export type MarsRegistryOverrides = {
  sectors?: RegistrySectorOverride[];
  parcels?: RegistryParcelOverride[];
};

export type MarsSector = {
  id: string;
  label: string;
  name: string;
  systemName: string;
  notes?: string | null;
  parcelCount: number;
  parcelIds: string[];
  centerLat: number;
  centerLng: number;
};

const TERRAIN_BY_BAND: MarsTerrainClass[] = [
  "ICE_FIELD",
  "PLAIN",
  "CRATER",
  "CANYON",
  "BASIN",
  "VOLCANIC",
  "PLAIN",
  "ICE_FIELD",
];

const BAND_NAMES = [
  "Australe Crown",
  "Cimmeria Reach",
  "Sirenum Expanse",
  "Aonia Verge",
  "Elysium Verge",
  "Arcadia Reach",
  "Utopia Rise",
  "Borealis Crown",
];

const QUADRANT_NAMES = ["Far West", "West", "East", "Far East"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pseudoNoise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function getQuadrantIndex(longitude: number) {
  const shiftedLongitude = longitude + 180;
  return Math.min(3, Math.max(0, Math.floor(shiftedLongitude / 90)));
}

export function generateMarsParcels(): MarsParcel[] {
  const bands = [-70, -50, -30, -10, 10, 30, 50, 70];

  return bands.flatMap((lat, bandIndex) => {
    const count = Math.max(8, Math.round(24 * Math.cos(THREE.MathUtils.degToRad(lat))));
    const step = 360 / count;
    const offset = bandIndex % 2 === 0 ? 0 : step / 2;
    const parcelsPerQuadrant = [0, 0, 0, 0];
    const bandName = BAND_NAMES[bandIndex] ?? `Band ${bandIndex + 1}`;

    return Array.from({ length: count }, (_, cellIndex) => {
      const lng = -180 + offset + cellIndex * step;
      const seed = (bandIndex + 1) * 100 + cellIndex + 1;
      const quadrantIndex = getQuadrantIndex(lng);
      const sectorId = `MARS-SEC-${String(bandIndex + 1).padStart(2, "0")}-${quadrantIndex + 1}`;
      const sectorLabel = `${String.fromCharCode(65 + bandIndex)}-Q${quadrantIndex + 1}`;
      const sectorName = `${bandName} ${QUADRANT_NAMES[quadrantIndex]}`;
      const parcelNumber = ++parcelsPerQuadrant[quadrantIndex];
      const parcelName = `Plot ${sectorLabel}-${String(parcelNumber).padStart(2, "0")}`;
      const terrainClass = TERRAIN_BY_BAND[bandIndex] ?? "PLAIN";
      const polarBoost = Math.abs(lat) > 55 ? 35 : 0;
      const volcanicBoost = terrainClass === "VOLCANIC" ? 26 : 0;
      const status: MarsParcelStatus =
        seed % 19 === 0
          ? "ACTIVE"
          : seed % 13 === 0
            ? "UNDER_CONSTRUCTION"
            : seed % 7 === 0
              ? "SURVEYING"
              : seed % 5 === 0
                ? "READY"
                : "UNSURVEYED";

      return {
        id: `MARS-${String(bandIndex + 1).padStart(2, "0")}-${String(cellIndex + 1).padStart(3, "0")}`,
        parcelName,
        sectorId,
        sectorLabel,
        sectorName,
        centerLat: lat,
        centerLng: Number(lng.toFixed(2)),
        regionName: `${sectorName} / ${parcelName}`,
        status,
        terrainClass,
        resourceSignals: {
          ice: clamp(Math.round(20 + polarBoost + pseudoNoise(seed) * 45), 0, 100),
          regolith: clamp(Math.round(45 + pseudoNoise(seed + 4) * 45), 0, 100),
          metals: clamp(Math.round(15 + volcanicBoost + pseudoNoise(seed + 8) * 55), 0, 100),
          solar: clamp(Math.round(80 - Math.abs(lat) * 0.65 + pseudoNoise(seed + 12) * 14), 0, 100),
        },
      };
    });
  });
}

export function applyRegistryOverrides(
  parcels: MarsParcel[],
  overrides?: MarsRegistryOverrides,
): MarsParcel[] {
  if (!overrides?.sectors?.length && !overrides?.parcels?.length) {
    return parcels;
  }

  const sectorOverrides = new Map(
    (overrides.sectors ?? []).map((override) => [override.sectorId, override]),
  );
  const parcelOverrides = new Map(
    (overrides.parcels ?? []).map((override) => [override.parcelId, override]),
  );

  return parcels.map((parcel) => {
    const sectorName = sectorOverrides.get(parcel.sectorId)?.displayName ?? parcel.sectorName;
    const parcelName = parcelOverrides.get(parcel.id)?.displayName ?? parcel.parcelName;

    return {
      ...parcel,
      sectorName,
      parcelName,
      regionName: `${sectorName} / ${parcelName}`,
    };
  });
}

export function buildMarsSectors(
  parcels: MarsParcel[],
  overrides: RegistrySectorOverride[] = [],
): MarsSector[] {
  const sectorOverrides = new Map(overrides.map((override) => [override.sectorId, override]));
  const sectorMap = new Map<string, MarsSector>();

  parcels.forEach((parcel) => {
    const existing = sectorMap.get(parcel.sectorId);
    if (existing) {
      existing.parcelCount += 1;
      existing.parcelIds.push(parcel.id);
      return;
    }

    const override = sectorOverrides.get(parcel.sectorId);
    sectorMap.set(parcel.sectorId, {
      id: parcel.sectorId,
      label: parcel.sectorLabel,
      name: override?.displayName ?? parcel.sectorName,
      systemName: parcel.sectorName,
      notes: override?.notes ?? null,
      parcelCount: 1,
      parcelIds: [parcel.id],
      centerLat: parcel.centerLat,
      centerLng: parcel.centerLng,
    });
  });

  return [...sectorMap.values()].sort((left, right) => left.id.localeCompare(right.id));
}