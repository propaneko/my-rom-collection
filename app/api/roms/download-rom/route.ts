import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";

export async function GET(request: NextRequest) {
  if (request.method !== "GET") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  try {
    const fileId = request.nextUrl.searchParams.get("fileId");
    if (!fileId) {
      return new NextResponse("Bad Request: Missing fileId parameter", { status: 400 });
    }
    const romFile = await prisma.rom.findUnique({
      where: { ino: parseInt(fileId) },
    });

    if (!romFile) {
      return new NextResponse("Not Found: ROM file does not exist", { status: 404 });
    }
    const stream = fs.createReadStream(romFile.fullPath);

    const headers = new Headers({
      "Content-Disposition": `attachment; filename="${romFile.name}.${romFile.extension}"`,
      "Content-Type": "application/octet-stream",
      "Content-Length": romFile.size?.toString() || "0",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(stream as any, { headers, status: 200 });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}
