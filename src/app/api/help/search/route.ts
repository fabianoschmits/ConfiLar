/**
 * API Route: Search help articles
 * POST /api/help/search
 */

import { NextRequest, NextResponse } from "next/server";
import { searchHelpArticles, logHelpInteraction } from "@/lib/help/helpService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Search for matching article
    const result = await searchHelpArticles(query);

    // Log the interaction
    await logHelpInteraction({
      user_message: query,
      matched_article_id: result?.article.id || null,
    });

    // Return result
    if (result) {
      return NextResponse.json({
        success: true,
        result: {
          article: result.article,
          score: result.score,
          confidence: result.confidence,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        result: null,
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error in help search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
