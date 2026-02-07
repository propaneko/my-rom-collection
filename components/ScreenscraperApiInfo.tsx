import { useGetInfoQuery } from "@/lib/services/screenscraper";
import { GlassPaper } from "./ui/GrayPaper";
import { Button, Skeleton } from "@mui/material";

interface RequestCounterProps {
  setOpen: (open: boolean) => void;
}

const ScreenscraperApiInfo = ({ setOpen }: RequestCounterProps) => {
  const { data: info, error, isLoading } = useGetInfoQuery("");

  return (
    <GlassPaper className="flex items-center justify-around">
      {isLoading ? (
        <>
          <Skeleton
            variant="text"
            data-testid="skeleton-1"
            width={120}
            height={36}
          />
          <Skeleton
            variant="text"
            data-testid="skeleton-2"
            width={120}
            height={36}
          />
        </>
      ) : (
        <>
          <Button onClick={() => setOpen(true)}>Scrap games</Button>
          <div className="mr-2">
            {info?.requeststoday} / {info?.maxrequestsperday}
          </div>
        </>
      )}
      {error && (
        <div className="ml-2 text-red-500">
          Error: Failed to load request information
        </div>
      )}
    </GlassPaper>
  );
};

export default ScreenscraperApiInfo;
