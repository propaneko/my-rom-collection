import { ROMEntry } from "@/app/api/local/roms/helpers/getAllROMS";
import { useGetRomsQuery } from "@/lib/services/roms";
import { SimpleTreeView, TreeItem, TreeViewItemId } from "@mui/x-tree-view";
import { sortBy } from "lodash";
import { SyntheticEvent } from "react";
import { Skeleton } from "@mui/material";

export const ROMTreeView = ({
  handleItemSelectionToggle,
}: {
  handleItemSelectionToggle: (
    event: SyntheticEvent | null,
    itemId: TreeViewItemId,
    isSelected: boolean,
  ) => void;
}) => {
  const { data: romData, isSuccess, isLoading } = useGetRomsQuery("");

  if (isLoading) {
    return (
      <div className="max-h-[calc(100vh-188px)] overflow-y-auto">
        <SimpleTreeView>
          {Array.from(
            Array.from({ length: 12 }, (_, i) => i + 1),
            (_, index) => (
              <TreeItem
                key={index}
                itemId={`loading-${index}`}
                label={<Skeleton variant="text" animation="wave" width={200} />}
              />
            ),
          )}
        </SimpleTreeView>
      </div>
    );
  }

  const sortedRomData = sortBy(
    Object.keys(romData.result),
    (directory) => directory,
  );

  return (
    <div className="max-h-[calc(100vh-188px)] overflow-y-auto">
      <SimpleTreeView onItemSelectionToggle={handleItemSelectionToggle}>
        {isSuccess &&
          sortedRomData.map((directory) => (
            <TreeItem
              key={directory}
              itemId={`${directory}-system`}
              label={
                <div className="flex items-center justify-between">
                  <span>{directory}</span>
                  <span>{romData.result[directory].length}</span>
                </div>
              }
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
    </div>
  );
};
