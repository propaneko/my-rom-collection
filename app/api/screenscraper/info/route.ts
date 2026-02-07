import { NextResponse, type NextRequest } from "next/server";
import { createDefaultUrl } from "../helpers/createDefaultUrl";

export async function GET(request: NextRequest) {
  if (request.method !== "GET") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  try {
    const defaultUrl = createDefaultUrl("ssuserInfos.php");
    const finalUrl = `${defaultUrl}&output=json&softname=zzz`

    const response = await fetch(finalUrl);
    const result = await response.json();

    return NextResponse.json({ result: result }, { status: 200 });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}
