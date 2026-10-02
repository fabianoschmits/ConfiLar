SELECT route,mobile,name,count(*) AS samples, percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75
FROM public.mobile_telemetry WHERE created_at > now()-interval '30 days' GROUP BY route,mobile,name ORDER BY route,mobile,name;
