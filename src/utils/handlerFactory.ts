import { Response } from 'express';
import {
  Model,
  ModelStatic,
  FindAttributeOptions,
  CreateOptions,
  Attributes,
  CreationAttributes,
  FindOptions,
  UpdateOptions,
  IncludeOptions,
} from 'sequelize';
import SearchAPI from './SearchAPI';
import AppError from './appError';
import catchAsync from './catchAsync';

type CreateOne = <
  M extends Model,
  O extends CamelToSnake<keyof Attributes<M> & string>
>(
  model: ModelStatic<M>,
  options?: Omit<Partial<CreateOptions<CreationAttributes<M>>>, 'returning'> & {
    returning?: O[] | boolean | ['*'];
  }
) => ReturnType<typeof catchAsync>;

export const createOne: CreateOne = (model, options = {}) =>
  catchAsync(async (req, res) => {
    const row = await model.create(req.body, options);

    res.status(201).json({ status: 'success', data: { data: row } });
  });

type GetOne = <T extends Model>(
  model: ModelStatic<T>,
  options?: FindOptions<Attributes<T>>
) => ReturnType<typeof catchAsync>;

export const getOne: GetOne = (model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const row = await model.findByPk(req.params.id, options);

    if (!row) return next(new AppError('No record with that ID exists.', 404));

    res.status(200).json({
      status: 'success',
      data: { data: row },
    });
  });

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types
// Credit: https://stackoverflow.com/a/64933956
type CamelToSnake<T extends string, P extends string = ''> = string extends T
  ? string
  : T extends `${infer C0}${infer R}`
  ? CamelToSnake<
      R,
      `${P}${C0 extends Lowercase<C0> ? '' : '_'}${Lowercase<C0>}`
    >
  : P;

type UpdateOne = <
  M extends Model,
  O extends CamelToSnake<keyof Attributes<M> & string>
>(
  model: ModelStatic<M>,
  options: Omit<Partial<UpdateOptions<CreationAttributes<M>>>, 'returning'> & {
    returning?: O[] | boolean | ['*'];
  }
) => ReturnType<typeof catchAsync>;

/**
 * Finds and updates a record using the model's PK field and `req.params.id`.
 * `req.includeUserId` can also be set to `true` to include the current user's id in the WHERE clause
 * - Note: `options.returning` is set to true by default.
 * - Note: `options.returning` auto suggestions assume `underscored: true` is set on the passed model
 * @param model A class that extends `Model` from sequelize
 * @param options `options.fields` is always required for limiting what fields can be updated.
 */
export const updateOne: UpdateOne = (model, options) =>
  catchAsync(async (req, res, next) => {
    options.returning ??= true;

    const updateOptions = {
      where: {
        ...{},
        [model.primaryKeyAttribute]: req.params.id,
        ...(req.includeUserId && {
          ['accountUid' as string]: req.user!.accountUid,
        }),
      },
      fields: options.fields,
      validate: options.validate ?? true,
    };

    let updated: number;
    let data: any;

    if (options.returning) {
      const [changed, rows] = await model.update(req.body, {
        ...updateOptions,
        returning: options.returning,
      });

      updated = changed;
      data = rows[0];
    } else {
      const [changed] = await model.update(req.body, updateOptions);

      updated = changed;
    }

    if (!updated) {
      return next(new AppError('No record with that ID exists.', 404));
    }

    res.status(200).json({ status: 'success', data: { data: data || null } });
  });

/**
 * Deletes a record where `Model.primaryKeyAttribute = req.params.id`.
 * Set `req.includeUserId` to `true` to limit deletions to records owned by the current logged in user
 * @param model A model that extends the base sequelize class
 * @returns
 */
export const deleteOne = <T extends Model>(model: ModelStatic<T>) =>
  catchAsync(async (req, res, next) => {
    const deleteCount = await model.destroy({
      where: {
        ...{},
        [model.primaryKeyAttribute]: req.params.id,
      },
      ...(req.includeUserId && { accountUid: req.user!.accountUid }),
    });

    if (!deleteCount)
      return next(new AppError('No record with that ID exists.', 404));

    res.status(204).json({ status: 'success', data: null });
  });

const executeQuery = async (
  res: Response,
  model: ModelStatic<any>,
  search: SearchAPI
) => {
  const { count, rows } = await model.findAndCountAll(search.options);

  res.status(200).json({
    status: 'success',
    results: count,
    data: { data: rows },
  });
};

export type InferDefaultOrderBy<M extends Model = any> = [
  keyof Attributes<M>,
  'ASC' | 'DESC'
][];
export type DefaultOrderBy = [string, 'ASC' | 'DESC'][];

const defaultFormatOptions = { raw: true, nest: false };
export type FormatOptions = typeof defaultFormatOptions;

type GetAll = <M extends Model, O extends InferDefaultOrderBy<M>>(
  model: ModelStatic<M>,
  defaultOrderBy: O & DefaultOrderBy,
  defaultFields?: FindAttributeOptions,
  formatOptions?: FormatOptions
) => ReturnType<typeof catchAsync>;

export const getAll: GetAll = (
  model,
  defaultOrderBy,
  defaultFields,
  formatOptions = { raw: true, nest: false }
) =>
  catchAsync(async (req, res) => {
    const search = new SearchAPI(req.query)
      .filterBy()
      .orderBy(defaultOrderBy)
      .includeFields(defaultFields)
      .paginate()
      .format(formatOptions);

    await executeQuery(res, model, search);
  });

type GetAllAndJoin = <M extends Model, O extends InferDefaultOrderBy<M>>(
  model: ModelStatic<any>,
  defaultOrderBy: O & DefaultOrderBy,
  joinOptions: IncludeOptions,
  defaultFields?: FindAttributeOptions,
  formatOptions?: FormatOptions
) => ReturnType<typeof catchAsync>;

export const getAllAndJoin: GetAllAndJoin = (
  Model,
  defaultOrderBy,
  joinOptions,
  defaultFields,
  formatOptions = { raw: true, nest: false }
) =>
  catchAsync(async (req, res) => {
    const search = new SearchAPI(req.query)
      .filterBy()
      .orderBy(defaultOrderBy)
      .includeFields(defaultFields)
      .paginate()
      .format(formatOptions);

    if (req.user) search.joinOnUserId(req.user, joinOptions);

    await executeQuery(res, Model, search);
  });
