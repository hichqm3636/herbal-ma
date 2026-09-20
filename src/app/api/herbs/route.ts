import { NextRequest } from "next/server";
import { searchHerbs } from "@/lib/herbs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = searchHerbs(query);

  return Response.json({
    query,
    count: results.length,
    results,
  });
}
