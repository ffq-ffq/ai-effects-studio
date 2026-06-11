-- AI Effects Studio database schema for Supabase.
-- This file targets a fresh Supabase project and is safe to re-run for
-- indexes, policies, and triggers.

create extension if not exists "uuid-ossp";

-- 用户表（扩展 auth.users）
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  plan_type text default 'free' check (plan_type in ('free', 'lite', 'standard', 'pro', 'admin')),
  credits_remaining integer default 10,
  total_credits_purchased integer default 0,
  total_generations integer default 0,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 项目表
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  name text not null,
  original_image_url text,
  original_video_url text,
  industry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 模板表
create table if not exists public.templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_en text,
  description text,
  description_en text,
  category text not null check (category in ('style_transfer', 'photo_style', 'portrait', 'creative', 'utility', 'video', 'virtual_tryon', 'lip_sync')),
  industry text,
  preview_url text,
  before_url text,
  after_url text,
  workflow_json jsonb,
  is_premium boolean default false,
  credits_cost integer default 1,
  is_video boolean default false,
  video_duration integer,
  downloads_count integer default 0,
  sort_order integer default 0,
  is_active boolean default true,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 生成记录表
create table if not exists public.generations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id),
  user_id uuid references public.profiles(id) not null,
  template_id uuid references public.templates(id),
  input_image_url text,
  input_video_url text,
  input_text text,
  output_image_url text,
  output_video_url text,
  output_copywriting jsonb,
  status text default 'pending' check (status in ('pending', 'queued', 'generating', 'post_processing', 'completed', 'failed')),
  progress integer default 0,
  credits_cost integer default 1,
  prompt text,
  seed bigint,
  error_message text,
  is_public boolean default false,
  platform_exports jsonb,
  retry_count integer default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 额度包表
create table if not exists public.credit_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  credits integer not null,
  price_cents integer not null,
  stripe_price_id text,
  is_active boolean default true,
  sort_order integer default 0
);

-- 套餐表
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_cents integer not null,
  original_price_cents integer,
  credits integer not null,
  template_count integer,
  industry_count integer,
  features jsonb,
  stripe_price_id text,
  stripe_price_id_subscription text,
  is_active boolean default true,
  sort_order integer default 0
);

-- 订单表
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  product_type text not null check (product_type in ('plan', 'credit_pack')),
  product_id uuid,
  amount_cents integer not null,
  currency text default 'cny',
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text,
  created_at timestamptz default now()
);

-- Credits 交易记录
create table if not exists public.credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'generation', 'refund', 'bonus', 'refund_generation')),
  description text,
  order_id uuid references public.orders(id),
  generation_id uuid references public.generations(id),
  created_at timestamptz default now()
);

-- 用户收藏表
create table if not exists public.user_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  template_id uuid references public.templates(id),
  generation_id uuid references public.generations(id),
  created_at timestamptz default now(),
  unique(user_id, template_id, generation_id),
  check (template_id is not null or generation_id is not null)
);

-- 分享链接表
create table if not exists public.share_links (
  id uuid primary key default uuid_generate_v4(),
  generation_id uuid references public.generations(id) not null,
  slug text unique not null,
  expires_at timestamptz,
  view_count integer default 0,
  created_at timestamptz default now()
);

-- 品牌资产表
create table if not exists public.brand_assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  logo_url text,
  brand_colors jsonb,
  brand_font text,
  brand_name text,
  created_at timestamptz default now()
);

-- 索引
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_generations_user_id on public.generations(user_id);
create index if not exists idx_generations_template_id on public.generations(template_id);
create index if not exists idx_generations_status on public.generations(status);
create index if not exists idx_templates_category on public.templates(category);
create index if not exists idx_templates_industry on public.templates(industry);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_credit_transactions_user_id on public.credit_transactions(user_id);

-- 自动维护 updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists set_templates_updated_at on public.templates;
create trigger set_templates_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

-- 自动创建 profile 触发器
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits_remaining)
  values (new.id, new.email, 10)
  on conflict (id) do nothing;

  insert into public.credit_transactions (user_id, amount, type, description)
  values (new.id, 10, 'bonus', '注册赠送');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS 策略（全部业务表启用）
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.templates enable row level security;
alter table public.generations enable row level security;
alter table public.credit_packages enable row level security;
alter table public.plans enable row level security;
alter table public.orders enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.user_favorites enable row level security;
alter table public.share_links enable row level security;
alter table public.brand_assets enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can CRUD own projects" on public.projects;
create policy "Users can CRUD own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own generations" on public.generations;
create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read public generations" on public.generations;
create policy "Users can read public generations"
  on public.generations for select
  using (is_public = true);

drop policy if exists "Templates are public readable" on public.templates;
create policy "Templates are public readable"
  on public.templates for select
  using (is_active = true);

drop policy if exists "Credit packages are public readable" on public.credit_packages;
create policy "Credit packages are public readable"
  on public.credit_packages for select
  using (is_active = true);

drop policy if exists "Plans are public readable" on public.plans;
create policy "Plans are public readable"
  on public.plans for select
  using (is_active = true);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own transactions" on public.credit_transactions;
create policy "Users can read own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own favorites" on public.user_favorites;
create policy "Users can CRUD own favorites"
  on public.user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Share links are public readable" on public.share_links;
create policy "Share links are public readable"
  on public.share_links for select
  using (expires_at is null or expires_at > now());

drop policy if exists "Users can CRUD own brand assets" on public.brand_assets;
create policy "Users can CRUD own brand assets"
  on public.brand_assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Step 8 generation pipeline support.
alter table public.generations
  add column if not exists template_slug text;

create index if not exists idx_generations_template_slug
  on public.generations(template_slug);

create or replace function public.reserve_generation_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text default null
)
returns table (
  credits_remaining integer,
  total_credits_purchased integer,
  total_generations integer
) as $$
begin
  if p_amount <= 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  return query
  update public.profiles
  set
    credits_remaining = profiles.credits_remaining - p_amount,
    total_generations = profiles.total_generations + 1,
    updated_at = now()
  where profiles.id = p_user_id
    and profiles.credits_remaining >= p_amount
  returning
    profiles.credits_remaining,
    profiles.total_credits_purchased,
    profiles.total_generations;

  if not found then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    description
  )
  values (
    p_user_id,
    -p_amount,
    'generation',
    coalesce(p_description, 'Generation credit reservation')
  );
end;
$$ language plpgsql security definer;

create or replace function public.refund_generation_credits(
  p_user_id uuid,
  p_amount integer,
  p_generation_id uuid default null,
  p_description text default null
)
returns void as $$
begin
  if p_amount <= 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  if p_generation_id is not null and exists (
    select 1
    from public.credit_transactions
    where user_id = p_user_id
      and generation_id = p_generation_id
      and type = 'refund_generation'
  ) then
    return;
  end if;

  update public.profiles
  set
    credits_remaining = profiles.credits_remaining + p_amount,
    updated_at = now()
  where profiles.id = p_user_id;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    generation_id
  )
  values (
    p_user_id,
    p_amount,
    'refund_generation',
    coalesce(p_description, 'Generation failed refund'),
    p_generation_id
  );
end;
$$ language plpgsql security definer;

create or replace function public.apply_paid_checkout_order(
  p_order_id uuid,
  p_user_id uuid,
  p_stripe_session_id text,
  p_stripe_customer_id text,
  p_plan_type text default null,
  p_credits integer default 0,
  p_description text default null
)
returns void as $$
declare
  v_status text;
begin
  if p_credits <= 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select status
    into v_status
  from public.orders
  where id = p_order_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_status = 'paid' then
    return;
  end if;

  update public.orders
  set
    status = 'paid',
    stripe_session_id = coalesce(p_stripe_session_id, stripe_session_id)
  where id = p_order_id;

  update public.profiles
  set
    plan_type = case
      when p_plan_type in ('lite', 'standard', 'pro') then p_plan_type
      else profiles.plan_type
    end,
    credits_remaining = profiles.credits_remaining + p_credits,
    total_credits_purchased = profiles.total_credits_purchased + p_credits,
    stripe_customer_id = coalesce(p_stripe_customer_id, profiles.stripe_customer_id),
    updated_at = now()
  where id = p_user_id;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    order_id
  )
  values (
    p_user_id,
    p_credits,
    'purchase',
    coalesce(p_description, 'Stripe checkout purchase'),
    p_order_id
  );
end;
$$ language plpgsql security definer;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'generations'
  ) then
    alter publication supabase_realtime add table public.generations;
  end if;
end $$;
