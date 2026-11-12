import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/short-code";
import { createLinkSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

function getAppUrl() {
  const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

  if (!appUrl) {
    throw new Error("APP_URL environment variable is not configured");
  }

  return appUrl;
}

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
          ...link,
          shortUrl: `${getAppUrl()}/${link.shortCode}`,
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

export async function GET(req: NextRequest) {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: "desc",
      }
    });

    const data = links.map((link) => ({
      ...link,
      shortUrl: `${getAppUrl()}/${link.shortCode}`,
    }));

    // console.log(links)

    return NextResponse.json({
      success: true,
      message: "Links fetched successfully!",
      data
    })

  } catch (e) {
    console.error("Fetch links error:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch links",
      },
      { status: 500 }
    );
  }
}