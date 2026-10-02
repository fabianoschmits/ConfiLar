import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export async function purchaseOnce(
  admin: SupabaseClient,
  request: NextRequest,
  body: unknown,
  operation: string,
  args: Record<string, unknown>,
) {
  const key = request.headers.get("Idempotency-Key");
  if (
    !key ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      key,
    )
  ) {
    throw new Error("Uma chave de compra válida é obrigatória.");
  }
  const { data, error } = await admin.rpc("execute_purchase_once", {
    p_user_id: args.p_user_id ?? args.p_from_user_id,
    p_key: key,
    p_operation: operation,
    p_fingerprint: createHash("sha256")
      .update(JSON.stringify(body))
      .digest("hex"),
    p_arguments: args,
  });
  if (error && !/^(P0001|22|23|42501)/.test(error.code || ""))
    throw new Error(
      "Não foi possível confirmar o resultado. Repita com a mesma chave.",
    );
  return { data: data?.result, error, replayed: data?.replayed === true };
}
