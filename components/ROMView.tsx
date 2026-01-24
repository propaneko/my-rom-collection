import { ROMEntry } from "@/app/api/roms/get-local-roms/helpers/getAllROMS";
import { Media } from "@/app/api/roms/types";
import { useGetRomsQuery } from "@/lib/services/roms";
import { Button, Box } from "@mui/material";
import { pick } from "lodash";
import NextImage from "next/image";
import { Dispatch, SetStateAction, useMemo } from "react";

interface ROMViewProps {
  selectedFile: string | null;
  lastSelectedSystem: string | null;
  setSelectedSystem: Dispatch<SetStateAction<string | null>>;
  setSelectedFile: Dispatch<SetStateAction<string | null>>;
}

export const ROMView = ({
  selectedFile,
  lastSelectedSystem,
  setSelectedSystem,
  setSelectedFile,
}: ROMViewProps) => {
  const { data: romData, isSuccess } = useGetRomsQuery("");

  const file = useMemo(() => {
    return Object.values(romData.result as Record<string, ROMEntry>)
      .flat()
      .find((rom) => rom?.ino.toString() === selectedFile);
  }, [romData.result, selectedFile]);

  const getAvailableImages = useMemo(() => {
    return Object.values(
      pick(file?.metadata?.media, ["ss", "sstitle", "wheel", "fanart"]),
    ).flat();
  }, [file]);

  const getAvailableVideo = useMemo(() => {
    return Object.values(
      pick(file?.metadata?.media, ["video"]),
    ).flat();
  }, [file]);

  console.log(getAvailableVideo);

  return (
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
      {isSuccess && (
        <Box key={file?.ino} marginTop={2}>
          <div style={{ display: "flex", overflowY: "auto" }}>
            {getAvailableImages.map((image) => (
              <NextImage
                key={image?.size}
                src={image?.url || ""}
                alt={image?.format || ""}
                width={150}
                height={100}
              />
            ))}
          </div>
          <div style={{ display: "flex" }}>
            {getAvailableVideo.map((video) => (
              <video height={240} width={320} key={video?.id} controls muted autoPlay> 
                <source src={video?.url} />
              </video>
            ))}
          </div>
          <div>
            <strong>Name:</strong> {file?.name}
          </div>
          <div>
            <strong>Description:</strong> {file?.metadata?.description || "N/A"}
          </div>
          <div>
            <strong>Full Path:</strong> {file?.fullPath}
          </div>
          <div>
            <strong>Size:</strong> {file?.size} bytes
          </div>
          <Button
            onClick={async () => {
              const params = new URLSearchParams({
                fileId: file?.ino?.toString() || "",
              });
              window.location.href = `/api/roms/download-rom?${params}`;
            }}
          >
            Download
          </Button>
        </Box>
      )}
    </div>
  );
};
