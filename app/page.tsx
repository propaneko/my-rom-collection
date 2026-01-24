"use client";
import { AppBar, Box, Button, LinearProgress } from "@mui/material";
import { useState } from "react";
import { find, pick, values } from "lodash";
import { ROMEntry } from "./api/roms/get-local-roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { ROMTreeView } from "@/components/ROMTreeView";
import { ROMGridView } from "@/components/ROMGridView";
import ScrapeModal from "@/components/ScrapeModal";
import { Media } from "./api/roms/types";
import NextImage from "next/image";
import { ROMView } from "@/components/ROMView";

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [lastSelectedSystem, setLastSelectedSystem] = useState<string | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  const { data: romData, error, isLoading } = useGetRomsQuery("");
  console.log(romData, error, isLoading);

  const onSelectFile = (fileId: string, systemId: string) => {
    setSelectedFile(fileId);
    setLastSelectedSystem(systemId);
    setSelectedSystem(null);
  };

  const onSelectSystem = (systemId: string) => {
    setLastSelectedSystem(selectedSystem);
    setSelectedSystem(systemId);
    setSelectedFile(null);
  };

  const handleItemSelectionToggle = (
    event: React.SyntheticEvent | null,
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
    <Box>
      <ScrapeModal open={open} onClose={() => setOpen(false)} />
      <AppBar
        position="relative"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 2,
        }}
      >
        <h1
          style={{
            flex: 1,
            flexGrow: 1,
            fontWeight: "bold",
          }}
        >
          My ROM Collection
        </h1>
        <Button
          style={{
            flexGrow: 1,
            fontWeight: "bold",
          }}
          onClick={() => setOpen(true)}
        >
          Scrap games
        </Button>
      </AppBar>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <Box display="flex" height="calc(100vh - 64px)" flexDirection="row">
          <Box flex={1} padding={4} style={{ overflowY: "auto" }}>
            <ROMTreeView
              handleItemSelectionToggle={handleItemSelectionToggle}
            />
          </Box>
          <Box flex={3} padding={4} style={{ overflowY: "auto" }}>
            {selectedSystem && (
              <ROMGridView
                onSelectFile={onSelectFile}
                selectedSystem={selectedSystem}
              />
            )}
            {selectedFile && (
              <ROMView
                lastSelectedSystem={lastSelectedSystem}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                setSelectedSystem={setSelectedSystem}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
