import { ROMEntry } from "@/app/api/roms/get-local-roms/helpers/getAllROMS";
import { Media } from "@/app/api/roms/types";
import { useGetRomsQuery } from "@/lib/services/roms";
import { Grid, Paper, Typography } from "@mui/material";
import { sortBy } from "lodash";
import NextImage from "next/image";

export const ROMGridView = ({
  selectedSystem,
  onSelectFile,
}: {
  selectedSystem: string;
  onSelectFile: (fileId: string, systemId: string) => void;
}) => {
  const { data: romData, isSuccess } = useGetRomsQuery("");
  return (
    <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
      {isSuccess &&
        sortBy(romData.result[selectedSystem], (file) => file.name ).map((file: ROMEntry) => (
          <Grid
            style={{ cursor: "pointer" }}
            size={2}
            key={file.ino}
            onClick={() => {
              onSelectFile(file.ino.toString(), selectedSystem);
            }}
          >
            <Paper>
              {file.metadata?.media ? (
                <NextImage
                  style={{ margin: "0 auto" }}
                  alt=""
                  src={
                    (
                      file.metadata?.media as unknown as
                        | Record<string, Media[]>
                        | undefined
                    )?.["box-2D"]?.[0]?.url || ""
                  }
                  width={100}
                  height={100}
                />
              ) : (
                <Typography style={{margin: "0 auto"}} width={100} height={100}>{file.name}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
    </Grid>
  );
};
