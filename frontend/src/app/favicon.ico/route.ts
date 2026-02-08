import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "georgeherald_favicon.png");
  const bytes = fs.readFileSync(filePath);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
