-- Rename waitlist.would_pay -> waitlist.usage_intent
--
-- The landing page asked "would you pay for this?" while the product has no
-- paid tier and no priced feature. Asking people to price something that does
-- not exist produces an answer that cannot be acted on, and it implies a
-- commercial offer we are not making.
--
-- The question is now "would you use this every week?", which measures habit.
-- Habit is the thing that has to be true before any price can be set, and it
-- is answerable honestly by someone who has only seen a landing page.
--
-- Safe: a rename preserves existing rows and the check constraint follows the
-- column. The allowed values ('yes','maybe','no') are unchanged.

alter table public.waitlist
  rename column would_pay to usage_intent;

alter table public.waitlist
  rename constraint waitlist_would_pay_check to waitlist_usage_intent_check;
