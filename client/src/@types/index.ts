export type RequireSome<T, U extends keyof T> = Pick<T, U> &
  Partial<Omit<T, U>>;

export type Optional<T, U extends keyof T> = Omit<T, U> & Partial<Pick<T, U>>;

// API  ////////////////////////////////////////////////

export type Upvote = {
  productRequestId: number;
  accountUid: string;
  createdAt: string;
};

export type Product = {
  productId: number;
  name: string;
  suggestions: number;
  planned: number;
  inProgress: number;
  live: number;
};

export type ProductRequestCategory =
  | 'ui'
  | 'ux'
  | 'enhancement'
  | 'bug'
  | 'feature';

export type ProductRequestStatus =
  | 'suggestion'
  | 'planned'
  | 'in-progress'
  | 'live';

export interface ProductRequest {
  productRequestId: number;
  title: string;
  description: string;
  comments: number;
  upvotes: number;
  category: ProductRequestCategory;
  status: ProductRequestStatus;
  createdAt: string;
  productId: number;
  accountUid: string;
  userUpvoted: boolean;
}

export interface CommentModel {
  commentId: number;
  content: string;
  author: [string, string];
  authorImg: null | string;
  replyTo: string | null;
  parentId: number | null;
  /**
   * Parent level comments will always have `depth = 0` and children `depth = 1`.
   * This can be used to differentiate between the two types.
   * Note: The same applies to the `parentId` field.
   */
  depth: 0 | 1;
  deleted: boolean;
  createdAt: string;
  productRequestId: number;
  accountUid: string | null;
}

export type CurrentUser = {
  accountUid: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImg: string | null;
  email: string;
  role: 'admin' | 'user' | 'demo user';
};

// App ////////////////////////////////////////////////

export type RequestFetchStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export type CurrentUserStates = CurrentUser | false | null;

type SortBy<T> = {
  id: T;
  label: string;
};

type SuggestionsSortById =
  | 'most_upvotes'
  | 'least_upvotes'
  | 'most_comments'
  | 'least_comments';

export type SuggestionsSortBy = SortBy<SuggestionsSortById>;

export type UpvoteTracked = {
  productRequestId: number;
  upvotes: number;
  /**
   * `boolean` = known, `null` = not known
   */
  upvoted: boolean | null;
};

export type FeedbackCategory = 'all' | ProductRequestCategory;

export type RoadmapStatusCount =
  | Exclude<ProductRequestStatus, 'suggestion'>
  | 'all';

export interface ProductRequestRoadmap extends ProductRequest {
  status: Exclude<ProductRequestStatus, 'suggestion'>;
}

export interface ProductRequestSuggestion extends ProductRequest {
  status: 'suggestion';
}

type ProductRequestUpdateFields =
  | 'title'
  | 'description'
  | 'category'
  | 'productRequestId'
  | 'status';

export type SuggestionUpdatePayload = Pick<
  ProductRequestSuggestion,
  ProductRequestUpdateFields
>;

export type RoadmapUpdatePayload = Pick<
  ProductRequestRoadmap,
  ProductRequestUpdateFields
>;

export type UpdatedProductRequest =
  | SuggestionUpdatePayload
  | RoadmapUpdatePayload;

/**
 * The type used for nested comments
 */
export interface ChildComment extends CommentModel {
  replyTo: string;
  parentId: number;
  depth: 1;
}

/**
 * For use in comment thunks and reducers ONLY. A comment of type `ParentComment` (checked by reading its depth or parentId value)
 * is transformed into one of type `CommentEntity` when later processed by a reducer.
 */
export interface ParentComment extends CommentModel {
  replyTo: null;
  parentId: null;
  depth: 0;
}

/**
 * Convenience type for use in comment thunks and reducers. This is the type returned by the API when creating a comment.
 */
export type ParentOrChildComment = ParentComment | ChildComment;

/**
 * Represents the type held in redux state (comments.entities).
 * It's also the type returned by the API when fetching multiple comments.
 * Note: `ParentComment` is for use in redux only.
 */
export interface CommentEntity extends ParentComment {
  Comments: ChildComment[];
}

export type RoadmapStatus = Exclude<ProductRequestStatus, 'suggestion'>;
