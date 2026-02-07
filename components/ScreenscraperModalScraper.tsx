"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { romsApi } from "@/lib/services/roms";
import { useAppDispatch } from "@/lib/hooks";
import { Ssuser } from "@/app/api/local/roms/types";

interface ScrapeModalProps {
  open: boolean;
  onClose: () => void;
}

export const ScreenscraperModalScraper = ({ open, onClose }: ScrapeModalProps) => {
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    left: 0,
    rom: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [header, setHeader] = useState<Ssuser | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [incompleteScrapes, setIncompleteScrapes] = useState<any[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const jobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setProgress({
      total: 0,
      processed: 0,
      left: 0,
      rom: "",
    });
    setErrorMsg(null);
    setIsComplete(false);
    setIsCancelled(false);

    abortControllerRef.current = new AbortController();

    const startScraping = async () => {
      try {
        const response = await fetch("/api/screenscraper/scrape", {
          method: "GET",
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream available");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(part.slice(6));

              if (data.status === "progress") {
                if (data.jobId && !jobIdRef.current) {
                  jobIdRef.current = data.jobId;
                }

                setProgress({
                  total: data.total,
                  processed: data.processed,
                  left: data.left,
                  rom: data.rom?.name || "Unknown ROM",
                });
              } else if (data.status === "headers") {
                setHeader(data.header);
              } else if (data.status === "scraped") {
                // Optional: can show success per ROM if you want
                setErrorMsg(null);
                console.log("Scraped:", data.romId, data.metadata?.title);
              } else if (data.status === "error") {
                setErrorMsg(
                  `Error processing ${data.rom?.name}: ${data.error}`,
                );
              } else if (data.status === "cancelled") {
                setIsCancelled(true);
              } else if (data.status === "complete") {
                setIsComplete(true);
                // Refresh the ROMs list in RTK Query cache
                dispatch(romsApi.util.invalidateTags(["RomsList"]));
                setIncompleteScrapes(data.failedRoms || []);
              }
            } catch (parseErr) {
              console.error("Failed to parse SSE event:", parseErr);
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setIsCancelled(true);
        } else {
          setErrorMsg(err.message || "Failed to connect to scraping process");
        }
      }
    };
    
    startScraping();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [open, dispatch]);

  const percent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  const handleCancel = async () => {
    abortControllerRef.current?.abort();

    if (jobIdRef.current) {
      try {
        await fetch("/api/roms/scrape-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: jobIdRef.current }),
        });
      } catch {
        // silent – best effort
      }
    }
  };

  const handleClose = () => {
    if (!isComplete && !isCancelled && !errorMsg) {
      if (window.confirm("Scraping is still running. Close anyway?")) {
        handleCancel();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={!isComplete && !errorMsg}
      className=" backdrop-blur-lg  bg-white/10"
    >
      <DialogTitle className="bg-white/10 backdrop-blur-lg border-b border-white/20 rounded-t-2xl p-4">
        Scraping Game Metadata
      </DialogTitle>

      <DialogContent
        dividers
        className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4"
      >
        {errorMsg && (
          <Typography color="error" variant="body1" align="center" gutterBottom>
            {errorMsg}
          </Typography>
        )}{" "}
        {isCancelled ? (
          <Alert 
            severity="warning" 
            className="mt-2 bg-white/10 backdrop-blur-lg border border-white/20"
          >
            Scraping was cancelled
          </Alert>
        ) : isComplete ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Completed!
            </Typography>
            <Typography variant="body1">
              Processed {progress.total} game{progress.total !== 1 ? "s" : ""}
            </Typography>
          </Box>
        ) : (
          <Box className="py-2">
            <Typography variant="body2" color="text.secondary" align="center">
              {progress.processed} / {progress.total} — {progress.left} left
            </Typography>

            {progress.rom && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                className="mt-1"
              >
                Current: <strong>{progress.rom}</strong>
              </Typography>
            )}
            <Box className="flex items-center mt-3 mb-1">
              <Box className="w-full mr-1">
                <LinearProgress 
                  variant="determinate" 
                  value={percent} 
                  className="bg-white/20"
                  sx={{
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#667eea",
                    },
                  }}
                />
              </Box>
              <Box className="min-w-[45px]">
                <Typography
                  variant="body2"
                  color="text.secondary"
                >{`${percent}%`}</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        className="bg-white/10 backdrop-blur-lg rounded-b-2xl p-4"
      >
        {isComplete || isCancelled ? (
          <Button 
            onClick={onClose} 
            variant="contained" 
            color="primary"
            className="bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30"
          >
            Close
          </Button>
        ) : (
          <Box
            className="flex items-center justify-between w-full px-2"
          >
            <Box className="flex items-center">
              <CircularProgress size={20} className="mr-1 text-white" />
              <Typography variant="body2" className="text-white">Working...</Typography>
            </Box>
            {header && (
              <Box>
                <Typography variant="body2" className="text-white">
                  Api limit: {header?.maxrequestsperday} /{" "}
                  {header?.requeststoday}
                </Typography>
              </Box>
            )}
            <Button 
              onClick={handleClose} 
              color="inherit"
              className="text-white border border-white/30 hover:border-white/50"
            >
              Cancel
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};