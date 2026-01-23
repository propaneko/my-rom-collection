import { ROMEntry } from "@/app/api/roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { Grid, Paper } from "@mui/material";

export const ROMGridView = ({
  selectedSystem,
  onSelectFile,
}: {
  selectedSystem: string;
  onSelectFile: (fileId: string) => void;
}) => {
  const { data: romData } = useGetRomsQuery("");
  return (
    <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
      {romData.result &&
        romData.result[selectedSystem].map((file: ROMEntry) => (
          <Grid
            size={2}
            key={file.ino}
            onClick={() => {
              onSelectFile(file.ino.toString());
            }}
          >
            <Paper style={{ height: 100 }}> {file.name} </Paper>
          </Grid>
        ))}
    </Grid>
  );
};
