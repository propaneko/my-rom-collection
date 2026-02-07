"use client";
import { Box, Divider, LinearProgress, Stack } from "@mui/material";
import {  useState } from "react";
import { find, values } from "lodash";
import { useGetRomsQuery } from "@/lib/services/roms";
import { ROMTreeView } from "@/components/ROMTreeView";
import { ROMGridView } from "@/components/ROMGridView";
import { ROMView } from "@/components/ROMView";
import { GlassPaper } from "@/components/ui/GrayPaper";
import { ROMEntry } from "./api/local/roms/helpers/getAllROMS";
import ScreenscraperApiInfo from "@/components/ScreenscraperApiInfo";
import { ScreenscraperModalScraper } from "@/components/ScreenscraperModalScraper";

export type SelectionState = {
  system: string | null; // The currently selected system (e.g., "NES", "Super Nintendo")
  file: string | null; // The currently selected file ID (likely the ino property)
  lastSystem: string | null; // Previously selected system
};

export default function Home() {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    system: "NES",
    file: null,
    lastSystem: null,
  });

  const [open, setOpen] = useState(false);


  const { data: romData, error, isLoading } = useGetRomsQuery("");

  const onSelectSystem = (systemId: string) => {
    setSelectionState((prev) => ({
      system: systemId,
      file: null,
      lastSystem: prev.system || prev.lastSystem,
    }));
  };

  const onSelectFile = (fileId: string, systemId: string) => {
    setSelectionState(() => ({
      system: null,
      file: fileId,
      lastSystem: systemId,
    }));
  };

  const handleItemSelectionToggle = (
    _event: React.SyntheticEvent | null,
    itemId: string,
    isSelected: boolean,
  ) => {
    if (isSelected && itemId.endsWith("-system")) {
      onSelectSystem(itemId.split("-")[0]);
    } else if (isSelected && itemId.endsWith("-file")) {
      const resultArray = values(romData?.result || {}).flat();
      const file: ROMEntry = find(
        resultArray,
        (file) => file.ino.toString() === itemId.split("-")[0],
      );
      onSelectFile(file.ino.toString(), file.system);
    }
  };

  if (!isLoading && error) {
    return <div>Error loading ROM data</div>;
  }

  return (
    <Box className="h-screen bg-linear-to-br from-indigo-900 to-purple-800 flex flex-col">
        <Box className="flex flex-1 flex-row overflow-hidden">
          <Box
            style={{ height: "calc(100vh - 16px)" }}
            className="flex-1 rounded-2xl backdrop-blur-lg border border-white/20 p-2 m-2 shadow-2xl"
          >
            <Stack divider={<Divider flexItem />} spacing={2}>
              <GlassPaper className="text-center">
                <h1 className="p-2.5">My ROM Collection</h1>
              </GlassPaper>
              <ScreenscraperApiInfo setOpen={setOpen} />
              <GlassPaper>
                <ROMTreeView
                  handleItemSelectionToggle={handleItemSelectionToggle}
                />
              </GlassPaper>
            </Stack>
          </Box>
          <Box className="flex-4 rounded-2xl backdrop-blur-lg border border-white/20 p-2 m-2 shadow-2xl">
            <ScreenscraperModalScraper open={open} onClose={() => setOpen(false)} />
            {selectionState.system && (
              <ROMGridView
                onSelectFile={onSelectFile}
                selectedSystem={selectionState.system}
              />
            )}
            {selectionState.file && (
              <ROMView
                lastSelectedSystem={selectionState.lastSystem}
                selectedFile={selectionState.file}
                setSelectionState={setSelectionState}
              />
            )}
          </Box>
        </Box>
    </Box>
  );
}
