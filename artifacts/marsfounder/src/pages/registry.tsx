import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetRegistryOverridesQueryKey,
  useGetRegistryOverrides,
  useUpsertRegistryParcel,
  useUpsertRegistrySector,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MarsParcelGlobe } from "@/components/mars-parcel-globe";
import {
  applyRegistryOverrides,
  buildMarsSectors,
  generateMarsParcels,
} from "@/lib/mars-registry";

type RegistryMode = "parcels" | "sectors";

const FOUNDER_HANDLE_STORAGE_KEY = "marsfounder.registry.founderHandle";

export default function Registry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mode, setMode] = useState<RegistryMode>("parcels");
  const [search, setSearch] = useState("");
  const [founderHandle, setFounderHandle] = useState("");
  const [selectedParcelId, setSelectedParcelId] = useState<string>();
  const [selectedSectorId, setSelectedSectorId] = useState<string>();
  const [draftName, setDraftName] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const { data: overrides, isLoading } = useGetRegistryOverrides();
  const upsertSector = useUpsertRegistrySector();
  const upsertParcel = useUpsertRegistryParcel();

  const baseParcels = useMemo(() => generateMarsParcels(), []);
  const parcels = useMemo(
    () => applyRegistryOverrides(baseParcels, overrides),
    [baseParcels, overrides],
  );
  const sectors = useMemo(
    () => buildMarsSectors(baseParcels, overrides?.sectors ?? []),
    [baseParcels, overrides?.sectors],
  );

  const filteredParcels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return parcels;
    return parcels.filter((parcel) =>
      [
        parcel.id,
        parcel.parcelName,
        parcel.sectorName,
        parcel.sectorLabel,
        parcel.regionName,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [parcels, search]);

  const filteredSectors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sectors;
    return sectors.filter((sector) =>
      [sector.id, sector.label, sector.name, sector.systemName].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [search, sectors]);

  const selectedParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedParcelId),
    [parcels, selectedParcelId],
  );
  const selectedBaseParcel = useMemo(
    () => baseParcels.find((parcel) => parcel.id === selectedParcelId),
    [baseParcels, selectedParcelId],
  );
  const selectedSector = useMemo(
    () => sectors.find((sector) => sector.id === selectedSectorId),
    [sectors, selectedSectorId],
  );

  const globeFocusParcel = useMemo(() => {
    if (mode === "parcels") return selectedParcel;
    if (!selectedSector) return undefined;
    return parcels.find((parcel) => parcel.sectorId === selectedSector.id);
  }, [mode, parcels, selectedParcel, selectedSector]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedFounderHandle = window.localStorage.getItem(FOUNDER_HANDLE_STORAGE_KEY);
    if (storedFounderHandle) {
      setFounderHandle(storedFounderHandle);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!founderHandle.trim()) return;
    window.localStorage.setItem(FOUNDER_HANDLE_STORAGE_KEY, founderHandle.trim());
  }, [founderHandle]);

  useEffect(() => {
    if (mode === "parcels" && !selectedParcelId && filteredParcels.length > 0) {
      setSelectedParcelId(filteredParcels[0].id);
    }
  }, [filteredParcels, mode, selectedParcelId]);

  useEffect(() => {
    if (mode === "sectors" && !selectedSectorId && filteredSectors.length > 0) {
      setSelectedSectorId(filteredSectors[0].id);
    }
  }, [filteredSectors, mode, selectedSectorId]);

  useEffect(() => {
    if (mode !== "parcels" || !selectedParcel) return;
    const override = overrides?.parcels?.find((item) => item.parcelId === selectedParcel.id);
    setDraftName(override?.displayName ?? selectedParcel.parcelName);
    setDraftNotes(override?.notes ?? "");
  }, [mode, overrides?.parcels, selectedParcel]);

  useEffect(() => {
    if (mode !== "sectors" || !selectedSector) return;
    const override = overrides?.sectors?.find((item) => item.sectorId === selectedSector.id);
    setDraftName(override?.displayName ?? selectedSector.name);
    setDraftNotes(override?.notes ?? "");
  }, [mode, overrides?.sectors, selectedSector]);

  const handleSave = () => {
    const trimmedName = draftName.trim();
    const trimmedFounderHandle = founderHandle.trim();
    const trimmedNotes = draftNotes.trim();

    if (!trimmedFounderHandle) {
      toast({
        title: "FOUNDER HANDLE REQUIRED",
        description: "Enter a founder handle before saving registry changes.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedName) {
      toast({
        title: "DISPLAY NAME REQUIRED",
        description: "Registry entries need a canonical display name.",
        variant: "destructive",
      });
      return;
    }

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getGetRegistryOverridesQueryKey() });
      toast({
        title: "REGISTRY UPDATED",
        description:
          mode === "sectors"
            ? "Sector naming has been saved to the registry."
            : "Parcel naming has been saved to the registry.",
      });
    };

    const onError = (error: unknown) => {
      toast({
        title: "REGISTRY SAVE FAILED",
        description:
          (error as { data?: { error?: string } })?.data?.error ||
          (error as Error)?.message ||
          "The registry change could not be saved.",
        variant: "destructive",
      });
    };

    if (mode === "sectors" && selectedSector) {
      upsertSector.mutate(
        {
          sectorId: selectedSector.id,
          data: {
            displayName: trimmedName,
            founderHandle: trimmedFounderHandle,
            notes: trimmedNotes || null,
          },
        },
        { onSuccess, onError },
      );
      return;
    }

    if (mode === "parcels" && selectedParcel) {
      upsertParcel.mutate(
        {
          parcelId: selectedParcel.id,
          data: {
            displayName: trimmedName,
            founderHandle: trimmedFounderHandle,
            notes: trimmedNotes || null,
          },
        },
        { onSuccess, onError },
      );
    }
  };

  const saving = upsertSector.isPending || upsertParcel.isPending;

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="border-b border-border pb-6 flex flex-col gap-2">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
          Land Registry
        </h1>
        <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
          Manage the canonical names for Mars sectors and parcels without changing the underlying grid.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-8 items-start">
        <div className="border border-border bg-card/30 flex flex-col sticky top-24">
          <div className="p-4 border-b border-border bg-background/50 flex flex-col gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "parcels" ? "default" : "outline"}
                onClick={() => setMode("parcels")}
                className="flex-1 rounded-none font-mono uppercase tracking-widest"
              >
                Parcels
              </Button>
              <Button
                type="button"
                variant={mode === "sectors" ? "default" : "outline"}
                onClick={() => setMode("sectors")}
                className="flex-1 rounded-none font-mono uppercase tracking-widest"
              >
                Sectors
              </Button>
            </div>

            <Input
              value={founderHandle}
              onChange={(event) => setFounderHandle(event.target.value)}
              placeholder="FOUNDER HANDLE"
              className="font-mono rounded-none border-border bg-card uppercase"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={mode === "parcels" ? "SEARCH PARCELS" : "SEARCH SECTORS"}
              className="font-mono rounded-none border-border bg-card uppercase"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map((index) => (
                    <Skeleton key={index} className="h-18 w-full rounded-none bg-border/50" />
                  ))}
                </div>
              ) : mode === "parcels" ? (
                filteredParcels.map((parcel) => (
                  <button
                    type="button"
                    key={parcel.id}
                    onClick={() => {
                      setMode("parcels");
                      setSelectedParcelId(parcel.id);
                    }}
                    className={`p-4 border-b border-border/50 text-left transition-colors ${
                      selectedParcelId === parcel.id ? "bg-primary/10" : "hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans font-black uppercase text-sm text-foreground">
                          {parcel.parcelName}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                          {parcel.sectorLabel} · {parcel.id}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {parcel.status}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                      {parcel.sectorName}
                    </div>
                  </button>
                ))
              ) : (
                filteredSectors.map((sector) => (
                  <button
                    type="button"
                    key={sector.id}
                    onClick={() => {
                      setMode("sectors");
                      setSelectedSectorId(sector.id);
                    }}
                    className={`p-4 border-b border-border/50 text-left transition-colors ${
                      selectedSectorId === sector.id ? "bg-primary/10" : "hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans font-black uppercase text-sm text-foreground">
                          {sector.name}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                          {sector.label} · {sector.id}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {sector.parcelCount} PARCELS
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
          <div className="border border-border bg-card/30 flex flex-col">
            <div className="p-4 border-b border-border bg-secondary text-secondary-foreground">
              <h3 className="font-sans font-black uppercase tracking-tight">
                {mode === "sectors" ? "Sector Inspector" : "Parcel Inspector"}
              </h3>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {mode === "sectors" && selectedSector ? (
                <>
                  <div className="grid grid-cols-2 gap-px bg-border/60 border border-border font-mono text-[10px]">
                    <div className="bg-background/80 p-3 text-muted-foreground">SYSTEM NAME</div>
                    <div className="bg-background/80 p-3 text-right text-foreground">{selectedSector.systemName}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">SECTOR ID</div>
                    <div className="bg-background/80 p-3 text-right text-primary">{selectedSector.id}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">SECTOR LABEL</div>
                    <div className="bg-background/80 p-3 text-right text-muted-foreground">{selectedSector.label}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">PARCEL COUNT</div>
                    <div className="bg-background/80 p-3 text-right text-foreground">{selectedSector.parcelCount}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      Canonical Sector Name
                    </label>
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="font-mono rounded-none border-border bg-card uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      Registry Notes
                    </label>
                    <Textarea
                      value={draftNotes}
                      onChange={(event) => setDraftNotes(event.target.value)}
                      className="font-mono rounded-none border-border bg-card min-h-40 resize-y"
                      placeholder="Add naming rationale, legal notes, or registry context."
                    />
                  </div>
                </>
              ) : mode === "parcels" && selectedParcel && selectedBaseParcel ? (
                <>
                  <div className="grid grid-cols-2 gap-px bg-border/60 border border-border font-mono text-[10px]">
                    <div className="bg-background/80 p-3 text-muted-foreground">SYSTEM NAME</div>
                    <div className="bg-background/80 p-3 text-right text-foreground">{selectedBaseParcel.parcelName}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">PARCEL ID</div>
                    <div className="bg-background/80 p-3 text-right text-primary">{selectedParcel.id}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">SECTOR</div>
                    <div className="bg-background/80 p-3 text-right text-foreground">{selectedParcel.sectorName}</div>
                    <div className="bg-background/80 p-3 text-muted-foreground">COORDINATES</div>
                    <div className="bg-background/80 p-3 text-right text-muted-foreground">
                      {selectedParcel.centerLat.toFixed(2)} / {selectedParcel.centerLng.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      Canonical Parcel Name
                    </label>
                    <Input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      className="font-mono rounded-none border-border bg-card uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                      Registry Notes
                    </label>
                    <Textarea
                      value={draftNotes}
                      onChange={(event) => setDraftNotes(event.target.value)}
                      className="font-mono rounded-none border-border bg-card min-h-40 resize-y"
                      placeholder="Add naming rationale, legal notes, or operational context."
                    />
                  </div>
                </>
              ) : (
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-center py-12">
                  Select a {mode === "sectors" ? "sector" : "parcel"} to edit registry naming.
                </div>
              )}

              <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground max-w-md">
                  Registry edits change the canonical display name, not the underlying parcel grid or coordinates.
                </p>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || (mode === "sectors" ? !selectedSector : !selectedParcel)}
                  className="rounded-none font-mono uppercase tracking-widest"
                >
                  {saving ? "Saving..." : "Save Registry Entry"}
                </Button>
              </div>
            </div>
          </div>

          <MarsParcelGlobe
            parcels={parcels}
            latitude={globeFocusParcel?.centerLat ?? -13.9}
            longitude={globeFocusParcel?.centerLng ?? -59.2}
            selectedParcelId={globeFocusParcel?.id}
            onSelectParcel={(parcel) => {
              setMode("parcels");
              setSelectedParcelId(parcel.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}