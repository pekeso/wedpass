-- Partial unique index: only one accepted (non-duplicate) check-in per guest
CREATE UNIQUE INDEX check_ins_guest_unique_accepted
ON check_ins ("guestId")
WHERE "isDuplicate" = false;
