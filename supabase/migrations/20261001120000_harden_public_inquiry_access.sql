-- Harden public inquiry intake: anonymous users may submit, but authenticated users must not receive global cross-organization read/update access.
revoke select, update on public.travel_inquiries from authenticated;
drop policy if exists "authenticated_inquiry_select" on public.travel_inquiries;
drop policy if exists "authenticated_inquiry_update" on public.travel_inquiries;
