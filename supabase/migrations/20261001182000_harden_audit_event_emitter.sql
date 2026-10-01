-- HAJITRAVEL OS governance hardening: audit event emitter must remain internal.
-- Trigger functions call this SECURITY DEFINER function directly; application roles
-- do not need direct EXECUTE access.
revoke execute on function audit.emit_event(text,text,text,uuid,uuid,text,jsonb) from public;
revoke execute on function audit.emit_event(text,text,text,uuid,uuid,text,jsonb) from anon;
revoke execute on function audit.emit_event(text,text,text,uuid,uuid,text,jsonb) from authenticated;
grant execute on function audit.emit_event(text,text,text,uuid,uuid,text,jsonb) to postgres;
