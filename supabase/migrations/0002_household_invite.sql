-- NOOK — rejoindre un foyer existant via un code d'invitation.
-- household_members n'a volontairement aucune policy INSERT/DELETE cote
-- client (seul le trigger handle_new_user peut y ecrire) : cette fonction
-- SECURITY DEFINER est le seul point d'entree controle pour changer de
-- foyer.

create or replace function join_household(invite_code uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  old_household_id uuid;
  target_exists boolean;
begin
  select exists(select 1 from households where id = invite_code) into target_exists;
  if not target_exists then
    raise exception 'Code de foyer invalide';
  end if;

  select household_id into old_household_id
    from household_members
    where user_id = auth.uid()
    limit 1;

  insert into household_members (household_id, user_id, role)
    values (invite_code, auth.uid(), 'member')
    on conflict (household_id, user_id) do nothing;

  if old_household_id is not null and old_household_id <> invite_code then
    delete from household_members
      where household_id = old_household_id and user_id = auth.uid();

    -- Nettoie l'ancien foyer solo uniquement s'il est completement vide
    -- (personne d'autre dedans, aucune donnee importee) pour ne jamais
    -- perdre de donnees reelles en changeant de foyer.
    if not exists (select 1 from household_members where household_id = old_household_id)
       and not exists (select 1 from products where household_id = old_household_id)
       and not exists (select 1 from tickets where household_id = old_household_id)
    then
      delete from households where id = old_household_id;
    end if;
  end if;

  return invite_code;
end;
$$;

grant execute on function join_household(uuid) to authenticated;
