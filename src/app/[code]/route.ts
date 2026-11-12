import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{code: string}> }
){
  const { code } = await params;

  const link = await prisma.link.update({
    where: { shortCode: code },
    data: {
      clicks: { increment: 1 }
    },
  }).catch(() => null);

  if(!link){
    return NextResponse.json(
      {error: "short Url not found !"},
      {status: 404}
    );
  };

  return NextResponse.redirect(link.originalUrl, 302)
}