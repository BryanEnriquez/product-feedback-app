const SearchAPI = require('./SearchAPI');
const AppError = require('./appError');
const catchAsync = require('./catchAsync');

// CREATE
exports.createOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const row = await Model.create(req.body, options);

    res.status(201).json({ status: 'success', data: { data: row } });
  });

// READ
exports.getOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const row = await Model.findByPk(req.params.id, options);

    if (!row) return next(new AppError('No record with that ID exists.', 404));

    res.status(200).json({
      status: 'success',
      data: { data: row },
    });
  });

// UPDATE
exports.updateOne = (Model, mutableFields, returning = true) =>
  catchAsync(async (req, res, next) => {
    const [changed, rows] = await Model.update(req.body, {
      where: {
        [Model.primaryKeyAttribute]: req.params.id,
        ...(req.includeUserId && { accountUid: req.user.accountUid }),
      },
      fields: mutableFields,
      returning, // true: Return all modified, ['field1', ...] return only some columns
      // validate: true, // default
    });

    if (!changed)
      return next(new AppError('No record with that ID exists.', 404));

    res.status(200).json({ status: 'success', data: { data: rows[0] } });
  });

// DELETE
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deleteCount = await Model.destroy({
      where: {
        [Model.primaryKeyAttribute]: req.params.id,
      },
      ...(req.includeUserId && { accountUid: req.user.accountUid }),
    });

    if (!deleteCount)
      return next(new AppError('No record with that ID exists.', 404));

    res.status(204).json({ status: 'success', data: null });
  });

const executeQuery = async (res, Model, search) => {
  const { count, rows } = await Model.findAndCountAll(search.options);

  res.status(200).json({
    status: 'success',
    results: count,
    data: { data: rows },
  });
};

exports.getAll = (
  Model,
  defaultOrderBy,
  defaultFields,
  formatOptions = { raw: true, nest: false }
) =>
  catchAsync(async (req, res, next) => {
    const search = new SearchAPI(req.query)
      .filterBy()
      .order(defaultOrderBy)
      .includeFields(defaultFields)
      .paginate()
      .format(formatOptions);

    await executeQuery(res, Model, search);
  });

exports.getAllAndJoin = (
  Model,
  defaultOrderBy,
  joinOptions,
  defaultFields,
  formatOptions = { raw: true, nest: false }
) =>
  catchAsync(async (req, res, next) => {
    const search = new SearchAPI(req.query)
      .filterBy()
      .order(defaultOrderBy)
      .includeFields(defaultFields)
      .paginate()
      .format(formatOptions);

    if (req.user) search.joinOnUserId(req.user, joinOptions);

    await executeQuery(res, Model, search);
  });
