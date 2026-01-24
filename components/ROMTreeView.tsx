import { ROMEntry } from "@/app/api/roms/get-local-roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { SimpleTreeView, TreeItem, TreeViewItemId } from "@mui/x-tree-view";
import { sortBy } from "lodash";
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
  const { data: romData, isSuccess } = useGetRomsQuery("");

  const sortedRomData = sortBy(Object.keys(romData.result), (directory) => directory)

  return (
    <SimpleTreeView onItemSelectionToggle={handleItemSelectionToggle}>
      {isSuccess &&
        sortedRomData.map((directory) => (
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
