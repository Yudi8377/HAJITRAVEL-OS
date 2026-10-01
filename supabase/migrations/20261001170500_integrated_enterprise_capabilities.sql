-- HAJITRAVEL OS — integrated enterprise capability catalog
insert into organization.capabilities(code,name,active) values
('health.read','Read health signals',true),('health.create','Create health signals',true),('health.update','Update health signals',true),
('supplier.read','Read suppliers',true),('supplier.create','Create suppliers',true),('supplier.update','Update suppliers',true),
('procurement.read','Read procurement',true),('procurement.create','Create procurement requests',true),('procurement.update','Update procurement',true),
('hr.read','Read HR staff',true),('hr.create','Create HR staff',true),('hr.update','Update HR staff',true),
('grc.read','Read GRC controls',true),('grc.create','Create GRC controls',true),('grc.update','Update GRC controls',true),
('regulatory.read','Read regulatory obligations',true),('regulatory.create','Create regulatory obligations',true),('regulatory.update','Update regulatory obligations',true),
('ai.read','Read AI runs',true),('ai.run','Run AI tasks',true),('ai.review','Review AI outputs',true),
('bi.read','Read BI metrics',true),('bi.write','Write BI metrics',true),
('integration.read','Read integrations',true),('integration.manage','Manage integrations',true)
on conflict(code) do update set name=excluded.name,active=true;

insert into organization.role_capabilities(role_id,capability_id)
select '6b5a8420-c212-4b89-8882-09fdc1d599fb'::uuid,c.id
from organization.capabilities c
where c.code in ('health.read','health.create','health.update','supplier.read','supplier.create','supplier.update','procurement.read','procurement.create','procurement.update','hr.read','hr.create','hr.update','grc.read','grc.create','grc.update','regulatory.read','regulatory.create','regulatory.update','ai.read','ai.run','ai.review','bi.read','bi.write','integration.read','integration.manage')
on conflict do nothing;
