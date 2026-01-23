import { ROMEntry } from "@/app/api/roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { SimpleTreeView, TreeItem, TreeViewItemId } from "@mui/x-tree-view";
import { SyntheticEvent } from "react";

export const ROMTreeView = ({
  handleItemSelectionToggle,
}: {
  handleItemSelectionToggle: (
    event: SyntheticEvent | null,
    itemId: TreeViewItemId,
    isSelected: boolean,
  ) => void;
}) => {
  const { data: romData } = useGetRomsQuery("");

  return (
    <SimpleTreeView onItemSelectionToggle={handleItemSelectionToggle}>
      {romData &&
        Object.keys(romData.result).map((directory) => (
          <TreeItem
            key={directory}
            itemId={`${directory}-system`}
            label={directory}
          >
            {romData.result[directory].map((file: ROMEntry) => (
              <TreeItem
                key={file.ino}
                itemId={`${file.ino}-file`}
                label={file.name}
              />
            ))}
          </TreeItem>
        ))}
    </SimpleTreeView>
  );
};
