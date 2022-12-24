import { Sequelize } from 'sequelize';

async function runQueries(sequelize: Sequelize, ...queries: string[]) {
  for (let i = 0; i < queries.length; i++) {
    await sequelize.query(queries[i].trim().replaceAll(/\s+/g, ' '));
  }
}

// NEW.product_request_id = foreign key value of newly inserted upvote
const onUpvoteInsertFn = `
  CREATE OR REPLACE FUNCTION inc_request_counter()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    UPDATE product_request SET upvotes = upvotes + 1
      WHERE NEW.product_request_id = product_request_id;
    RETURN NEW;
  END;
  $$`;

const dropUpvoteInsertTrigger =
  'DROP TRIGGER IF EXISTS upvote_insert_trigger ON upvote;';

const createUpvoteInsertTrigger = `
  CREATE TRIGGER upvote_insert_trigger
    AFTER INSERT ON upvote
    FOR EACH ROW
    EXECUTE PROCEDURE inc_request_counter();`;

const onUpvoteDeleteFn = `
  CREATE OR REPLACE FUNCTION dec_request_counter()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    UPDATE product_request SET upvotes = upvotes - 1
      WHERE OLD.product_request_id = product_request_id;
    RETURN NEW;
  END;
  $$`;

const dropUpvoteDeleteTrigger =
  'DROP TRIGGER IF EXISTS upvote_delete_trigger ON upvote;';

const createUpvoteDeleteTrigger = `
  CREATE TRIGGER upvote_delete_trigger
    AFTER DELETE ON upvote
    FOR EACH ROW
    EXECUTE PROCEDURE dec_request_counter();`;

// Update upvotes counter on a product_request when inserting/deleting an upvote
export const createUpvoteTriggers = async function (sequelize: Sequelize) {
  await runQueries(
    sequelize,
    onUpvoteInsertFn,
    dropUpvoteInsertTrigger,
    createUpvoteInsertTrigger,
    onUpvoteDeleteFn,
    dropUpvoteDeleteTrigger,
    createUpvoteDeleteTrigger
  );
};

// Increments the suggestions/planned/in_progress/live column of the product being referenced
// by the newly inserted product_request
const onProductRequestInsertFn = `
  CREATE OR REPLACE FUNCTION add_to_product_counters()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    CASE new.status
      WHEN 'suggestion' THEN
        UPDATE product SET suggestions = suggestions + 1 WHERE new.product_id = product_id;
      WHEN 'planned' THEN
        UPDATE product SET planned = planned + 1 WHERE new.product_id = product_id;
      WHEN 'in-progress' THEN
        UPDATE product SET in_progress = in_progress + 1 WHERE new.product_id = product_id;
      ELSE
        UPDATE product SET live = live + 1 WHERE new.product_id = product_id;
    END CASE;
    RETURN NEW;
  END;
  $$`;

const dropProductRequestInsertTrigger =
  'DROP TRIGGER IF EXISTS product_request_insert_trigger ON product_request;';

const createProductRequestInsertTrigger = `
  CREATE TRIGGER product_request_insert_trigger
    AFTER INSERT ON product_request
    FOR EACH ROW
    EXECUTE PROCEDURE add_to_product_counters();`;

// Same logic as above but now decrements when a product_request is deleted.
const onProductRequestDeleteFn = `
  CREATE OR REPLACE FUNCTION remove_from_product_counters()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    CASE old.status
      WHEN 'suggestion' THEN
        UPDATE product SET suggestions = suggestions - 1 WHERE old.product_id = product_id;
      WHEN 'planned' THEN
        UPDATE product SET planned = planned - 1 WHERE old.product_id = product_id;
      WHEN 'in-progress' THEN
        UPDATE product SET in_progress = in_progress - 1 WHERE old.product_id = product_id;
      ELSE
        UPDATE product SET live = live - 1 WHERE old.product_id = product_id;
    END CASE;
    RETURN NEW;
  END;
  $$`;

const dropProductRequestDeleteTrigger =
  'DROP TRIGGER IF EXISTS product_request_delete_trigger ON product_request;';

const createProductRequestDeleteTrigger = `
  CREATE TRIGGER product_request_delete_trigger
    AFTER DELETE ON product_request
    FOR EACH ROW
    EXECUTE PROCEDURE remove_from_product_counters();`;

// Updates the appropriate columns on a product when a product_request changes `status`
const onProductRequestUpdateFn = `
  CREATE OR REPLACE FUNCTION update_product_counters()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    CASE old.status
      WHEN 'suggestion' THEN
        UPDATE product SET suggestions = suggestions - 1 WHERE old.product_id = product_id;
      WHEN 'planned' THEN
        UPDATE product SET planned = planned - 1 WHERE old.product_id = product_id;
      WHEN 'in-progress' THEN
        UPDATE product SET in_progress = in_progress - 1 WHERE old.product_id = product_id;
      ELSE
        UPDATE product SET live = live - 1 WHERE old.product_id = product_id;
    END CASE;
    CASE new.status
      WHEN 'suggestion' THEN
        UPDATE product SET suggestions = suggestions + 1 WHERE old.product_id = product_id;
      WHEN 'planned' THEN
        UPDATE product SET planned = planned + 1 WHERE old.product_id = product_id;
      WHEN 'in-progress' THEN
        UPDATE product SET in_progress = in_progress + 1 WHERE old.product_id = product_id;
      ELSE
        UPDATE product SET live = live + 1 WHERE old.product_id = product_id;
    END CASE;
    RETURN NEW;
  END;
  $$`;

const dropProductRequestUpdateTrigger =
  'DROP TRIGGER IF EXISTS product_request_update_trigger ON product_request;';

const createProductRequestUpdateTrigger = `
  CREATE TRIGGER product_request_update_trigger
    AFTER UPDATE OF status ON product_request
    FOR EACH ROW
    EXECUTE PROCEDURE update_product_counters();`;

export const createProductRequestTriggers = async function (
  sequelize: Sequelize
) {
  await runQueries(
    sequelize,
    onProductRequestInsertFn,
    dropProductRequestInsertTrigger,
    createProductRequestInsertTrigger,
    onProductRequestDeleteFn,
    dropProductRequestDeleteTrigger,
    createProductRequestDeleteTrigger,
    onProductRequestUpdateFn,
    dropProductRequestUpdateTrigger,
    createProductRequestUpdateTrigger
  );
};

// Points 1 & 2 only apply to "replies"
// 1) A reply to a comment copies the `author` over to the `reply_to` field of the new comment
// - If validation fails (comment_id doesn't exist, parent is marked deleted) then an error is returned
// 2) `new.parent_id` starts with an inital value that may change
// - This id belongs to a comment of depth 0 or 1 ("reply"). API sets a depth of 1 if parent_id is passed, otherwise 0
// - The `SELECT parent_id ... depth = 1` query is done to extract the `parent_id` of a comment that may be a reply itself
// - If not NULL then the id is copied over to the new comment's `parent_id` field
//  - The result is a chain of replies that all point to the same parent comment of depth 0
// - If NULL then `new.parent_id` was already pointing to a comment of depth 0
// 3) Any new comments or replies increments the `comments` counter of the appropriate product_request
const onCommentInsertFn = `
  CREATE OR REPLACE FUNCTION inc_request_comments_counter()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  DECLARE
    parent_author_copy VARCHAR(20);
    parent_id_copy INTEGER;
  BEGIN
    IF new.parent_id IS NOT NULL THEN
      parent_author_copy := (SELECT author[1] FROM comment WHERE new.parent_id = comment_id AND
        new.product_request_id = product_request_id AND deleted = false);
      IF parent_author_copy IS NULL THEN
        RAISE EXCEPTION 'Product request IDs do not match.';
      END IF;
      new.reply_to := parent_author_copy;
      parent_id_copy := (SELECT parent_id FROM comment WHERE new.parent_id = comment_id AND depth = 1);
      IF parent_id_copy IS NOT NULL THEN
        new.parent_id := parent_id_copy;
      END IF;
    END IF;
    UPDATE product_request SET comments = comments + 1 WHERE new.product_request_id = product_request_id;
    RETURN NEW;
  END;
  $$`;

const dropCommentInsertTrigger =
  'DROP TRIGGER IF EXISTS comment_insert_trigger ON comment;';

const createCommentInsertTrigger = `
  CREATE TRIGGER comment_insert_trigger
    BEFORE INSERT ON comment
    FOR EACH ROW
    EXECUTE PROCEDURE inc_request_comments_counter();`;

// Wipes comment data when account_uid no longer references an account. List of changes:
// content: Set to a string value of `[DELETED]`
// author: Sets username value to `[DELETED]` and the author's name to an empty string
// reply_to: Field used in the FE to indicate who the author originally replied to (ex: @usernameOfSomeOtherUser)
// - Set to null in case the parent comment (if there is one) is also "deleted" in the future.
// - It would be  a bit odd to keep this field if the parent comment has `author` set to `[DELETED]`
// deleted: Set to true so users can't reply to the "deleted" comment
const onCommentUpdateFn = `
  CREATE OR REPLACE FUNCTION wipe_comment_data()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
  AS $$
  BEGIN
    IF new.account_uid IS NULL THEN
      UPDATE comment SET
        content = '[DELETED]',
        author = ARRAY['[DELETED]', ''],
        reply_to = NULL,
        deleted = true
      WHERE old.comment_id = comment_id;
    END IF;
    RETURN NEW;
  END;
  $$`;

const dropCommentUpdateTrigger =
  'DROP TRIGGER IF EXISTS comment_update_trigger ON comment;';

const createCommentUpdateTrigger = `
  CREATE TRIGGER comment_update_trigger
    AFTER UPDATE OF account_uid ON comment
    FOR EACH ROW
    EXECUTE PROCEDURE wipe_comment_data();`;

export const createCommentTriggers = async function (sequelize: Sequelize) {
  await runQueries(
    sequelize,
    onCommentInsertFn,
    dropCommentInsertTrigger,
    createCommentInsertTrigger,
    onCommentUpdateFn,
    dropCommentUpdateTrigger,
    createCommentUpdateTrigger
  );
};
