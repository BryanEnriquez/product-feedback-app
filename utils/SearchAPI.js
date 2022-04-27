const { Op } = require('sequelize');

// Each option is processed differently so it's unlikely to be usable in options.where
const reservedKeywords = {
  page: true,
  limit: true,
  fields: true,
  order: true,
  // Not removing these fields in filterBy() will generate an invalid query. Ex:
  // SELECT ... FROM some_table WHERE "exclude" = "firstName,lastName,etc" AND 'firstName' = '...' AND etc..
  exclude: true,
  include: true,
};

class SearchAPI {
  constructor(query) {
    this.query = query;
    this.options = {};
  }

  filterBy() {
    const whereObj = {};

    Object.entries(this.query).forEach(([key, val]) => {
      if (reservedKeywords[key]) return;

      // For simple equals
      if (typeof val === 'string') return (whereObj[key] = val);

      // Get the first op in an obj if multiple were passed
      const [operator, opVal] = Object.entries(val)[0];

      // Only allow some operators
      if (!/^(gte|gt|lte|lt)$/.test(operator)) return;

      whereObj[key] = { [Op[operator]]: opVal };
    });

    this.options.where = whereObj;

    return this;
  }

  order(defaultOrderBy) {
    // sequelize automatically escapes column names and directions
    // NOTE: fields like firstName are correctly mapped (underscore <=> camel), just not created_at/updated_at
    const orderBy = this.query.order?.split(',').map((el) => {
      return el[0] === '-' ? [el.slice(1), 'DESC'] : [el, 'ASC'];
    });

    this.options.order = orderBy || defaultOrderBy;

    return this;
  }

  includeFields(defaultFields) {
    // Valid formats: `attributes: ['field1', 'field2'] }`,
    // `attributes: { exclude : ['field3', 'field4'] }`
    if (this.query.exclude) {
      this.options.attributes = { exclude: this.query.exclude.split(',') };
    } else if (this.query.include) {
      this.options.attributes = this.query.include.split(',');
    } else if (defaultFields) {
      this.options.attributes = defaultFields;
    }

    return this;
  }

  paginate() {
    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 10;

    this.options.limit = limit;
    this.options.offset = (page - 1) * limit;

    return this;
  }

  format(formatOptions) {
    this.options.raw = formatOptions.raw;
    this.options.nest = formatOptions.nest;

    return this;
  }

  joinOnUserId(user, joinOptions) {
    this.options.include = {
      ...joinOptions,
      where: { accountUid: user.accountUid },
    };

    return this;
  }
}

module.exports = SearchAPI;
