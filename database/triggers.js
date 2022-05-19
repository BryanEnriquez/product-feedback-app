// prettier-ignore
const onUpvoteInsertFn = '' +
  'CREATE OR REPLACE FUNCTION inc_request_counter() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'UPDATE product_request SET upvotes = upvotes + 1 ' +
      'WHERE NEW.product_request_id = product_request_id; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropUpvoteInsertTrigger =
  'DROP TRIGGER IF EXISTS upvote_insert_trigger ON upvote;';

// prettier-ignore
const createUpvoteInsertTrigger = '' +
  'CREATE TRIGGER upvote_insert_trigger ' +
    'AFTER INSERT ON upvote ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE inc_request_counter();'

// prettier-ignore
const onUpvoteDeleteFn = '' +
  'CREATE OR REPLACE FUNCTION dec_request_counter() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'UPDATE product_request SET upvotes = upvotes - 1 ' +
      'WHERE OLD.product_request_id = product_request_id; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropUpvoteDeleteTrigger =
  'DROP TRIGGER IF EXISTS upvote_delete_trigger ON upvote;';

// prettier-ignore
const createUpvoteDeleteTrigger = '' +
  'CREATE TRIGGER upvote_delete_trigger ' +
    'AFTER DELETE ON upvote ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE dec_request_counter();'

// Update upvotes counter on a product_request when inserting/deleting an upvote
exports.createUpvoteTriggers = async function (sequelize) {
  await sequelize.query(onUpvoteInsertFn);
  await sequelize.query(dropUpvoteInsertTrigger);
  await sequelize.query(createUpvoteInsertTrigger);

  await sequelize.query(onUpvoteDeleteFn);
  await sequelize.query(dropUpvoteDeleteTrigger);
  await sequelize.query(createUpvoteDeleteTrigger);
};

// prettier-ignore
const onProductRequestInsertFn = '' +
  'CREATE OR REPLACE FUNCTION add_to_product_counters() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'CASE new.status ' +
      "WHEN 'suggestion' THEN " +
        'UPDATE product SET suggestions = suggestions + 1 WHERE new.product_id = product_id; ' +
      "WHEN 'planned' THEN " +
        'UPDATE product SET planned = planned + 1 WHERE new.product_id = product_id; ' +
      "WHEN 'in-progress' THEN " +
        'UPDATE product SET in_progress = in_progress + 1 WHERE new.product_id = product_id; ' +
      'ELSE ' +
        'UPDATE product SET live = live + 1 WHERE new.product_id = product_id; ' +
    'END CASE; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropProductRequestInsertTrigger =
  'DROP TRIGGER IF EXISTS product_request_insert_trigger ON product_request;';

// prettier-ignore
const createProductRequestInsertTrigger = '' +
  'CREATE TRIGGER product_request_insert_trigger ' +
    'AFTER INSERT ON product_request ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE add_to_product_counters();'

// prettier-ignore
const onProductRequestDeleteFn = '' +
  'CREATE OR REPLACE FUNCTION remove_from_product_counters() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'CASE old.status ' +
      "WHEN 'suggestion' THEN " +
        'UPDATE product SET suggestions = suggestions - 1 WHERE old.product_id = product_id; ' +
      "WHEN 'planned' THEN " +
        'UPDATE product SET planned = planned - 1 WHERE old.product_id = product_id; ' +
      "WHEN 'in-progress' THEN " +
        'UPDATE product SET in_progress = in_progress - 1 WHERE old.product_id = product_id; ' +
      'ELSE ' +
        'UPDATE product SET live = live - 1 WHERE old.product_id = product_id; ' +
    'END CASE; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropProductRequestDeleteTrigger =
  'DROP TRIGGER IF EXISTS product_request_delete_trigger ON product_request;';

// prettier-ignore
const createProductRequestDeleteTrigger = '' +
  'CREATE TRIGGER product_request_delete_trigger ' +
    'AFTER DELETE ON product_request ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE remove_from_product_counters();'

// prettier-ignore
const onProductRequestUpdateFn = '' +
  'CREATE OR REPLACE FUNCTION update_product_counters() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'CASE old.status ' +
      "WHEN 'suggestion' THEN " +
        'UPDATE product SET suggestions = suggestions - 1 WHERE old.product_id = product_id; ' +
      "WHEN 'planned' THEN " +
        'UPDATE product SET planned = planned - 1 WHERE old.product_id = product_id; ' +
      "WHEN 'in-progress' THEN " +
        'UPDATE product SET in_progress = in_progress - 1 WHERE old.product_id = product_id; ' +
      'ELSE ' +
        'UPDATE product SET live = live - 1 WHERE old.product_id = product_id; ' +
    'END CASE; ' +
    'CASE new.status ' +
      "WHEN 'suggestion' THEN " +
        'UPDATE product SET suggestions = suggestions + 1 WHERE old.product_id = product_id; ' +
      "WHEN 'planned' THEN " +
        'UPDATE product SET planned = planned + 1 WHERE old.product_id = product_id; ' +
      "WHEN 'in-progress' THEN " +
        'UPDATE product SET in_progress = in_progress + 1 WHERE old.product_id = product_id; ' +
      'ELSE ' +
        'UPDATE product SET live = live + 1 WHERE old.product_id = product_id; ' +
    'END CASE; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropProductRequestUpdateTrigger =
  'DROP TRIGGER IF EXISTS product_request_update_trigger ON product_request;';

// prettier-ignore
const createProductRequestUpdateTrigger = '' +
  'CREATE TRIGGER product_request_update_trigger ' +
    'AFTER UPDATE OF status ON product_request ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE update_product_counters();'

exports.createProductRequestTriggers = async function (sequelize) {
  await sequelize.query(onProductRequestInsertFn); // OK
  await sequelize.query(dropProductRequestInsertTrigger);
  await sequelize.query(createProductRequestInsertTrigger);

  await sequelize.query(onProductRequestDeleteFn); // OK
  await sequelize.query(dropProductRequestDeleteTrigger);
  await sequelize.query(createProductRequestDeleteTrigger);

  await sequelize.query(onProductRequestUpdateFn); // OK
  await sequelize.query(dropProductRequestUpdateTrigger);
  await sequelize.query(createProductRequestUpdateTrigger);
};

// prettier-ignore
const onCommentInsertFn = '' +
  'CREATE OR REPLACE FUNCTION inc_request_comments_counter() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'DECLARE ' +
    'author_copy VARCHAR(20); ' +
    'parent_id_copy INTEGER; ' +
  'BEGIN ' +
    'IF new.parent_id IS NOT NULL THEN ' +
      'author_copy := (SELECT author[1] FROM comment WHERE new.parent_id = comment_id AND ' +
        'new.product_request_id = product_request_id AND deleted = false' +
      '); ' +
      'IF author_copy IS NULL THEN ' +
        "RAISE EXCEPTION 'Product request IDs do not match.'; " +
      'END IF; ' +
      'new.reply_to := author_copy; ' +
      'parent_id_copy := (SELECT parent_id FROM comment WHERE new.parent_id = comment_id AND depth = 1); ' +
      'IF parent_id_copy IS NOT NULL THEN ' +
        'new.parent_id := parent_id_copy; ' +
      "END IF; " +
    'END IF; ' +
    'UPDATE product_request SET comments = comments + 1 ' +
      'WHERE new.product_request_id = product_request_id; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropCommentInsertTrigger =
  'DROP TRIGGER IF EXISTS comment_insert_trigger ON comment;';

// prettier-ignore
const createCommentInsertTrigger = '' +
  'CREATE TRIGGER comment_insert_trigger ' +
    'BEFORE INSERT ON comment ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE inc_request_comments_counter();'

// prettier-ignore
const onCommentUpdateFn = '' +
  'CREATE OR REPLACE FUNCTION wipe_comment_data() ' +
    'RETURNS TRIGGER ' +
    'LANGUAGE PLPGSQL ' +
  'AS $$ ' +
  'BEGIN ' +
    'IF new.account_uid IS NULL THEN ' +
      'UPDATE comment SET ' +
        "content = '[DELETED]', " +
        "author = ARRAY['[DELETED]', ''], " +
        "reply_to = NULL, " +
        "deleted = true " +
      'WHERE old.comment_id = comment_id; ' +
    'END IF; ' +
    'RETURN NEW; ' +
  'END; ' +
  '$$';

const dropCommentUpdateTrigger =
  'DROP TRIGGER IF EXISTS comment_update_trigger ON comment;';

// prettier-ignore
const createCommentUpdateTrigger = '' +
  'CREATE TRIGGER comment_update_trigger ' +
    'AFTER UPDATE OF account_uid ON comment ' +
    'FOR EACH ROW ' +
    'EXECUTE PROCEDURE wipe_comment_data();';

exports.createCommentTriggers = async function (sequelize) {
  await sequelize.query(onCommentInsertFn);
  await sequelize.query(dropCommentInsertTrigger);
  await sequelize.query(createCommentInsertTrigger);

  await sequelize.query(onCommentUpdateFn);
  await sequelize.query(dropCommentUpdateTrigger);
  await sequelize.query(createCommentUpdateTrigger);
};
