import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Readable } from "stream";
import { getGameInfo } from "./helpers/getGameInfo";
import { transformGame } from "./helpers/transformGame";
import { isArray } from "lodash";

const activeJobs = new Map<string, { cancelled: boolean }>();

export async function GET(request: NextRequest) {
  if (request.method !== "GET") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  try {
    // Start a new job
    const jobId = crypto.randomUUID();
    activeJobs.set(jobId, { cancelled: false });

    const roms = await prisma.rom.findMany();
    const total = roms.length;
    if (total === 0) {
      return new NextResponse("No ROMs found", { status: 200 });
    }

    // Create a readable stream for SSE
    const stream = new Readable({
      read() {},
    });
    const sendEvent = (data: unknown) => {
      stream.push(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Start processing ROMs asynchronously
    (async () => {
      const failedRoms: Array<{ rom: (typeof roms)[number]; error: string }> =
        [];
      let processed = 0;
      for (const rom of roms) {
        const job = activeJobs.get(jobId);
        if (!job || job.cancelled) {
          break;
        }

        processed++;
        sendEvent({
          status: "progress",
          total,
          processed,
          left: total - processed,
          rom,
          jobId,
        });

        // Check if metadata already exists
        const foundMetadata = await prisma.metadata.findUnique({
          where: { romId: rom.id },
        });
        if (foundMetadata) {
          continue;
        }

        const { gameInfo, header } = await getGameInfo(
          rom.name || "",
          rom.system || "",
        );

        sendEvent({
          status: "headers",
          header
        })

        // Check for cancellation after async operation
        if (activeJobs.get(jobId)?.cancelled) {
          sendEvent({
            status: "cancelled",
            message: "Cancelled after fetch",
          });
          break;
        }

        if (!gameInfo) {
          sendEvent({
            status: "error",
            rom,
            error: "No metadata found",
          });
          failedRoms.push({ rom, error: "No metadata found" });
          continue;
        }

        const {
          id,
          name,
          synopsis,
          developer,
          dates,
          media,
          system,
          publisher,
        } = transformGame(gameInfo, "en");

        await prisma.metadata.create({
          data: {
            romId: rom.id,
            gameId: id,
            title: name,
            description: synopsis,
            year: isArray(dates) ? dates[0]?.text : "",
            developer: developer?.text || "",
            publisher: publisher?.text || "",
            systemId: system.id,
            systemName: system.text,
            media: media,
          },
        });

        sendEvent({
          status: "scraped",
          header,
          romId: rom.id,
          metadata: { title: name },
        });
      }

      sendEvent({
        status: "complete",
        failedRoms,
        total,
      });
      stream.push(null); // End stream
    })();

    return new NextResponse(stream as never, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Job-Id": jobId,
      },
    });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing jobId" },
        { status: 400 },
      );
    }

    const job = activeJobs.get(jobId);
    if (job) {
      job.cancelled = true;
      return NextResponse.json({
        success: true,
        message: "Cancellation requested",
      });
    }

    return NextResponse.json(
      { success: false, message: "Job not found or already finished" },
      { status: 404 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
