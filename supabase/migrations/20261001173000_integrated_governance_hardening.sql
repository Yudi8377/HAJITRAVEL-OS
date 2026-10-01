-- Integrated enterprise governance hardening: business actions + SoD.
insert into authz.business_actions(code,name,capability_code,entity_schema,entity_table,action_class,maker_required,checker_required,approver_required,active)
values
('health.signal.create','Create health signal','health.create','health','signals','MUTATION',true,false,false,true),
('health.signal.update','Update health signal','health.update','health','signals','MUTATION',true,false,false,true),
('supplier.create','Create supplier','supplier.create','supplier','suppliers','MUTATION',true,false,false,true),
('supplier.update','Update supplier','supplier.update','supplier','suppliers','MUTATION',true,false,false,true),
('procurement.request.create','Create procurement request','procurement.create','procurement','purchase_requests','MUTATION',true,false,false,true),
('procurement.request.update','Update procurement request','procurement.update','procurement','purchase_requests','MUTATION',true,true,false,true),
('hr.staff.create','Create staff record','hr.create','hr','staff','MUTATION',true,false,false,true),
('hr.staff.update','Update staff record','hr.update','hr','staff','MUTATION',true,false,false,true),
('grc.control.create','Create GRC control','grc.create','grc','controls','MUTATION',true,false,false,true),
('grc.control.update','Update GRC control','grc.update','grc','controls','MUTATION',true,true,false,true),
('regulatory.obligation.create','Create regulatory obligation','regulatory.create','regulatory','obligations','MUTATION',true,false,false,true),
('regulatory.obligation.update','Update regulatory obligation','regulatory.update','regulatory','obligations','MUTATION',true,true,false,true),
('ai.agent.run','Run governed AI task','ai.run','ai','agent_runs','MUTATION',true,false,false,true),
('ai.agent.review','Review AI output','ai.review','ai','agent_runs','MUTATION',true,false,false,true),
('bi.metric.write','Write BI metric snapshot','bi.write','bi','metric_snapshots','MUTATION',true,false,false,true),
('integration.endpoint.manage','Manage integration endpoint','integration.manage','integration','endpoint_registry','MUTATION',true,true,false,true)
on conflict(code) do update set capability_code=excluded.capability_code,entity_schema=excluded.entity_schema,entity_table=excluded.entity_table,action_class=excluded.action_class,maker_required=excluded.maker_required,checker_required=excluded.checker_required,approver_required=excluded.approver_required,active=true;

insert into authz.sod_rules(action_code,rule_code,maker_must_differ_from_checker,maker_must_differ_from_approver,checker_must_differ_from_approver,min_approvers,active)
values
('procurement.request.update','SOD_PROCUREMENT_UPDATE',true,false,false,1,true),
('grc.control.update','SOD_GRC_CONTROL_UPDATE',true,false,false,1,true),
('regulatory.obligation.update','SOD_REGULATORY_UPDATE',true,false,false,1,true),
('integration.endpoint.manage','SOD_INTEGRATION_MANAGE',true,false,false,1,true)
on conflict(rule_code) do update set action_code=excluded.action_code,maker_must_differ_from_checker=excluded.maker_must_differ_from_checker,maker_must_differ_from_approver=excluded.maker_must_differ_from_approver,checker_must_differ_from_approver=excluded.checker_must_differ_from_approver,min_approvers=excluded.min_approvers,active=true;