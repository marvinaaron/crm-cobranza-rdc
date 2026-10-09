-- Volumen opcional de Cotizar (facturación / CFDI) en prospectos.
-- NULL = no lo indicaron. No se usa en WhatsApp; solo en la bandeja admin.

alter table public.site_leads
  add column if not exists ingresos_mensuales integer,
  add column if not exists ingresos_mas_300 boolean not null default false,
  add column if not exists cfdi_mensuales integer,
  add column if not exists cfdi_mas_50 boolean not null default false;

alter table public.site_leads
  drop constraint if exists site_leads_ingresos_mensuales_check;
alter table public.site_leads
  add constraint site_leads_ingresos_mensuales_check
  check (
    ingresos_mensuales is null
    or (ingresos_mensuales >= 0 and ingresos_mensuales <= 300000)
  );

alter table public.site_leads
  drop constraint if exists site_leads_cfdi_mensuales_check;
alter table public.site_leads
  add constraint site_leads_cfdi_mensuales_check
  check (
    cfdi_mensuales is null
    or (cfdi_mensuales >= 1 and cfdi_mensuales <= 50)
  );

comment on column public.site_leads.ingresos_mensuales is
  'Facturación mensual aprox. (MXN). NULL = no la indicó en Cotizar.';
comment on column public.site_leads.ingresos_mas_300 is
  'True si marcó +$300,000 / mes en Cotizar.';
comment on column public.site_leads.cfdi_mensuales is
  'CFDI mensuales aprox. NULL = no los indicó en Cotizar.';
comment on column public.site_leads.cfdi_mas_50 is
  'True si marcó +50 CFDI / mes en Cotizar.';

-- Prospectos viejos: rescatar el dato si ya venía pegado en el mensaje.
update public.site_leads
set
  ingresos_mas_300 = true,
  ingresos_mensuales = 300000
where not ingresos_mas_300
  and ingresos_mensuales is null
  and mensaje ~ 'Ingresos aprox\.: \+\$300,000';

update public.site_leads
set ingresos_mensuales = replace(
  substring(mensaje from 'Ingresos aprox\.: \$([0-9,]+)'),
  ',',
  ''
)::integer
where ingresos_mensuales is null
  and not ingresos_mas_300
  and mensaje ~ 'Ingresos aprox\.: \$[0-9,]+\s*/'
  and mensaje !~ 'Ingresos aprox\.: \+\$';

update public.site_leads
set
  cfdi_mas_50 = true,
  cfdi_mensuales = 50
where not cfdi_mas_50
  and cfdi_mensuales is null
  and mensaje ~ '\+50 CFDI';

update public.site_leads
set cfdi_mensuales = substring(mensaje from 'Volumen CFDI: ([0-9]+)')::integer
where cfdi_mensuales is null
  and not cfdi_mas_50
  and mensaje ~ 'Volumen CFDI: [0-9]+ CFDI'
  and mensaje !~ 'Volumen CFDI: \+50';
