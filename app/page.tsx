"use client";
import { AppBar, Box, Button, LinearProgress } from "@mui/material";
import { useState } from "react";
import { ROMEntry } from "./api/roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { ROMTreeView } from "@/components/ROMTreeView";
import { ROMGridView } from "@/components/ROMGridView";

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [lastSelectedSystem, setLastSelectedSystem] = useState<string | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { data: romData, error, isLoading } = useGetRomsQuery("");
  console.log(romData, error, isLoading);

  const onSelectFile = (fileId: string) => {
    setSelectedFile(fileId);
    setLastSelectedSystem(selectedSystem);
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
      onSelectFile(itemId.split("-")[0]);
    }
  };

  console.log(selectedSystem, selectedFile);
  if (!isLoading && error) {
    return <div>Error loading ROM data</div>;
  }

  return (
    <Box>
      <AppBar
        position="relative"
        style={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
        }}
      >
        <h1
          style={{
            flexGrow: 1,
            fontWeight: "bold",
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          My ROM Collection
        </h1>
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
              <div>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    if (lastSelectedSystem) {
                      setSelectedSystem(lastSelectedSystem);
                    }
                  }}
                >
                  Back
                </Button>
                Details for file ino: {selectedFile}
                {romData.result &&
                  Object.values(romData.result as Record<string, ROMEntry[]>)
                    .flat()
                    .map((file: ROMEntry) => {
                      if (file.ino.toString() === selectedFile) {
                        return (
                          <Box key={file.ino} marginTop={2}>
                            <div>
                              <strong>Name:</strong> {file.name}
                            </div>
                            <div>
                              <strong>Full Path:</strong> {file.fullPath}
                            </div>
                            <div>
                              <strong>Size:</strong> {file.size} bytes
                            </div>
                          </Box>
                        );
                      }
                      return null;
                    })}
              </div>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
