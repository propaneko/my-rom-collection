import { SelectionState } from "@/app/page";
import { useGetRomsQuery } from "@/lib/services/roms";
import { Button, Box, Grid, Typography, Divider } from "@mui/material";
import { pick } from "lodash";
import NextImage from "next/image";
import { Dispatch, SetStateAction, useMemo } from "react";
import { GlassPaper } from "./ui/GrayPaper";
import { ROMEntry } from "@/app/api/local/roms/helpers/getAllROMS";
import { randomUUID } from "crypto";

interface ROMViewProps {
  selectedFile: string | null;
  lastSelectedSystem: string | null;
  setSelectionState: Dispatch<SetStateAction<SelectionState>>;
}

export const ROMView = ({ selectedFile, setSelectionState }: ROMViewProps) => {
  const { data: romData, isSuccess } = useGetRomsQuery("");

  const file = useMemo(() => {
    return Object.values(romData.result as Record<string, ROMEntry>)
      .flat()
      .find((rom) => rom?.ino.toString() === selectedFile);
  }, [romData.result, selectedFile]);

  const getAvailableImages = useMemo(() => {
    return Object.values(
      pick(file?.metadata?.media, ["sstitle", "ss", "wheel", "fanart"]),
    ).flat();
  }, [file]);

  const getAvailableVideo = useMemo(() => {
    return Object.values(pick(file?.metadata?.media, ["video"])).flat();
  }, [file]);

  if (!file || !isSuccess) {
    return null;
  }

  return (
    <Box>
      <GlassPaper className="mb-8">
        <Typography variant="h4" gutterBottom className="text-center p-4 mb-0!">
          {file.name}
        </Typography>
      </GlassPaper>

      <Grid container spacing={1}>
        {/* Left column - Media and Images */}
        <Grid size={12}>
          <GlassPaper className="p-4">
            <Typography
              variant="subtitle1"
              color="text.secondary"
              className="mb-2"
            >
              Media
            </Typography>

            {getAvailableImages.length > 0 && (
              <Box className="flex flex-wrap gap-2">
                {getAvailableVideo.length > 0 && (
                  <Box className="mb-2">
                    {getAvailableVideo.map((video) => (
                      <video
                        key={file?.metadata?.id}
                        height={150}
                        width={200}
                        controls
                        muted
                        autoPlay
                        className="max-w-full"
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = "none";
                        }}
                      >
                        <source src={video?.url} />
                      </video>
                    ))}
                  </Box>
                )}
                {getAvailableImages.map((image) => (
                  <>
                    {console.log(image, file)}
                    <NextImage
                      key={`${file?.metadata?.id}-${image?.size}`}
                      src={image?.url || "/image-not-found.png"}
                      alt={image?.format || "Image"}
                      width={150}
                      height={100}
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/image-not-found.png";
                      }}
                    />
                  </>
                ))}
              </Box>
            )}
          </GlassPaper>
        </Grid>

        <Grid size={12}>
          <Box className="flex flex-col gap-2">
            <GlassPaper className="p-4">
              <Typography
                variant="subtitle1"
                color="text.secondary"
                className="mb-1"
              >
                Description
              </Typography>
              <Typography>{file.metadata?.description || "N/A"}</Typography>
            </GlassPaper>

            <GlassPaper className="p-4">
              <Typography
                variant="subtitle1"
                color="text.secondary"
                className="mb-1"
              >
                Full Path
              </Typography>
              <Typography>{file.fullPath}</Typography>
            </GlassPaper>

            <Grid container spacing={2}>
              <Grid size={4}>
                <GlassPaper className="p-4">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    className="mb-1"
                  >
                    Size
                  </Typography>
                  <Typography>{file.size} bytes</Typography>
                </GlassPaper>
              </Grid>
              <Grid size={4}>
                <GlassPaper className="p-4">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    className="mb-1"
                  >
                    System
                  </Typography>
                  <Typography>{file.system}</Typography>
                </GlassPaper>
              </Grid>
              <Grid size={4}>
                <GlassPaper className="p-4">
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    className="mb-1"
                  >
                    File ID
                  </Typography>
                  <Typography>{file.ino}</Typography>
                </GlassPaper>
              </Grid>
            </Grid>

            <Box className="flex flex-col gap-2 mt-2">
              <GlassPaper className="flex justify-between">
                <Button
                  onClick={async () => {
                    const params = new URLSearchParams({
                      fileId: file?.ino?.toString() || "",
                    });
                    window.location.href = `/api/local/roms/download?${params}`;
                  }}
                  className="mt-2"
                >
                  Download ROM
                </Button>
                <Button
                  onClick={() => {
                    setSelectionState((prev) => ({
                      system: prev.lastSystem,
                      file: null,
                      lastSystem: null,
                    }));
                  }}
                  className="mb-2"
                >
                  Back
                </Button>
              </GlassPaper>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
