import {
  Op,
  FindAndCountOptions,
  FindAttributeOptions,
  IncludeOptions,
} from 'sequelize';
import { ParsedQs } from 'qs';
import { DefaultOrderBy, FormatOptions } from './handlerFactory';
import { AccountModel } from '../models/accountModel';

type Operators = 'gte' | 'gt' | 'lte' | 'lt' | 'ne';

type WhereOptions = {
  [field: string]:
    | string
    | string[]
    | {
        [op: string]: string;
      };
};

const reservedKeywords: { [reserved: string]: boolean } = {
  page: true,
  limit: true,
  fields: true,
  order: true,
  exclude: true,
  include: true,
};

class SearchAPI {
  query: ParsedQs;
  options: FindAndCountOptions;

  constructor(query: ParsedQs) {
    this.query = query;
    this.options = {};
  }

  filterBy() {
    const whereOptions: WhereOptions = {};

    Object.entries(this.query).forEach(([key, val]) => {
      if (reservedKeywords[key]) return;

      if (!val) return;

      if (typeof val === 'string') return (whereOptions[key] = val);

      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          whereOptions[key] = val.map((el) => {
            return typeof el === 'string' ? el : JSON.stringify(el);
          });
        } else {
          const [operator, opVal] = Object.entries(val)[0];

          // Remove arrays from being used with gte/gt/etc
          if (
            typeof opVal !== 'string' ||
            !/^(gte|gt|lte|lt|ne)$/.test(operator)
          )
            return;

          whereOptions[key] = { [Op[operator as Operators]]: opVal };
        }
      }
    });

    this.options.where = whereOptions;

    return this;
  }

  orderBy(defaultOrderBy: DefaultOrderBy) {
    const { order } = this.query;

    this.options.order =
      order && typeof order === 'string'
        ? order.split(',').map((el) => {
            return el[0] === '-' ? [el.slice(1), 'DESC'] : [el, 'ASC'];
          })
        : defaultOrderBy;

    return this;
  }

  includeFields(defaultFields?: FindAttributeOptions) {
    if (typeof this.query.exclude === 'string') {
      this.options.attributes = { exclude: this.query.exclude.split(',') };
    } else if (typeof this.query.include === 'string') {
      this.options.attributes = this.query.include.split(',');
    } else if (defaultFields) {
      this.options.attributes = defaultFields;
    }

    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    this.options.limit = limit;
    this.options.offset = (page - 1) * limit;

    return this;
  }

  format({ raw, nest }: FormatOptions) {
    // raw - Skips wrapping the returned results (creating an instance from the Model)
    this.options.raw = raw;
    this.options.nest = nest;

    return this;
  }

  joinOnUserId(user: AccountModel, joinOptions: IncludeOptions) {
    this.options.include = {
      ...joinOptions,
      where: { accountUid: user.accountUid },
    };

    return this;
  }
}

export default SearchAPI;
