begin;
create table if not exists public.purchase_request_receipts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_key uuid not null,
  operation text not null,
  fingerprint text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, request_key)
);
alter table public.purchase_request_receipts enable row level security;
revoke all on public.purchase_request_receipts from anon, authenticated;
grant all on public.purchase_request_receipts to service_role;

create or replace function public.execute_purchase_once(
  p_user_id uuid, p_key uuid, p_operation text, p_fingerprint text, p_arguments jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare receipt public.purchase_request_receipts; result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'Service role required' using errcode='42501'; end if;
  if p_user_id is null or p_key is null or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid purchase request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_key::text, 0));
  select * into receipt from public.purchase_request_receipts where user_id=p_user_id and request_key=p_key;
  if found then
    if receipt.operation <> p_operation or receipt.fingerprint <> p_fingerprint then raise exception 'Idempotency key already used for another request'; end if;
    return jsonb_build_object('result',receipt.result,'replayed',true);
  end if;
  case p_operation
    when 'premium-content' then result := public.purchase_premium_content(p_user_id, p_arguments->>'p_kind', (p_arguments->>'p_record_id')::uuid, p_arguments->'p_payload', (p_arguments->>'p_points')::integer, p_arguments->>'p_credit');
    when 'premium-like' then result := public.purchase_premium_like(p_user_id, p_arguments->>'p_kind', (p_arguments->>'p_content_id')::uuid);
    when 'store' then result := to_jsonb(public.purchase_store_item(p_user_id, (p_arguments->>'p_item_id')::uuid));
    when 'points-purchase' then result := to_jsonb(public.create_points_purchase(p_user_id, (p_arguments->>'p_package_id')::uuid, p_arguments->>'p_payment_method'));
    when 'transfer' then result := to_jsonb(public.transfer_points(p_user_id, (p_arguments->>'p_to_user_id')::uuid, (p_arguments->>'p_points_amount')::integer, p_arguments->>'p_message'));
    else raise exception 'Unsupported purchase operation';
  end case;
  insert into public.purchase_request_receipts(user_id,request_key,operation,fingerprint,result) values(p_user_id,p_key,p_operation,p_fingerprint,result);
  return jsonb_build_object('result',result,'replayed',false);
end;
$$;
revoke all on function public.execute_purchase_once(uuid,uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.execute_purchase_once(uuid,uuid,text,text,jsonb) to service_role;
commit;
