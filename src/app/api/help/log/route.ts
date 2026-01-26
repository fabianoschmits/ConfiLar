/**
 * API Route: Log help interaction
 * POST /api/help/log
 */

import { NextRequest, NextResponse } from "next/server";
import { logHelpInteraction } from "@/lib/help/helpService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_message, matched_article_id } = body;

    if (!user_message || typeof user_message !== "string") {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 },
      );
    }

    // Log the interaction
    await logHelpInteraction({
      user_message,
      matched_article_id: matched_article_id || null,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in help log API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
