import { ROMEntry } from "@/app/api/local/roms/helpers/getAllROMS";
import { Media } from "@/app/api/local/roms/types";
import { useGetRomsQuery } from "@/lib/services/roms";
import { sortBy } from "lodash";
import NextImage from "next/image";
import { useMemo } from "react";
import { Skeleton } from "@mui/material";

export const ROMGridView = ({
  selectedSystem,
  onSelectFile,
}: {
  selectedSystem: string;
  onSelectFile: (fileId: string, systemId: string) => void;
}) => {
  const { data: romData, isSuccess, isLoading } = useGetRomsQuery("");

  const sortedFiles = useMemo(() => {
    return sortBy(romData?.result[selectedSystem], (file) => file.name);
  }, [romData, selectedSystem]);
  if (isLoading || !isSuccess || !romData?.result[selectedSystem]) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 overflow-y-auto max-h-[calc(100vh-36px)]">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="h-full flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 cursor-pointer"
          >
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={145}
              height={145}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 overflow-y-auto max-h-[calc(100vh-36px)]">
      {sortedFiles.map((file: ROMEntry) => {
        const media = file.metadata?.media as
          | Record<string, Media[]>
          | undefined;
        const box2D = media?.["box-2D"]?.[0];

        return (
          <div
            key={file.ino}
            className="h-full flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer relative group"
            onClick={() => onSelectFile(file.ino.toString(), selectedSystem)}
          >
            {box2D ? (
              <div className="min-w-[145px] min-h-[145px]">
                <NextImage
                  alt={file.name}
                  src={box2D.url || "/image-not-found.png"}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            ) : (
              <div className="text-center min-h-[145px]">
                <NextImage
                  alt={file.name}
                  src={"/image-not-found.png"}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
            <div className="absolute inset-0 rounded-lg bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-white text-sm font-medium text-center p-2">
                {file.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
