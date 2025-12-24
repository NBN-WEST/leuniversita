
-- DB Consistency Check V2
-- Expecting IDs to be TEXT as per Phase 4.4 requirements.

do $$
declare
  v_type text;
  v_errs text := '';
  rec record;
begin
  raise notice 'Starting DB Consistency Check V2...';

  -- 1. Check modules.id type
  select data_type into v_type 
  from information_schema.columns 
  where table_schema = 'public' and table_name = 'modules' and column_name = 'id';
  
  if v_type != 'text' then
    v_errs := v_errs || format('FAIL: modules.id is %s, expected text. ', v_type);
  else
    raise notice 'OK: modules.id is text';
  end if;

  -- 2. Check learning_objectives.module_id
  select data_type into v_type 
  from information_schema.columns 
  where table_schema = 'public' and table_name = 'learning_objectives' and column_name = 'module_id';
  
  if v_type != 'text' then
    v_errs := v_errs || format('FAIL: learning_objectives.module_id is %s, expected text. ', v_type);
  else
    raise notice 'OK: learning_objectives.module_id is text';
  end if;

  -- 3. Check learning_progress_v2.module_id
  select data_type into v_type 
  from information_schema.columns 
  where table_schema = 'public' and table_name = 'learning_progress_v2' and column_name = 'module_id';

  if v_type != 'text' then
    v_errs := v_errs || format('FAIL: learning_progress_v2.module_id is %s, expected text. ', v_type);
  else
    raise notice 'OK: learning_progress_v2.module_id is text';
  end if;

  -- 4. Check learning_attempts_v2 exists
  if not exists (select 1 from information_schema.tables where table_name = 'learning_attempts_v2') then
    v_errs := v_errs || 'FAIL: learning_attempts_v2 table missing. ';
  else
    raise notice 'OK: learning_attempts_v2 exists';
  end if;

  -- Report
  if length(v_errs) > 0 then
    raise exception 'DB CONSISTENCY FAIL: %', v_errs;
  else
    raise notice 'DB CONSISTENCY = OK';
  end if;

end $$;
