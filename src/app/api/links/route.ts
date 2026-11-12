import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/short-code";
import { createLinkSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = createLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    };

    const { originalUrl } = validation.data;

    const shortCode = generateShortCode();

    const link = await prisma.link.create({
      data: {
        originalUrl,
        shortCode
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Short URL created successfully",
        data: {
          id: link.id,
          originalUrl: link.originalUrl,
          shortCode: link.shortCode,
          shortUrl: `${req.nextUrl.origin}/${link.shortCode}`,
          clicks: link.clicks,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create link error: ", e);

    return NextResponse.json(
      { error: "Something went wrong while creating shortCode" },
      { status: 500 }
    )

  }
}