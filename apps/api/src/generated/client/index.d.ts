/**
 * Client
 **/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Category
 *
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>;
/**
 * Model Account
 *
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>;
/**
 * Model CostObject
 *
 */
export type CostObject = $Result.DefaultSelection<Prisma.$CostObjectPayload>;
/**
 * Model Transaction
 *
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>;
/**
 * Model CategorizationRule
 *
 */
export type CategorizationRule =
  $Result.DefaultSelection<Prisma.$CategorizationRulePayload>;
/**
 * Model RuleSuggestion
 *
 */
export type RuleSuggestion =
  $Result.DefaultSelection<Prisma.$RuleSuggestionPayload>;
/**
 * Model TransactionSplit
 *
 */
export type TransactionSplit =
  $Result.DefaultSelection<Prisma.$TransactionSplitPayload>;
/**
 * Model SavingsGoal
 *
 */
export type SavingsGoal = $Result.DefaultSelection<Prisma.$SavingsGoalPayload>;
/**
 * Model Setting
 *
 */
export type Setting = $Result.DefaultSelection<Prisma.$SettingPayload>;
/**
 * Model MonthlyBalance
 *
 */
export type MonthlyBalance =
  $Result.DefaultSelection<Prisma.$MonthlyBalancePayload>;
/**
 * Model AccountBalance
 *
 */
export type AccountBalance =
  $Result.DefaultSelection<Prisma.$AccountBalancePayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const AccountType: {
    DEBIT: 'DEBIT';
    CREDIT: 'CREDIT';
  };

  export type AccountType = (typeof AccountType)[keyof typeof AccountType];

  export const RuleMode: {
    AUTO_APPLY: 'AUTO_APPLY';
    SUGGEST: 'SUGGEST';
  };

  export type RuleMode = (typeof RuleMode)[keyof typeof RuleMode];

  export const SuggestionStatus: {
    PENDING: 'PENDING';
    ACCEPTED: 'ACCEPTED';
    REJECTED: 'REJECTED';
  };

  export type SuggestionStatus =
    (typeof SuggestionStatus)[keyof typeof SuggestionStatus];

  export const CategoryType: {
    INCOME: 'INCOME';
    EXPENSE: 'EXPENSE';
    GOAL: 'GOAL';
  };

  export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];
}

export type AccountType = $Enums.AccountType;

export const AccountType: typeof $Enums.AccountType;

export type RuleMode = $Enums.RuleMode;

export const RuleMode: typeof $Enums.RuleMode;

export type SuggestionStatus = $Enums.SuggestionStatus;

export const SuggestionStatus: typeof $Enums.SuggestionStatus;

export type CategoryType = $Enums.CategoryType;

export const CategoryType: typeof $Enums.CategoryType;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Categories
 * const categories = await prisma.category.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(
    optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>,
  );
  $on<V extends U>(
    eventType: V,
    callback: (
      event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent,
    ) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (
      prisma: Omit<PrismaClient, runtime.ITXClientDenyList>,
    ) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
   * ```
   */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Accounts
   * const accounts = await prisma.account.findMany()
   * ```
   */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.costObject`: Exposes CRUD operations for the **CostObject** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more CostObjects
   * const costObjects = await prisma.costObject.findMany()
   * ```
   */
  get costObject(): Prisma.CostObjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Transactions
   * const transactions = await prisma.transaction.findMany()
   * ```
   */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.categorizationRule`: Exposes CRUD operations for the **CategorizationRule** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more CategorizationRules
   * const categorizationRules = await prisma.categorizationRule.findMany()
   * ```
   */
  get categorizationRule(): Prisma.CategorizationRuleDelegate<
    ExtArgs,
    ClientOptions
  >;

  /**
   * `prisma.ruleSuggestion`: Exposes CRUD operations for the **RuleSuggestion** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more RuleSuggestions
   * const ruleSuggestions = await prisma.ruleSuggestion.findMany()
   * ```
   */
  get ruleSuggestion(): Prisma.RuleSuggestionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transactionSplit`: Exposes CRUD operations for the **TransactionSplit** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more TransactionSplits
   * const transactionSplits = await prisma.transactionSplit.findMany()
   * ```
   */
  get transactionSplit(): Prisma.TransactionSplitDelegate<
    ExtArgs,
    ClientOptions
  >;

  /**
   * `prisma.savingsGoal`: Exposes CRUD operations for the **SavingsGoal** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more SavingsGoals
   * const savingsGoals = await prisma.savingsGoal.findMany()
   * ```
   */
  get savingsGoal(): Prisma.SavingsGoalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.setting`: Exposes CRUD operations for the **Setting** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Settings
   * const settings = await prisma.setting.findMany()
   * ```
   */
  get setting(): Prisma.SettingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.monthlyBalance`: Exposes CRUD operations for the **MonthlyBalance** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more MonthlyBalances
   * const monthlyBalances = await prisma.monthlyBalance.findMany()
   * ```
   */
  get monthlyBalance(): Prisma.MonthlyBalanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accountBalance`: Exposes CRUD operations for the **AccountBalance** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more AccountBalances
   * const accountBalances = await prisma.accountBalance.findMany()
   * ```
   */
  get accountBalance(): Prisma.AccountBalanceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string;
    engine: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> =
    T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<
    T extends (...args: any) => $Utils.JsPromise<any>,
  > = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends bigint
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<
    __Either<O, K>
  >;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = O extends unknown ? _Either<O, K, strict> : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O
    ? O[K]
    : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown
    ? AtStrict<O, K>
    : never;
  export type At<
    O extends object,
    K extends Key,
    strict extends Boolean = 1,
  > = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>,
  > = IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<
            UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never
          >
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<
    T,
    K extends Enumerable<keyof T> | keyof T,
  > = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}`
    ? never
    : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Category: 'Category';
    Account: 'Account';
    CostObject: 'CostObject';
    Transaction: 'Transaction';
    CategorizationRule: 'CategorizationRule';
    RuleSuggestion: 'RuleSuggestion';
    TransactionSplit: 'TransactionSplit';
    SavingsGoal: 'SavingsGoal';
    Setting: 'Setting';
    MonthlyBalance: 'MonthlyBalance';
    AccountBalance: 'AccountBalance';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<
    { extArgs: $Extensions.InternalArgs },
    $Utils.Record<string, any>
  > {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps:
        | 'category'
        | 'account'
        | 'costObject'
        | 'transaction'
        | 'categorizationRule'
        | 'ruleSuggestion'
        | 'transactionSplit'
        | 'savingsGoal'
        | 'setting'
        | 'monthlyBalance'
        | 'accountBalance';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>;
        fields: Prisma.CategoryFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[];
          };
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[];
          };
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.CategoryUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[];
          };
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>;
          };
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateCategory>;
          };
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>;
            result: $Utils.Optional<CategoryGroupByOutputType>[];
          };
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>;
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number;
          };
        };
      };
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>;
        fields: Prisma.AccountFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[];
          };
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[];
          };
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[];
          };
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>;
          };
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAccount>;
          };
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AccountGroupByOutputType>[];
          };
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>;
            result: $Utils.Optional<AccountCountAggregateOutputType> | number;
          };
        };
      };
      CostObject: {
        payload: Prisma.$CostObjectPayload<ExtArgs>;
        fields: Prisma.CostObjectFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.CostObjectFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.CostObjectFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          findFirst: {
            args: Prisma.CostObjectFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.CostObjectFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          findMany: {
            args: Prisma.CostObjectFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>[];
          };
          create: {
            args: Prisma.CostObjectCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          createMany: {
            args: Prisma.CostObjectCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.CostObjectCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>[];
          };
          delete: {
            args: Prisma.CostObjectDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          update: {
            args: Prisma.CostObjectUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          deleteMany: {
            args: Prisma.CostObjectDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.CostObjectUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.CostObjectUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>[];
          };
          upsert: {
            args: Prisma.CostObjectUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CostObjectPayload>;
          };
          aggregate: {
            args: Prisma.CostObjectAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateCostObject>;
          };
          groupBy: {
            args: Prisma.CostObjectGroupByArgs<ExtArgs>;
            result: $Utils.Optional<CostObjectGroupByOutputType>[];
          };
          count: {
            args: Prisma.CostObjectCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<CostObjectCountAggregateOutputType>
              | number;
          };
        };
      };
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>;
        fields: Prisma.TransactionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[];
          };
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>;
          };
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTransaction>;
          };
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TransactionGroupByOutputType>[];
          };
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<TransactionCountAggregateOutputType>
              | number;
          };
        };
      };
      CategorizationRule: {
        payload: Prisma.$CategorizationRulePayload<ExtArgs>;
        fields: Prisma.CategorizationRuleFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.CategorizationRuleFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.CategorizationRuleFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          findFirst: {
            args: Prisma.CategorizationRuleFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.CategorizationRuleFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          findMany: {
            args: Prisma.CategorizationRuleFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>[];
          };
          create: {
            args: Prisma.CategorizationRuleCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          createMany: {
            args: Prisma.CategorizationRuleCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.CategorizationRuleCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>[];
          };
          delete: {
            args: Prisma.CategorizationRuleDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          update: {
            args: Prisma.CategorizationRuleUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          deleteMany: {
            args: Prisma.CategorizationRuleDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.CategorizationRuleUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.CategorizationRuleUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>[];
          };
          upsert: {
            args: Prisma.CategorizationRuleUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CategorizationRulePayload>;
          };
          aggregate: {
            args: Prisma.CategorizationRuleAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateCategorizationRule>;
          };
          groupBy: {
            args: Prisma.CategorizationRuleGroupByArgs<ExtArgs>;
            result: $Utils.Optional<CategorizationRuleGroupByOutputType>[];
          };
          count: {
            args: Prisma.CategorizationRuleCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<CategorizationRuleCountAggregateOutputType>
              | number;
          };
        };
      };
      RuleSuggestion: {
        payload: Prisma.$RuleSuggestionPayload<ExtArgs>;
        fields: Prisma.RuleSuggestionFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.RuleSuggestionFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.RuleSuggestionFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          findFirst: {
            args: Prisma.RuleSuggestionFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.RuleSuggestionFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          findMany: {
            args: Prisma.RuleSuggestionFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>[];
          };
          create: {
            args: Prisma.RuleSuggestionCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          createMany: {
            args: Prisma.RuleSuggestionCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.RuleSuggestionCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>[];
          };
          delete: {
            args: Prisma.RuleSuggestionDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          update: {
            args: Prisma.RuleSuggestionUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          deleteMany: {
            args: Prisma.RuleSuggestionDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.RuleSuggestionUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.RuleSuggestionUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>[];
          };
          upsert: {
            args: Prisma.RuleSuggestionUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$RuleSuggestionPayload>;
          };
          aggregate: {
            args: Prisma.RuleSuggestionAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateRuleSuggestion>;
          };
          groupBy: {
            args: Prisma.RuleSuggestionGroupByArgs<ExtArgs>;
            result: $Utils.Optional<RuleSuggestionGroupByOutputType>[];
          };
          count: {
            args: Prisma.RuleSuggestionCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<RuleSuggestionCountAggregateOutputType>
              | number;
          };
        };
      };
      TransactionSplit: {
        payload: Prisma.$TransactionSplitPayload<ExtArgs>;
        fields: Prisma.TransactionSplitFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.TransactionSplitFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.TransactionSplitFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          findFirst: {
            args: Prisma.TransactionSplitFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.TransactionSplitFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          findMany: {
            args: Prisma.TransactionSplitFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>[];
          };
          create: {
            args: Prisma.TransactionSplitCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          createMany: {
            args: Prisma.TransactionSplitCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.TransactionSplitCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>[];
          };
          delete: {
            args: Prisma.TransactionSplitDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          update: {
            args: Prisma.TransactionSplitUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          deleteMany: {
            args: Prisma.TransactionSplitDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.TransactionSplitUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.TransactionSplitUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>[];
          };
          upsert: {
            args: Prisma.TransactionSplitUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$TransactionSplitPayload>;
          };
          aggregate: {
            args: Prisma.TransactionSplitAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateTransactionSplit>;
          };
          groupBy: {
            args: Prisma.TransactionSplitGroupByArgs<ExtArgs>;
            result: $Utils.Optional<TransactionSplitGroupByOutputType>[];
          };
          count: {
            args: Prisma.TransactionSplitCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<TransactionSplitCountAggregateOutputType>
              | number;
          };
        };
      };
      SavingsGoal: {
        payload: Prisma.$SavingsGoalPayload<ExtArgs>;
        fields: Prisma.SavingsGoalFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SavingsGoalFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SavingsGoalFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          findFirst: {
            args: Prisma.SavingsGoalFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SavingsGoalFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          findMany: {
            args: Prisma.SavingsGoalFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>[];
          };
          create: {
            args: Prisma.SavingsGoalCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          createMany: {
            args: Prisma.SavingsGoalCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SavingsGoalCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>[];
          };
          delete: {
            args: Prisma.SavingsGoalDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          update: {
            args: Prisma.SavingsGoalUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          deleteMany: {
            args: Prisma.SavingsGoalDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SavingsGoalUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SavingsGoalUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>[];
          };
          upsert: {
            args: Prisma.SavingsGoalUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SavingsGoalPayload>;
          };
          aggregate: {
            args: Prisma.SavingsGoalAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSavingsGoal>;
          };
          groupBy: {
            args: Prisma.SavingsGoalGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SavingsGoalGroupByOutputType>[];
          };
          count: {
            args: Prisma.SavingsGoalCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<SavingsGoalCountAggregateOutputType>
              | number;
          };
        };
      };
      Setting: {
        payload: Prisma.$SettingPayload<ExtArgs>;
        fields: Prisma.SettingFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.SettingFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.SettingFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          findFirst: {
            args: Prisma.SettingFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.SettingFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          findMany: {
            args: Prisma.SettingFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[];
          };
          create: {
            args: Prisma.SettingCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          createMany: {
            args: Prisma.SettingCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.SettingCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[];
          };
          delete: {
            args: Prisma.SettingDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          update: {
            args: Prisma.SettingUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          deleteMany: {
            args: Prisma.SettingDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.SettingUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.SettingUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[];
          };
          upsert: {
            args: Prisma.SettingUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>;
          };
          aggregate: {
            args: Prisma.SettingAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateSetting>;
          };
          groupBy: {
            args: Prisma.SettingGroupByArgs<ExtArgs>;
            result: $Utils.Optional<SettingGroupByOutputType>[];
          };
          count: {
            args: Prisma.SettingCountArgs<ExtArgs>;
            result: $Utils.Optional<SettingCountAggregateOutputType> | number;
          };
        };
      };
      MonthlyBalance: {
        payload: Prisma.$MonthlyBalancePayload<ExtArgs>;
        fields: Prisma.MonthlyBalanceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.MonthlyBalanceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.MonthlyBalanceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          findFirst: {
            args: Prisma.MonthlyBalanceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.MonthlyBalanceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          findMany: {
            args: Prisma.MonthlyBalanceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>[];
          };
          create: {
            args: Prisma.MonthlyBalanceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          createMany: {
            args: Prisma.MonthlyBalanceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.MonthlyBalanceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>[];
          };
          delete: {
            args: Prisma.MonthlyBalanceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          update: {
            args: Prisma.MonthlyBalanceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          deleteMany: {
            args: Prisma.MonthlyBalanceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.MonthlyBalanceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.MonthlyBalanceUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>[];
          };
          upsert: {
            args: Prisma.MonthlyBalanceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$MonthlyBalancePayload>;
          };
          aggregate: {
            args: Prisma.MonthlyBalanceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateMonthlyBalance>;
          };
          groupBy: {
            args: Prisma.MonthlyBalanceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<MonthlyBalanceGroupByOutputType>[];
          };
          count: {
            args: Prisma.MonthlyBalanceCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<MonthlyBalanceCountAggregateOutputType>
              | number;
          };
        };
      };
      AccountBalance: {
        payload: Prisma.$AccountBalancePayload<ExtArgs>;
        fields: Prisma.AccountBalanceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AccountBalanceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AccountBalanceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          findFirst: {
            args: Prisma.AccountBalanceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AccountBalanceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          findMany: {
            args: Prisma.AccountBalanceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>[];
          };
          create: {
            args: Prisma.AccountBalanceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          createMany: {
            args: Prisma.AccountBalanceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AccountBalanceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>[];
          };
          delete: {
            args: Prisma.AccountBalanceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          update: {
            args: Prisma.AccountBalanceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          deleteMany: {
            args: Prisma.AccountBalanceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AccountBalanceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.AccountBalanceUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>[];
          };
          upsert: {
            args: Prisma.AccountBalanceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AccountBalancePayload>;
          };
          aggregate: {
            args: Prisma.AccountBalanceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAccountBalance>;
          };
          groupBy: {
            args: Prisma.AccountBalanceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AccountBalanceGroupByOutputType>[];
          };
          count: {
            args: Prisma.AccountBalanceCountArgs<ExtArgs>;
            result:
              | $Utils.Optional<AccountBalanceCountAggregateOutputType>
              | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory;
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
  }
  export type GlobalOmitConfig = {
    category?: CategoryOmit;
    account?: AccountOmit;
    costObject?: CostObjectOmit;
    transaction?: TransactionOmit;
    categorizationRule?: CategorizationRuleOmit;
    ruleSuggestion?: RuleSuggestionOmit;
    transactionSplit?: TransactionSplitOmit;
    savingsGoal?: SavingsGoalOmit;
    setting?: SettingOmit;
    monthlyBalance?: MonthlyBalanceOmit;
    accountBalance?: AccountBalanceOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(
    log: Array<LogLevel | LogDefinition>,
  ): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<
    Prisma.DefaultPrismaClient,
    runtime.ITXClientDenyList
  >;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    children: number;
    transactions: number;
    transactionSplits: number;
    savingsGoals: number;
    categorizationRules: number;
    ruleSuggestions: number;
  };

  export type CategoryCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    children?: boolean | CategoryCountOutputTypeCountChildrenArgs;
    transactions?: boolean | CategoryCountOutputTypeCountTransactionsArgs;
    transactionSplits?:
      | boolean
      | CategoryCountOutputTypeCountTransactionSplitsArgs;
    savingsGoals?: boolean | CategoryCountOutputTypeCountSavingsGoalsArgs;
    categorizationRules?:
      | boolean
      | CategoryCountOutputTypeCountCategorizationRulesArgs;
    ruleSuggestions?: boolean | CategoryCountOutputTypeCountRuleSuggestionsArgs;
  };

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountChildrenArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CategoryWhereInput;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountTransactionSplitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionSplitWhereInput;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountSavingsGoalsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SavingsGoalWhereInput;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountCategorizationRulesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CategorizationRuleWhereInput;
  };

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountRuleSuggestionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: RuleSuggestionWhereInput;
  };

  /**
   * Count Type AccountCountOutputType
   */

  export type AccountCountOutputType = {
    transactions: number;
    monthlyBalances: number;
    accountBalances: number;
  };

  export type AccountCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    transactions?: boolean | AccountCountOutputTypeCountTransactionsArgs;
    monthlyBalances?: boolean | AccountCountOutputTypeCountMonthlyBalancesArgs;
    accountBalances?: boolean | AccountCountOutputTypeCountAccountBalancesArgs;
  };

  // Custom InputTypes
  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountCountOutputType
     */
    select?: AccountCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountMonthlyBalancesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: MonthlyBalanceWhereInput;
  };

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountAccountBalancesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AccountBalanceWhereInput;
  };

  /**
   * Count Type CostObjectCountOutputType
   */

  export type CostObjectCountOutputType = {
    transactions: number;
    transactionSplits: number;
  };

  export type CostObjectCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    transactions?: boolean | CostObjectCountOutputTypeCountTransactionsArgs;
    transactionSplits?:
      | boolean
      | CostObjectCountOutputTypeCountTransactionSplitsArgs;
  };

  // Custom InputTypes
  /**
   * CostObjectCountOutputType without action
   */
  export type CostObjectCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObjectCountOutputType
     */
    select?: CostObjectCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * CostObjectCountOutputType without action
   */
  export type CostObjectCountOutputTypeCountTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * CostObjectCountOutputType without action
   */
  export type CostObjectCountOutputTypeCountTransactionSplitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionSplitWhereInput;
  };

  /**
   * Count Type TransactionCountOutputType
   */

  export type TransactionCountOutputType = {
    splits: number;
  };

  export type TransactionCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    splits?: boolean | TransactionCountOutputTypeCountSplitsArgs;
  };

  // Custom InputTypes
  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionCountOutputType
     */
    select?: TransactionCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountSplitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionSplitWhereInput;
  };

  /**
   * Count Type CategorizationRuleCountOutputType
   */

  export type CategorizationRuleCountOutputType = {
    suggestedTransactions: number;
  };

  export type CategorizationRuleCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    suggestedTransactions?:
      | boolean
      | CategorizationRuleCountOutputTypeCountSuggestedTransactionsArgs;
  };

  // Custom InputTypes
  /**
   * CategorizationRuleCountOutputType without action
   */
  export type CategorizationRuleCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRuleCountOutputType
     */
    select?: CategorizationRuleCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * CategorizationRuleCountOutputType without action
   */
  export type CategorizationRuleCountOutputTypeCountSuggestedTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null;
    _avg: CategoryAvgAggregateOutputType | null;
    _sum: CategorySumAggregateOutputType | null;
    _min: CategoryMinAggregateOutputType | null;
    _max: CategoryMaxAggregateOutputType | null;
  };

  export type CategoryAvgAggregateOutputType = {
    budget: Decimal | null;
  };

  export type CategorySumAggregateOutputType = {
    budget: Decimal | null;
  };

  export type CategoryMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    color: string | null;
    icon: string | null;
    budget: Decimal | null;
    type: $Enums.CategoryType | null;
    parentId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CategoryMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    color: string | null;
    icon: string | null;
    budget: Decimal | null;
    type: $Enums.CategoryType | null;
    parentId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CategoryCountAggregateOutputType = {
    id: number;
    name: number;
    color: number;
    icon: number;
    budget: number;
    type: number;
    parentId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type CategoryAvgAggregateInputType = {
    budget?: true;
  };

  export type CategorySumAggregateInputType = {
    budget?: true;
  };

  export type CategoryMinAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    budget?: true;
    type?: true;
    parentId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CategoryMaxAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    budget?: true;
    type?: true;
    parentId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CategoryCountAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    budget?: true;
    type?: true;
    parentId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type CategoryAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Categories to fetch.
     */
    orderBy?:
      | CategoryOrderByWithRelationInput
      | CategoryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Categories.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Categories
     **/
    _count?: true | CategoryCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: CategoryAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: CategorySumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: CategoryMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: CategoryMaxAggregateInputType;
  };

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
    [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>;
  };

  export type CategoryGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CategoryWhereInput;
    orderBy?:
      | CategoryOrderByWithAggregationInput
      | CategoryOrderByWithAggregationInput[];
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum;
    having?: CategoryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CategoryCountAggregateInputType | true;
    _avg?: CategoryAvgAggregateInputType;
    _sum?: CategorySumAggregateInputType;
    _min?: CategoryMinAggregateInputType;
    _max?: CategoryMaxAggregateInputType;
  };

  export type CategoryGroupByOutputType = {
    id: string;
    name: string;
    color: string | null;
    icon: string;
    budget: Decimal | null;
    type: $Enums.CategoryType;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: CategoryCountAggregateOutputType | null;
    _avg: CategoryAvgAggregateOutputType | null;
    _sum: CategorySumAggregateOutputType | null;
    _min: CategoryMinAggregateOutputType | null;
    _max: CategoryMaxAggregateOutputType | null;
  };

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<CategoryGroupByOutputType, T['by']> & {
          [P in keyof T & keyof CategoryGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>;
        }
      >
    >;

  export type CategorySelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      budget?: boolean;
      type?: boolean;
      parentId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | Category$parentArgs<ExtArgs>;
      children?: boolean | Category$childrenArgs<ExtArgs>;
      transactions?: boolean | Category$transactionsArgs<ExtArgs>;
      transactionSplits?: boolean | Category$transactionSplitsArgs<ExtArgs>;
      savingsGoals?: boolean | Category$savingsGoalsArgs<ExtArgs>;
      categorizationRules?: boolean | Category$categorizationRulesArgs<ExtArgs>;
      ruleSuggestions?: boolean | Category$ruleSuggestionsArgs<ExtArgs>;
      _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['category']
  >;

  export type CategorySelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      budget?: boolean;
      type?: boolean;
      parentId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | Category$parentArgs<ExtArgs>;
    },
    ExtArgs['result']['category']
  >;

  export type CategorySelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      budget?: boolean;
      type?: boolean;
      parentId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | Category$parentArgs<ExtArgs>;
    },
    ExtArgs['result']['category']
  >;

  export type CategorySelectScalar = {
    id?: boolean;
    name?: boolean;
    color?: boolean;
    icon?: boolean;
    budget?: boolean;
    type?: boolean;
    parentId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type CategoryOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'color'
    | 'icon'
    | 'budget'
    | 'type'
    | 'parentId'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['category']
  >;
  export type CategoryInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | Category$parentArgs<ExtArgs>;
    children?: boolean | Category$childrenArgs<ExtArgs>;
    transactions?: boolean | Category$transactionsArgs<ExtArgs>;
    transactionSplits?: boolean | Category$transactionSplitsArgs<ExtArgs>;
    savingsGoals?: boolean | Category$savingsGoalsArgs<ExtArgs>;
    categorizationRules?: boolean | Category$categorizationRulesArgs<ExtArgs>;
    ruleSuggestions?: boolean | Category$ruleSuggestionsArgs<ExtArgs>;
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type CategoryIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | Category$parentArgs<ExtArgs>;
  };
  export type CategoryIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | Category$parentArgs<ExtArgs>;
  };

  export type $CategoryPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Category';
    objects: {
      parent: Prisma.$CategoryPayload<ExtArgs> | null;
      children: Prisma.$CategoryPayload<ExtArgs>[];
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
      transactionSplits: Prisma.$TransactionSplitPayload<ExtArgs>[];
      savingsGoals: Prisma.$SavingsGoalPayload<ExtArgs>[];
      categorizationRules: Prisma.$CategorizationRulePayload<ExtArgs>[];
      ruleSuggestions: Prisma.$RuleSuggestionPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        color: string | null;
        icon: string;
        budget: Prisma.Decimal | null;
        type: $Enums.CategoryType;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['category']
    >;
    composites: {};
  };

  type CategoryGetPayload<
    S extends boolean | null | undefined | CategoryDefaultArgs,
  > = $Result.GetResult<Prisma.$CategoryPayload, S>;

  type CategoryCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CategoryCountAggregateInputType | true;
  };

  export interface CategoryDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Category'];
      meta: { name: 'Category' };
    };
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(
      args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(
      args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(
      args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     *
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CategoryFindManyArgs>(
      args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     *
     */
    create<T extends CategoryCreateArgs>(
      args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CategoryCreateManyArgs>(
      args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(
      args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     *
     */
    delete<T extends CategoryDeleteArgs>(
      args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CategoryUpdateArgs>(
      args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CategoryDeleteManyArgs>(
      args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CategoryUpdateManyArgs>(
      args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoryUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CategoryUpdateManyAndReturnArgs>(
      args: SelectSubset<T, CategoryUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(
      args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
     **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends CategoryAggregateArgs>(
      args: Subset<T, CategoryAggregateArgs>,
    ): Prisma.PrismaPromise<GetCategoryAggregateType<T>>;

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetCategoryGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Category model
     */
    readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    parent<T extends Category$parentArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$parentArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    children<T extends Category$childrenArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$childrenArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$CategoryPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    transactions<T extends Category$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$transactionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    transactionSplits<T extends Category$transactionSplitsArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$transactionSplitsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionSplitPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    savingsGoals<T extends Category$savingsGoalsArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$savingsGoalsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$SavingsGoalPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    categorizationRules<
      T extends Category$categorizationRulesArgs<ExtArgs> = {},
    >(
      args?: Subset<T, Category$categorizationRulesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$CategorizationRulePayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    ruleSuggestions<T extends Category$ruleSuggestionsArgs<ExtArgs> = {}>(
      args?: Subset<T, Category$ruleSuggestionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$RuleSuggestionPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<'Category', 'String'>;
    readonly name: FieldRef<'Category', 'String'>;
    readonly color: FieldRef<'Category', 'String'>;
    readonly icon: FieldRef<'Category', 'String'>;
    readonly budget: FieldRef<'Category', 'Decimal'>;
    readonly type: FieldRef<'Category', 'CategoryType'>;
    readonly parentId: FieldRef<'Category', 'String'>;
    readonly createdAt: FieldRef<'Category', 'DateTime'>;
    readonly updatedAt: FieldRef<'Category', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput;
  };

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput;
  };

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Categories to fetch.
     */
    orderBy?:
      | CategoryOrderByWithRelationInput
      | CategoryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Categories.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[];
  };

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Categories to fetch.
     */
    orderBy?:
      | CategoryOrderByWithRelationInput
      | CategoryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Categories.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[];
  };

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Categories to fetch.
     */
    orderBy?:
      | CategoryOrderByWithRelationInput
      | CategoryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Categories.
     */
    skip?: number;
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[];
  };

  /**
   * Category create
   */
  export type CategoryCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>;
  };

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[];
  };

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Category update
   */
  export type CategoryUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>;
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput;
  };

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Categories.
     */
    data: XOR<
      CategoryUpdateManyMutationInput,
      CategoryUncheckedUpdateManyInput
    >;
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput;
    /**
     * Limit how many Categories to update.
     */
    limit?: number;
  };

  /**
   * Category updateManyAndReturn
   */
  export type CategoryUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * The data used to update Categories.
     */
    data: XOR<
      CategoryUpdateManyMutationInput,
      CategoryUncheckedUpdateManyInput
    >;
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput;
    /**
     * Limit how many Categories to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput;
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>;
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>;
  };

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput;
  };

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput;
    /**
     * Limit how many Categories to delete.
     */
    limit?: number;
  };

  /**
   * Category.parent
   */
  export type Category$parentArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * Category.children
   */
  export type Category$childrenArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
    orderBy?:
      | CategoryOrderByWithRelationInput
      | CategoryOrderByWithRelationInput[];
    cursor?: CategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[];
  };

  /**
   * Category.transactions
   */
  export type Category$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Category.transactionSplits
   */
  export type Category$transactionSplitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    where?: TransactionSplitWhereInput;
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    cursor?: TransactionSplitWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * Category.savingsGoals
   */
  export type Category$savingsGoalsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    where?: SavingsGoalWhereInput;
    orderBy?:
      | SavingsGoalOrderByWithRelationInput
      | SavingsGoalOrderByWithRelationInput[];
    cursor?: SavingsGoalWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: SavingsGoalScalarFieldEnum | SavingsGoalScalarFieldEnum[];
  };

  /**
   * Category.categorizationRules
   */
  export type Category$categorizationRulesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    where?: CategorizationRuleWhereInput;
    orderBy?:
      | CategorizationRuleOrderByWithRelationInput
      | CategorizationRuleOrderByWithRelationInput[];
    cursor?: CategorizationRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | CategorizationRuleScalarFieldEnum
      | CategorizationRuleScalarFieldEnum[];
  };

  /**
   * Category.ruleSuggestions
   */
  export type Category$ruleSuggestionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    where?: RuleSuggestionWhereInput;
    orderBy?:
      | RuleSuggestionOrderByWithRelationInput
      | RuleSuggestionOrderByWithRelationInput[];
    cursor?: RuleSuggestionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: RuleSuggestionScalarFieldEnum | RuleSuggestionScalarFieldEnum[];
  };

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
  };

  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null;
    _avg: AccountAvgAggregateOutputType | null;
    _sum: AccountSumAggregateOutputType | null;
    _min: AccountMinAggregateOutputType | null;
    _max: AccountMaxAggregateOutputType | null;
  };

  export type AccountAvgAggregateOutputType = {
    initialBalance: Decimal | null;
  };

  export type AccountSumAggregateOutputType = {
    initialBalance: Decimal | null;
  };

  export type AccountMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    initialBalance: Decimal | null;
    type: $Enums.AccountType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type AccountMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    initialBalance: Decimal | null;
    type: $Enums.AccountType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type AccountCountAggregateOutputType = {
    id: number;
    name: number;
    initialBalance: number;
    type: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type AccountAvgAggregateInputType = {
    initialBalance?: true;
  };

  export type AccountSumAggregateInputType = {
    initialBalance?: true;
  };

  export type AccountMinAggregateInputType = {
    id?: true;
    name?: true;
    initialBalance?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type AccountMaxAggregateInputType = {
    id?: true;
    name?: true;
    initialBalance?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type AccountCountAggregateInputType = {
    id?: true;
    name?: true;
    initialBalance?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type AccountAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Accounts to fetch.
     */
    orderBy?:
      | AccountOrderByWithRelationInput
      | AccountOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Accounts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Accounts
     **/
    _count?: true | AccountCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: AccountAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: AccountSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AccountMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AccountMaxAggregateInputType;
  };

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
    [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>;
  };

  export type AccountGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AccountWhereInput;
    orderBy?:
      | AccountOrderByWithAggregationInput
      | AccountOrderByWithAggregationInput[];
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum;
    having?: AccountScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AccountCountAggregateInputType | true;
    _avg?: AccountAvgAggregateInputType;
    _sum?: AccountSumAggregateInputType;
    _min?: AccountMinAggregateInputType;
    _max?: AccountMaxAggregateInputType;
  };

  export type AccountGroupByOutputType = {
    id: string;
    name: string;
    initialBalance: Decimal;
    type: $Enums.AccountType;
    createdAt: Date;
    updatedAt: Date;
    _count: AccountCountAggregateOutputType | null;
    _avg: AccountAvgAggregateOutputType | null;
    _sum: AccountSumAggregateOutputType | null;
    _min: AccountMinAggregateOutputType | null;
    _max: AccountMaxAggregateOutputType | null;
  };

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<AccountGroupByOutputType, T['by']> & {
          [P in keyof T & keyof AccountGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>;
        }
      >
    >;

  export type AccountSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      initialBalance?: boolean;
      type?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      transactions?: boolean | Account$transactionsArgs<ExtArgs>;
      monthlyBalances?: boolean | Account$monthlyBalancesArgs<ExtArgs>;
      accountBalances?: boolean | Account$accountBalancesArgs<ExtArgs>;
      _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['account']
  >;

  export type AccountSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      initialBalance?: boolean;
      type?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['account']
  >;

  export type AccountSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      initialBalance?: boolean;
      type?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['account']
  >;

  export type AccountSelectScalar = {
    id?: boolean;
    name?: boolean;
    initialBalance?: boolean;
    type?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type AccountOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'name' | 'initialBalance' | 'type' | 'createdAt' | 'updatedAt',
    ExtArgs['result']['account']
  >;
  export type AccountInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    transactions?: boolean | Account$transactionsArgs<ExtArgs>;
    monthlyBalances?: boolean | Account$monthlyBalancesArgs<ExtArgs>;
    accountBalances?: boolean | Account$accountBalancesArgs<ExtArgs>;
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type AccountIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type AccountIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $AccountPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Account';
    objects: {
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
      monthlyBalances: Prisma.$MonthlyBalancePayload<ExtArgs>[];
      accountBalances: Prisma.$AccountBalancePayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        initialBalance: Prisma.Decimal;
        type: $Enums.AccountType;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['account']
    >;
    composites: {};
  };

  type AccountGetPayload<
    S extends boolean | null | undefined | AccountDefaultArgs,
  > = $Result.GetResult<Prisma.$AccountPayload, S>;

  type AccountCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AccountCountAggregateInputType | true;
  };

  export interface AccountDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Account'];
      meta: { name: 'Account' };
    };
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(
      args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(
      args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     *
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AccountFindManyArgs>(
      args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     *
     */
    create<T extends AccountCreateArgs>(
      args: SelectSubset<T, AccountCreateArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AccountCreateManyArgs>(
      args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     *
     */
    delete<T extends AccountDeleteArgs>(
      args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AccountUpdateArgs>(
      args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AccountDeleteManyArgs>(
      args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AccountUpdateManyArgs>(
      args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(
      args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(
      args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
     **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AccountAggregateArgs>(
      args: Subset<T, AccountAggregateArgs>,
    ): Prisma.PrismaPromise<GetAccountAggregateType<T>>;

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetAccountGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Account model
     */
    readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    transactions<T extends Account$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, Account$transactionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    monthlyBalances<T extends Account$monthlyBalancesArgs<ExtArgs> = {}>(
      args?: Subset<T, Account$monthlyBalancesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$MonthlyBalancePayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    accountBalances<T extends Account$accountBalancesArgs<ExtArgs> = {}>(
      args?: Subset<T, Account$accountBalancesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$AccountBalancePayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<'Account', 'String'>;
    readonly name: FieldRef<'Account', 'String'>;
    readonly initialBalance: FieldRef<'Account', 'Decimal'>;
    readonly type: FieldRef<'Account', 'AccountType'>;
    readonly createdAt: FieldRef<'Account', 'DateTime'>;
    readonly updatedAt: FieldRef<'Account', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput;
  };

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput;
  };

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Accounts to fetch.
     */
    orderBy?:
      | AccountOrderByWithRelationInput
      | AccountOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Accounts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
  };

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Accounts to fetch.
     */
    orderBy?:
      | AccountOrderByWithRelationInput
      | AccountOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Accounts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
  };

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Accounts to fetch.
     */
    orderBy?:
      | AccountOrderByWithRelationInput
      | AccountOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Accounts.
     */
    skip?: number;
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[];
  };

  /**
   * Account create
   */
  export type AccountCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>;
  };

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[];
  };

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[];
  };

  /**
   * Account update
   */
  export type AccountUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>;
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput;
  };

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>;
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput;
    /**
     * Limit how many Accounts to update.
     */
    limit?: number;
  };

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>;
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput;
    /**
     * Limit how many Accounts to update.
     */
    limit?: number;
  };

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput;
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>;
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>;
  };

  /**
   * Account delete
   */
  export type AccountDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput;
  };

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput;
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number;
  };

  /**
   * Account.transactions
   */
  export type Account$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Account.monthlyBalances
   */
  export type Account$monthlyBalancesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    where?: MonthlyBalanceWhereInput;
    orderBy?:
      | MonthlyBalanceOrderByWithRelationInput
      | MonthlyBalanceOrderByWithRelationInput[];
    cursor?: MonthlyBalanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: MonthlyBalanceScalarFieldEnum | MonthlyBalanceScalarFieldEnum[];
  };

  /**
   * Account.accountBalances
   */
  export type Account$accountBalancesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    where?: AccountBalanceWhereInput;
    orderBy?:
      | AccountBalanceOrderByWithRelationInput
      | AccountBalanceOrderByWithRelationInput[];
    cursor?: AccountBalanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: AccountBalanceScalarFieldEnum | AccountBalanceScalarFieldEnum[];
  };

  /**
   * Account without action
   */
  export type AccountDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
  };

  /**
   * Model CostObject
   */

  export type AggregateCostObject = {
    _count: CostObjectCountAggregateOutputType | null;
    _min: CostObjectMinAggregateOutputType | null;
    _max: CostObjectMaxAggregateOutputType | null;
  };

  export type CostObjectMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    color: string | null;
    icon: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CostObjectMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    color: string | null;
    icon: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CostObjectCountAggregateOutputType = {
    id: number;
    name: number;
    color: number;
    icon: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type CostObjectMinAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CostObjectMaxAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CostObjectCountAggregateInputType = {
    id?: true;
    name?: true;
    color?: true;
    icon?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type CostObjectAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which CostObject to aggregate.
     */
    where?: CostObjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CostObjects to fetch.
     */
    orderBy?:
      | CostObjectOrderByWithRelationInput
      | CostObjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: CostObjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CostObjects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CostObjects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CostObjects
     **/
    _count?: true | CostObjectCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: CostObjectMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: CostObjectMaxAggregateInputType;
  };

  export type GetCostObjectAggregateType<T extends CostObjectAggregateArgs> = {
    [P in keyof T & keyof AggregateCostObject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCostObject[P]>
      : GetScalarType<T[P], AggregateCostObject[P]>;
  };

  export type CostObjectGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CostObjectWhereInput;
    orderBy?:
      | CostObjectOrderByWithAggregationInput
      | CostObjectOrderByWithAggregationInput[];
    by: CostObjectScalarFieldEnum[] | CostObjectScalarFieldEnum;
    having?: CostObjectScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CostObjectCountAggregateInputType | true;
    _min?: CostObjectMinAggregateInputType;
    _max?: CostObjectMaxAggregateInputType;
  };

  export type CostObjectGroupByOutputType = {
    id: string;
    name: string;
    color: string | null;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
    _count: CostObjectCountAggregateOutputType | null;
    _min: CostObjectMinAggregateOutputType | null;
    _max: CostObjectMaxAggregateOutputType | null;
  };

  type GetCostObjectGroupByPayload<T extends CostObjectGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<CostObjectGroupByOutputType, T['by']> & {
          [P in keyof T & keyof CostObjectGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CostObjectGroupByOutputType[P]>
            : GetScalarType<T[P], CostObjectGroupByOutputType[P]>;
        }
      >
    >;

  export type CostObjectSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      transactions?: boolean | CostObject$transactionsArgs<ExtArgs>;
      transactionSplits?: boolean | CostObject$transactionSplitsArgs<ExtArgs>;
      _count?: boolean | CostObjectCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['costObject']
  >;

  export type CostObjectSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['costObject']
  >;

  export type CostObjectSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      color?: boolean;
      icon?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs['result']['costObject']
  >;

  export type CostObjectSelectScalar = {
    id?: boolean;
    name?: boolean;
    color?: boolean;
    icon?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type CostObjectOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'name' | 'color' | 'icon' | 'createdAt' | 'updatedAt',
    ExtArgs['result']['costObject']
  >;
  export type CostObjectInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    transactions?: boolean | CostObject$transactionsArgs<ExtArgs>;
    transactionSplits?: boolean | CostObject$transactionSplitsArgs<ExtArgs>;
    _count?: boolean | CostObjectCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type CostObjectIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type CostObjectIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $CostObjectPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'CostObject';
    objects: {
      transactions: Prisma.$TransactionPayload<ExtArgs>[];
      transactionSplits: Prisma.$TransactionSplitPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        color: string | null;
        icon: string;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['costObject']
    >;
    composites: {};
  };

  type CostObjectGetPayload<
    S extends boolean | null | undefined | CostObjectDefaultArgs,
  > = $Result.GetResult<Prisma.$CostObjectPayload, S>;

  type CostObjectCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    CostObjectFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: CostObjectCountAggregateInputType | true;
  };

  export interface CostObjectDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['CostObject'];
      meta: { name: 'CostObject' };
    };
    /**
     * Find zero or one CostObject that matches the filter.
     * @param {CostObjectFindUniqueArgs} args - Arguments to find a CostObject
     * @example
     * // Get one CostObject
     * const costObject = await prisma.costObject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CostObjectFindUniqueArgs>(
      args: SelectSubset<T, CostObjectFindUniqueArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one CostObject that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CostObjectFindUniqueOrThrowArgs} args - Arguments to find a CostObject
     * @example
     * // Get one CostObject
     * const costObject = await prisma.costObject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CostObjectFindUniqueOrThrowArgs>(
      args: SelectSubset<T, CostObjectFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first CostObject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectFindFirstArgs} args - Arguments to find a CostObject
     * @example
     * // Get one CostObject
     * const costObject = await prisma.costObject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CostObjectFindFirstArgs>(
      args?: SelectSubset<T, CostObjectFindFirstArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first CostObject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectFindFirstOrThrowArgs} args - Arguments to find a CostObject
     * @example
     * // Get one CostObject
     * const costObject = await prisma.costObject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CostObjectFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CostObjectFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more CostObjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CostObjects
     * const costObjects = await prisma.costObject.findMany()
     *
     * // Get first 10 CostObjects
     * const costObjects = await prisma.costObject.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const costObjectWithIdOnly = await prisma.costObject.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CostObjectFindManyArgs>(
      args?: SelectSubset<T, CostObjectFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a CostObject.
     * @param {CostObjectCreateArgs} args - Arguments to create a CostObject.
     * @example
     * // Create one CostObject
     * const CostObject = await prisma.costObject.create({
     *   data: {
     *     // ... data to create a CostObject
     *   }
     * })
     *
     */
    create<T extends CostObjectCreateArgs>(
      args: SelectSubset<T, CostObjectCreateArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many CostObjects.
     * @param {CostObjectCreateManyArgs} args - Arguments to create many CostObjects.
     * @example
     * // Create many CostObjects
     * const costObject = await prisma.costObject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CostObjectCreateManyArgs>(
      args?: SelectSubset<T, CostObjectCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many CostObjects and returns the data saved in the database.
     * @param {CostObjectCreateManyAndReturnArgs} args - Arguments to create many CostObjects.
     * @example
     * // Create many CostObjects
     * const costObject = await prisma.costObject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CostObjects and only return the `id`
     * const costObjectWithIdOnly = await prisma.costObject.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CostObjectCreateManyAndReturnArgs>(
      args?: SelectSubset<T, CostObjectCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a CostObject.
     * @param {CostObjectDeleteArgs} args - Arguments to delete one CostObject.
     * @example
     * // Delete one CostObject
     * const CostObject = await prisma.costObject.delete({
     *   where: {
     *     // ... filter to delete one CostObject
     *   }
     * })
     *
     */
    delete<T extends CostObjectDeleteArgs>(
      args: SelectSubset<T, CostObjectDeleteArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one CostObject.
     * @param {CostObjectUpdateArgs} args - Arguments to update one CostObject.
     * @example
     * // Update one CostObject
     * const costObject = await prisma.costObject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CostObjectUpdateArgs>(
      args: SelectSubset<T, CostObjectUpdateArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more CostObjects.
     * @param {CostObjectDeleteManyArgs} args - Arguments to filter CostObjects to delete.
     * @example
     * // Delete a few CostObjects
     * const { count } = await prisma.costObject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CostObjectDeleteManyArgs>(
      args?: SelectSubset<T, CostObjectDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more CostObjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CostObjects
     * const costObject = await prisma.costObject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CostObjectUpdateManyArgs>(
      args: SelectSubset<T, CostObjectUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more CostObjects and returns the data updated in the database.
     * @param {CostObjectUpdateManyAndReturnArgs} args - Arguments to update many CostObjects.
     * @example
     * // Update many CostObjects
     * const costObject = await prisma.costObject.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CostObjects and only return the `id`
     * const costObjectWithIdOnly = await prisma.costObject.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CostObjectUpdateManyAndReturnArgs>(
      args: SelectSubset<T, CostObjectUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one CostObject.
     * @param {CostObjectUpsertArgs} args - Arguments to update or create a CostObject.
     * @example
     * // Update or create a CostObject
     * const costObject = await prisma.costObject.upsert({
     *   create: {
     *     // ... data to create a CostObject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CostObject we want to update
     *   }
     * })
     */
    upsert<T extends CostObjectUpsertArgs>(
      args: SelectSubset<T, CostObjectUpsertArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of CostObjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectCountArgs} args - Arguments to filter CostObjects to count.
     * @example
     * // Count the number of CostObjects
     * const count = await prisma.costObject.count({
     *   where: {
     *     // ... the filter for the CostObjects we want to count
     *   }
     * })
     **/
    count<T extends CostObjectCountArgs>(
      args?: Subset<T, CostObjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CostObjectCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a CostObject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends CostObjectAggregateArgs>(
      args: Subset<T, CostObjectAggregateArgs>,
    ): Prisma.PrismaPromise<GetCostObjectAggregateType<T>>;

    /**
     * Group by CostObject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CostObjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends CostObjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CostObjectGroupByArgs['orderBy'] }
        : { orderBy?: CostObjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, CostObjectGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetCostObjectGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CostObject model
     */
    readonly fields: CostObjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CostObject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CostObjectClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    transactions<T extends CostObject$transactionsArgs<ExtArgs> = {}>(
      args?: Subset<T, CostObject$transactionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    transactionSplits<T extends CostObject$transactionSplitsArgs<ExtArgs> = {}>(
      args?: Subset<T, CostObject$transactionSplitsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionSplitPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the CostObject model
   */
  interface CostObjectFieldRefs {
    readonly id: FieldRef<'CostObject', 'String'>;
    readonly name: FieldRef<'CostObject', 'String'>;
    readonly color: FieldRef<'CostObject', 'String'>;
    readonly icon: FieldRef<'CostObject', 'String'>;
    readonly createdAt: FieldRef<'CostObject', 'DateTime'>;
    readonly updatedAt: FieldRef<'CostObject', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * CostObject findUnique
   */
  export type CostObjectFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter, which CostObject to fetch.
     */
    where: CostObjectWhereUniqueInput;
  };

  /**
   * CostObject findUniqueOrThrow
   */
  export type CostObjectFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter, which CostObject to fetch.
     */
    where: CostObjectWhereUniqueInput;
  };

  /**
   * CostObject findFirst
   */
  export type CostObjectFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter, which CostObject to fetch.
     */
    where?: CostObjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CostObjects to fetch.
     */
    orderBy?:
      | CostObjectOrderByWithRelationInput
      | CostObjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CostObjects.
     */
    cursor?: CostObjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CostObjects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CostObjects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CostObjects.
     */
    distinct?: CostObjectScalarFieldEnum | CostObjectScalarFieldEnum[];
  };

  /**
   * CostObject findFirstOrThrow
   */
  export type CostObjectFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter, which CostObject to fetch.
     */
    where?: CostObjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CostObjects to fetch.
     */
    orderBy?:
      | CostObjectOrderByWithRelationInput
      | CostObjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CostObjects.
     */
    cursor?: CostObjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CostObjects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CostObjects.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CostObjects.
     */
    distinct?: CostObjectScalarFieldEnum | CostObjectScalarFieldEnum[];
  };

  /**
   * CostObject findMany
   */
  export type CostObjectFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter, which CostObjects to fetch.
     */
    where?: CostObjectWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CostObjects to fetch.
     */
    orderBy?:
      | CostObjectOrderByWithRelationInput
      | CostObjectOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CostObjects.
     */
    cursor?: CostObjectWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CostObjects from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CostObjects.
     */
    skip?: number;
    distinct?: CostObjectScalarFieldEnum | CostObjectScalarFieldEnum[];
  };

  /**
   * CostObject create
   */
  export type CostObjectCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * The data needed to create a CostObject.
     */
    data: XOR<CostObjectCreateInput, CostObjectUncheckedCreateInput>;
  };

  /**
   * CostObject createMany
   */
  export type CostObjectCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many CostObjects.
     */
    data: CostObjectCreateManyInput | CostObjectCreateManyInput[];
  };

  /**
   * CostObject createManyAndReturn
   */
  export type CostObjectCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * The data used to create many CostObjects.
     */
    data: CostObjectCreateManyInput | CostObjectCreateManyInput[];
  };

  /**
   * CostObject update
   */
  export type CostObjectUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * The data needed to update a CostObject.
     */
    data: XOR<CostObjectUpdateInput, CostObjectUncheckedUpdateInput>;
    /**
     * Choose, which CostObject to update.
     */
    where: CostObjectWhereUniqueInput;
  };

  /**
   * CostObject updateMany
   */
  export type CostObjectUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update CostObjects.
     */
    data: XOR<
      CostObjectUpdateManyMutationInput,
      CostObjectUncheckedUpdateManyInput
    >;
    /**
     * Filter which CostObjects to update
     */
    where?: CostObjectWhereInput;
    /**
     * Limit how many CostObjects to update.
     */
    limit?: number;
  };

  /**
   * CostObject updateManyAndReturn
   */
  export type CostObjectUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * The data used to update CostObjects.
     */
    data: XOR<
      CostObjectUpdateManyMutationInput,
      CostObjectUncheckedUpdateManyInput
    >;
    /**
     * Filter which CostObjects to update
     */
    where?: CostObjectWhereInput;
    /**
     * Limit how many CostObjects to update.
     */
    limit?: number;
  };

  /**
   * CostObject upsert
   */
  export type CostObjectUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * The filter to search for the CostObject to update in case it exists.
     */
    where: CostObjectWhereUniqueInput;
    /**
     * In case the CostObject found by the `where` argument doesn't exist, create a new CostObject with this data.
     */
    create: XOR<CostObjectCreateInput, CostObjectUncheckedCreateInput>;
    /**
     * In case the CostObject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CostObjectUpdateInput, CostObjectUncheckedUpdateInput>;
  };

  /**
   * CostObject delete
   */
  export type CostObjectDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    /**
     * Filter which CostObject to delete.
     */
    where: CostObjectWhereUniqueInput;
  };

  /**
   * CostObject deleteMany
   */
  export type CostObjectDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which CostObjects to delete
     */
    where?: CostObjectWhereInput;
    /**
     * Limit how many CostObjects to delete.
     */
    limit?: number;
  };

  /**
   * CostObject.transactions
   */
  export type CostObject$transactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * CostObject.transactionSplits
   */
  export type CostObject$transactionSplitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    where?: TransactionSplitWhereInput;
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    cursor?: TransactionSplitWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * CostObject without action
   */
  export type CostObjectDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
  };

  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  export type TransactionAvgAggregateOutputType = {
    amount: Decimal | null;
  };

  export type TransactionSumAggregateOutputType = {
    amount: Decimal | null;
  };

  export type TransactionMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    amount: Decimal | null;
    description: string | null;
    categoryId: string | null;
    accountId: string | null;
    costObjectId: string | null;
    notes: string | null;
    suggestedCategoryId: string | null;
    merchant: string | null;
    suggestedByRuleId: string | null;
    externalId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    amount: Decimal | null;
    description: string | null;
    categoryId: string | null;
    accountId: string | null;
    costObjectId: string | null;
    notes: string | null;
    suggestedCategoryId: string | null;
    merchant: string | null;
    suggestedByRuleId: string | null;
    externalId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionCountAggregateOutputType = {
    id: number;
    date: number;
    amount: number;
    description: number;
    categoryId: number;
    accountId: number;
    costObjectId: number;
    notes: number;
    suggestedCategoryId: number;
    merchant: number;
    suggestedByRuleId: number;
    externalId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TransactionAvgAggregateInputType = {
    amount?: true;
  };

  export type TransactionSumAggregateInputType = {
    amount?: true;
  };

  export type TransactionMinAggregateInputType = {
    id?: true;
    date?: true;
    amount?: true;
    description?: true;
    categoryId?: true;
    accountId?: true;
    costObjectId?: true;
    notes?: true;
    suggestedCategoryId?: true;
    merchant?: true;
    suggestedByRuleId?: true;
    externalId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionMaxAggregateInputType = {
    id?: true;
    date?: true;
    amount?: true;
    description?: true;
    categoryId?: true;
    accountId?: true;
    costObjectId?: true;
    notes?: true;
    suggestedCategoryId?: true;
    merchant?: true;
    suggestedByRuleId?: true;
    externalId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionCountAggregateInputType = {
    id?: true;
    date?: true;
    amount?: true;
    description?: true;
    categoryId?: true;
    accountId?: true;
    costObjectId?: true;
    notes?: true;
    suggestedCategoryId?: true;
    merchant?: true;
    suggestedByRuleId?: true;
    externalId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TransactionAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Transactions
     **/
    _count?: true | TransactionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: TransactionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: TransactionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TransactionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TransactionMaxAggregateInputType;
  };

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> =
    {
      [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
        ? T[P] extends true
          ? number
          : GetScalarType<T[P], AggregateTransaction[P]>
        : GetScalarType<T[P], AggregateTransaction[P]>;
    };

  export type TransactionGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionWhereInput;
    orderBy?:
      | TransactionOrderByWithAggregationInput
      | TransactionOrderByWithAggregationInput[];
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum;
    having?: TransactionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TransactionCountAggregateInputType | true;
    _avg?: TransactionAvgAggregateInputType;
    _sum?: TransactionSumAggregateInputType;
    _min?: TransactionMinAggregateInputType;
    _max?: TransactionMaxAggregateInputType;
  };

  export type TransactionGroupByOutputType = {
    id: string;
    date: Date;
    amount: Decimal;
    description: string;
    categoryId: string | null;
    accountId: string | null;
    costObjectId: string | null;
    notes: string | null;
    suggestedCategoryId: string | null;
    merchant: string | null;
    suggestedByRuleId: string | null;
    externalId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
  };

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<TransactionGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof TransactionGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>;
        }
      >
    >;

  export type TransactionSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      date?: boolean;
      amount?: boolean;
      description?: boolean;
      categoryId?: boolean;
      accountId?: boolean;
      costObjectId?: boolean;
      notes?: boolean;
      suggestedCategoryId?: boolean;
      merchant?: boolean;
      suggestedByRuleId?: boolean;
      externalId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | Transaction$categoryArgs<ExtArgs>;
      account?: boolean | Transaction$accountArgs<ExtArgs>;
      costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
      suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
      splits?: boolean | Transaction$splitsArgs<ExtArgs>;
      _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['transaction']
  >;

  export type TransactionSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      date?: boolean;
      amount?: boolean;
      description?: boolean;
      categoryId?: boolean;
      accountId?: boolean;
      costObjectId?: boolean;
      notes?: boolean;
      suggestedCategoryId?: boolean;
      merchant?: boolean;
      suggestedByRuleId?: boolean;
      externalId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | Transaction$categoryArgs<ExtArgs>;
      account?: boolean | Transaction$accountArgs<ExtArgs>;
      costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
      suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
    },
    ExtArgs['result']['transaction']
  >;

  export type TransactionSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      date?: boolean;
      amount?: boolean;
      description?: boolean;
      categoryId?: boolean;
      accountId?: boolean;
      costObjectId?: boolean;
      notes?: boolean;
      suggestedCategoryId?: boolean;
      merchant?: boolean;
      suggestedByRuleId?: boolean;
      externalId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | Transaction$categoryArgs<ExtArgs>;
      account?: boolean | Transaction$accountArgs<ExtArgs>;
      costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
      suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
    },
    ExtArgs['result']['transaction']
  >;

  export type TransactionSelectScalar = {
    id?: boolean;
    date?: boolean;
    amount?: boolean;
    description?: boolean;
    categoryId?: boolean;
    accountId?: boolean;
    costObjectId?: boolean;
    notes?: boolean;
    suggestedCategoryId?: boolean;
    merchant?: boolean;
    suggestedByRuleId?: boolean;
    externalId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TransactionOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'date'
    | 'amount'
    | 'description'
    | 'categoryId'
    | 'accountId'
    | 'costObjectId'
    | 'notes'
    | 'suggestedCategoryId'
    | 'merchant'
    | 'suggestedByRuleId'
    | 'externalId'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['transaction']
  >;
  export type TransactionInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | Transaction$categoryArgs<ExtArgs>;
    account?: boolean | Transaction$accountArgs<ExtArgs>;
    costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
    suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
    splits?: boolean | Transaction$splitsArgs<ExtArgs>;
    _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type TransactionIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | Transaction$categoryArgs<ExtArgs>;
    account?: boolean | Transaction$accountArgs<ExtArgs>;
    costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
    suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
  };
  export type TransactionIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | Transaction$categoryArgs<ExtArgs>;
    account?: boolean | Transaction$accountArgs<ExtArgs>;
    costObject?: boolean | Transaction$costObjectArgs<ExtArgs>;
    suggestedRule?: boolean | Transaction$suggestedRuleArgs<ExtArgs>;
  };

  export type $TransactionPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Transaction';
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null;
      account: Prisma.$AccountPayload<ExtArgs> | null;
      costObject: Prisma.$CostObjectPayload<ExtArgs> | null;
      suggestedRule: Prisma.$CategorizationRulePayload<ExtArgs> | null;
      splits: Prisma.$TransactionSplitPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        date: Date;
        amount: Prisma.Decimal;
        description: string;
        categoryId: string | null;
        accountId: string | null;
        costObjectId: string | null;
        notes: string | null;
        suggestedCategoryId: string | null;
        merchant: string | null;
        suggestedByRuleId: string | null;
        externalId: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['transaction']
    >;
    composites: {};
  };

  type TransactionGetPayload<
    S extends boolean | null | undefined | TransactionDefaultArgs,
  > = $Result.GetResult<Prisma.$TransactionPayload, S>;

  type TransactionCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    TransactionFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: TransactionCountAggregateInputType | true;
  };

  export interface TransactionDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Transaction'];
      meta: { name: 'Transaction' };
    };
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(
      args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(
      args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     *
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TransactionFindManyArgs>(
      args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     *
     */
    create<T extends TransactionCreateArgs>(
      args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TransactionCreateManyArgs>(
      args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     *
     */
    delete<T extends TransactionDeleteArgs>(
      args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TransactionUpdateArgs>(
      args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TransactionDeleteManyArgs>(
      args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TransactionUpdateManyArgs>(
      args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(
      args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(
      args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      $Result.GetResult<
        Prisma.$TransactionPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
     **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TransactionAggregateArgs>(
      args: Subset<T, TransactionAggregateArgs>,
    ): Prisma.PrismaPromise<GetTransactionAggregateType<T>>;

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetTransactionGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Transaction model
     */
    readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    category<T extends Transaction$categoryArgs<ExtArgs> = {}>(
      args?: Subset<T, Transaction$categoryArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    account<T extends Transaction$accountArgs<ExtArgs> = {}>(
      args?: Subset<T, Transaction$accountArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    costObject<T extends Transaction$costObjectArgs<ExtArgs> = {}>(
      args?: Subset<T, Transaction$costObjectArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    suggestedRule<T extends Transaction$suggestedRuleArgs<ExtArgs> = {}>(
      args?: Subset<T, Transaction$suggestedRuleArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    splits<T extends Transaction$splitsArgs<ExtArgs> = {}>(
      args?: Subset<T, Transaction$splitsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionSplitPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<'Transaction', 'String'>;
    readonly date: FieldRef<'Transaction', 'DateTime'>;
    readonly amount: FieldRef<'Transaction', 'Decimal'>;
    readonly description: FieldRef<'Transaction', 'String'>;
    readonly categoryId: FieldRef<'Transaction', 'String'>;
    readonly accountId: FieldRef<'Transaction', 'String'>;
    readonly costObjectId: FieldRef<'Transaction', 'String'>;
    readonly notes: FieldRef<'Transaction', 'String'>;
    readonly suggestedCategoryId: FieldRef<'Transaction', 'String'>;
    readonly merchant: FieldRef<'Transaction', 'String'>;
    readonly suggestedByRuleId: FieldRef<'Transaction', 'String'>;
    readonly externalId: FieldRef<'Transaction', 'String'>;
    readonly createdAt: FieldRef<'Transaction', 'DateTime'>;
    readonly updatedAt: FieldRef<'Transaction', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
  };

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
  };

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyInput
    >;
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
  };

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * The data used to update Transactions.
     */
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyInput
    >;
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput;
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>;
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>;
  };

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput;
  };

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput;
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number;
  };

  /**
   * Transaction.category
   */
  export type Transaction$categoryArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * Transaction.account
   */
  export type Transaction$accountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    where?: AccountWhereInput;
  };

  /**
   * Transaction.costObject
   */
  export type Transaction$costObjectArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    where?: CostObjectWhereInput;
  };

  /**
   * Transaction.suggestedRule
   */
  export type Transaction$suggestedRuleArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    where?: CategorizationRuleWhereInput;
  };

  /**
   * Transaction.splits
   */
  export type Transaction$splitsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    where?: TransactionSplitWhereInput;
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    cursor?: TransactionSplitWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
  };

  /**
   * Model CategorizationRule
   */

  export type AggregateCategorizationRule = {
    _count: CategorizationRuleCountAggregateOutputType | null;
    _avg: CategorizationRuleAvgAggregateOutputType | null;
    _sum: CategorizationRuleSumAggregateOutputType | null;
    _min: CategorizationRuleMinAggregateOutputType | null;
    _max: CategorizationRuleMaxAggregateOutputType | null;
  };

  export type CategorizationRuleAvgAggregateOutputType = {
    priority: number | null;
    matchCount: number | null;
  };

  export type CategorizationRuleSumAggregateOutputType = {
    priority: number | null;
    matchCount: number | null;
  };

  export type CategorizationRuleMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    enabled: boolean | null;
    priority: number | null;
    categoryId: string | null;
    mode: $Enums.RuleMode | null;
    conditionsJson: string | null;
    matchCount: number | null;
    lastMatched: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CategorizationRuleMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    enabled: boolean | null;
    priority: number | null;
    categoryId: string | null;
    mode: $Enums.RuleMode | null;
    conditionsJson: string | null;
    matchCount: number | null;
    lastMatched: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type CategorizationRuleCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    enabled: number;
    priority: number;
    categoryId: number;
    mode: number;
    conditionsJson: number;
    matchCount: number;
    lastMatched: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type CategorizationRuleAvgAggregateInputType = {
    priority?: true;
    matchCount?: true;
  };

  export type CategorizationRuleSumAggregateInputType = {
    priority?: true;
    matchCount?: true;
  };

  export type CategorizationRuleMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    enabled?: true;
    priority?: true;
    categoryId?: true;
    mode?: true;
    conditionsJson?: true;
    matchCount?: true;
    lastMatched?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CategorizationRuleMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    enabled?: true;
    priority?: true;
    categoryId?: true;
    mode?: true;
    conditionsJson?: true;
    matchCount?: true;
    lastMatched?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type CategorizationRuleCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    enabled?: true;
    priority?: true;
    categoryId?: true;
    mode?: true;
    conditionsJson?: true;
    matchCount?: true;
    lastMatched?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type CategorizationRuleAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which CategorizationRule to aggregate.
     */
    where?: CategorizationRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CategorizationRules to fetch.
     */
    orderBy?:
      | CategorizationRuleOrderByWithRelationInput
      | CategorizationRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: CategorizationRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CategorizationRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CategorizationRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CategorizationRules
     **/
    _count?: true | CategorizationRuleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: CategorizationRuleAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: CategorizationRuleSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: CategorizationRuleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: CategorizationRuleMaxAggregateInputType;
  };

  export type GetCategorizationRuleAggregateType<
    T extends CategorizationRuleAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateCategorizationRule]: P extends
      | '_count'
      | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategorizationRule[P]>
      : GetScalarType<T[P], AggregateCategorizationRule[P]>;
  };

  export type CategorizationRuleGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CategorizationRuleWhereInput;
    orderBy?:
      | CategorizationRuleOrderByWithAggregationInput
      | CategorizationRuleOrderByWithAggregationInput[];
    by: CategorizationRuleScalarFieldEnum[] | CategorizationRuleScalarFieldEnum;
    having?: CategorizationRuleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CategorizationRuleCountAggregateInputType | true;
    _avg?: CategorizationRuleAvgAggregateInputType;
    _sum?: CategorizationRuleSumAggregateInputType;
    _min?: CategorizationRuleMinAggregateInputType;
    _max?: CategorizationRuleMaxAggregateInputType;
  };

  export type CategorizationRuleGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    priority: number;
    categoryId: string | null;
    mode: $Enums.RuleMode;
    conditionsJson: string;
    matchCount: number;
    lastMatched: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: CategorizationRuleCountAggregateOutputType | null;
    _avg: CategorizationRuleAvgAggregateOutputType | null;
    _sum: CategorizationRuleSumAggregateOutputType | null;
    _min: CategorizationRuleMinAggregateOutputType | null;
    _max: CategorizationRuleMaxAggregateOutputType | null;
  };

  type GetCategorizationRuleGroupByPayload<
    T extends CategorizationRuleGroupByArgs,
  > = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategorizationRuleGroupByOutputType, T['by']> & {
        [P in keyof T &
          keyof CategorizationRuleGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], CategorizationRuleGroupByOutputType[P]>
          : GetScalarType<T[P], CategorizationRuleGroupByOutputType[P]>;
      }
    >
  >;

  export type CategorizationRuleSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      enabled?: boolean;
      priority?: boolean;
      categoryId?: boolean;
      mode?: boolean;
      conditionsJson?: boolean;
      matchCount?: boolean;
      lastMatched?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
      suggestedTransactions?:
        | boolean
        | CategorizationRule$suggestedTransactionsArgs<ExtArgs>;
      _count?: boolean | CategorizationRuleCountOutputTypeDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['categorizationRule']
  >;

  export type CategorizationRuleSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      enabled?: boolean;
      priority?: boolean;
      categoryId?: boolean;
      mode?: boolean;
      conditionsJson?: boolean;
      matchCount?: boolean;
      lastMatched?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['categorizationRule']
  >;

  export type CategorizationRuleSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      enabled?: boolean;
      priority?: boolean;
      categoryId?: boolean;
      mode?: boolean;
      conditionsJson?: boolean;
      matchCount?: boolean;
      lastMatched?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['categorizationRule']
  >;

  export type CategorizationRuleSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    enabled?: boolean;
    priority?: boolean;
    categoryId?: boolean;
    mode?: boolean;
    conditionsJson?: boolean;
    matchCount?: boolean;
    lastMatched?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type CategorizationRuleOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'description'
    | 'enabled'
    | 'priority'
    | 'categoryId'
    | 'mode'
    | 'conditionsJson'
    | 'matchCount'
    | 'lastMatched'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['categorizationRule']
  >;
  export type CategorizationRuleInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
    suggestedTransactions?:
      | boolean
      | CategorizationRule$suggestedTransactionsArgs<ExtArgs>;
    _count?: boolean | CategorizationRuleCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type CategorizationRuleIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
  };
  export type CategorizationRuleIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | CategorizationRule$categoryArgs<ExtArgs>;
  };

  export type $CategorizationRulePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'CategorizationRule';
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null;
      suggestedTransactions: Prisma.$TransactionPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        description: string | null;
        enabled: boolean;
        priority: number;
        categoryId: string | null;
        mode: $Enums.RuleMode;
        conditionsJson: string;
        matchCount: number;
        lastMatched: Date | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['categorizationRule']
    >;
    composites: {};
  };

  type CategorizationRuleGetPayload<
    S extends boolean | null | undefined | CategorizationRuleDefaultArgs,
  > = $Result.GetResult<Prisma.$CategorizationRulePayload, S>;

  type CategorizationRuleCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    CategorizationRuleFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: CategorizationRuleCountAggregateInputType | true;
  };

  export interface CategorizationRuleDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['CategorizationRule'];
      meta: { name: 'CategorizationRule' };
    };
    /**
     * Find zero or one CategorizationRule that matches the filter.
     * @param {CategorizationRuleFindUniqueArgs} args - Arguments to find a CategorizationRule
     * @example
     * // Get one CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategorizationRuleFindUniqueArgs>(
      args: SelectSubset<T, CategorizationRuleFindUniqueArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one CategorizationRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategorizationRuleFindUniqueOrThrowArgs} args - Arguments to find a CategorizationRule
     * @example
     * // Get one CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategorizationRuleFindUniqueOrThrowArgs>(
      args: SelectSubset<T, CategorizationRuleFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first CategorizationRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleFindFirstArgs} args - Arguments to find a CategorizationRule
     * @example
     * // Get one CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategorizationRuleFindFirstArgs>(
      args?: SelectSubset<T, CategorizationRuleFindFirstArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first CategorizationRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleFindFirstOrThrowArgs} args - Arguments to find a CategorizationRule
     * @example
     * // Get one CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategorizationRuleFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CategorizationRuleFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more CategorizationRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CategorizationRules
     * const categorizationRules = await prisma.categorizationRule.findMany()
     *
     * // Get first 10 CategorizationRules
     * const categorizationRules = await prisma.categorizationRule.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const categorizationRuleWithIdOnly = await prisma.categorizationRule.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CategorizationRuleFindManyArgs>(
      args?: SelectSubset<T, CategorizationRuleFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a CategorizationRule.
     * @param {CategorizationRuleCreateArgs} args - Arguments to create a CategorizationRule.
     * @example
     * // Create one CategorizationRule
     * const CategorizationRule = await prisma.categorizationRule.create({
     *   data: {
     *     // ... data to create a CategorizationRule
     *   }
     * })
     *
     */
    create<T extends CategorizationRuleCreateArgs>(
      args: SelectSubset<T, CategorizationRuleCreateArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many CategorizationRules.
     * @param {CategorizationRuleCreateManyArgs} args - Arguments to create many CategorizationRules.
     * @example
     * // Create many CategorizationRules
     * const categorizationRule = await prisma.categorizationRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CategorizationRuleCreateManyArgs>(
      args?: SelectSubset<T, CategorizationRuleCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many CategorizationRules and returns the data saved in the database.
     * @param {CategorizationRuleCreateManyAndReturnArgs} args - Arguments to create many CategorizationRules.
     * @example
     * // Create many CategorizationRules
     * const categorizationRule = await prisma.categorizationRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CategorizationRules and only return the `id`
     * const categorizationRuleWithIdOnly = await prisma.categorizationRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CategorizationRuleCreateManyAndReturnArgs>(
      args?: SelectSubset<
        T,
        CategorizationRuleCreateManyAndReturnArgs<ExtArgs>
      >,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a CategorizationRule.
     * @param {CategorizationRuleDeleteArgs} args - Arguments to delete one CategorizationRule.
     * @example
     * // Delete one CategorizationRule
     * const CategorizationRule = await prisma.categorizationRule.delete({
     *   where: {
     *     // ... filter to delete one CategorizationRule
     *   }
     * })
     *
     */
    delete<T extends CategorizationRuleDeleteArgs>(
      args: SelectSubset<T, CategorizationRuleDeleteArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one CategorizationRule.
     * @param {CategorizationRuleUpdateArgs} args - Arguments to update one CategorizationRule.
     * @example
     * // Update one CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CategorizationRuleUpdateArgs>(
      args: SelectSubset<T, CategorizationRuleUpdateArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more CategorizationRules.
     * @param {CategorizationRuleDeleteManyArgs} args - Arguments to filter CategorizationRules to delete.
     * @example
     * // Delete a few CategorizationRules
     * const { count } = await prisma.categorizationRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CategorizationRuleDeleteManyArgs>(
      args?: SelectSubset<T, CategorizationRuleDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more CategorizationRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CategorizationRules
     * const categorizationRule = await prisma.categorizationRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CategorizationRuleUpdateManyArgs>(
      args: SelectSubset<T, CategorizationRuleUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more CategorizationRules and returns the data updated in the database.
     * @param {CategorizationRuleUpdateManyAndReturnArgs} args - Arguments to update many CategorizationRules.
     * @example
     * // Update many CategorizationRules
     * const categorizationRule = await prisma.categorizationRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CategorizationRules and only return the `id`
     * const categorizationRuleWithIdOnly = await prisma.categorizationRule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CategorizationRuleUpdateManyAndReturnArgs>(
      args: SelectSubset<T, CategorizationRuleUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one CategorizationRule.
     * @param {CategorizationRuleUpsertArgs} args - Arguments to update or create a CategorizationRule.
     * @example
     * // Update or create a CategorizationRule
     * const categorizationRule = await prisma.categorizationRule.upsert({
     *   create: {
     *     // ... data to create a CategorizationRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CategorizationRule we want to update
     *   }
     * })
     */
    upsert<T extends CategorizationRuleUpsertArgs>(
      args: SelectSubset<T, CategorizationRuleUpsertArgs<ExtArgs>>,
    ): Prisma__CategorizationRuleClient<
      $Result.GetResult<
        Prisma.$CategorizationRulePayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of CategorizationRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleCountArgs} args - Arguments to filter CategorizationRules to count.
     * @example
     * // Count the number of CategorizationRules
     * const count = await prisma.categorizationRule.count({
     *   where: {
     *     // ... the filter for the CategorizationRules we want to count
     *   }
     * })
     **/
    count<T extends CategorizationRuleCountArgs>(
      args?: Subset<T, CategorizationRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<
              T['select'],
              CategorizationRuleCountAggregateOutputType
            >
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a CategorizationRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends CategorizationRuleAggregateArgs>(
      args: Subset<T, CategorizationRuleAggregateArgs>,
    ): Prisma.PrismaPromise<GetCategorizationRuleAggregateType<T>>;

    /**
     * Group by CategorizationRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategorizationRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends CategorizationRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategorizationRuleGroupByArgs['orderBy'] }
        : { orderBy?: CategorizationRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, CategorizationRuleGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetCategorizationRuleGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CategorizationRule model
     */
    readonly fields: CategorizationRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CategorizationRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategorizationRuleClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    category<T extends CategorizationRule$categoryArgs<ExtArgs> = {}>(
      args?: Subset<T, CategorizationRule$categoryArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    suggestedTransactions<
      T extends CategorizationRule$suggestedTransactionsArgs<ExtArgs> = {},
    >(
      args?: Subset<T, CategorizationRule$suggestedTransactionsArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<
          Prisma.$TransactionPayload<ExtArgs>,
          T,
          'findMany',
          GlobalOmitOptions
        >
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the CategorizationRule model
   */
  interface CategorizationRuleFieldRefs {
    readonly id: FieldRef<'CategorizationRule', 'String'>;
    readonly name: FieldRef<'CategorizationRule', 'String'>;
    readonly description: FieldRef<'CategorizationRule', 'String'>;
    readonly enabled: FieldRef<'CategorizationRule', 'Boolean'>;
    readonly priority: FieldRef<'CategorizationRule', 'Int'>;
    readonly categoryId: FieldRef<'CategorizationRule', 'String'>;
    readonly mode: FieldRef<'CategorizationRule', 'RuleMode'>;
    readonly conditionsJson: FieldRef<'CategorizationRule', 'String'>;
    readonly matchCount: FieldRef<'CategorizationRule', 'Int'>;
    readonly lastMatched: FieldRef<'CategorizationRule', 'DateTime'>;
    readonly createdAt: FieldRef<'CategorizationRule', 'DateTime'>;
    readonly updatedAt: FieldRef<'CategorizationRule', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * CategorizationRule findUnique
   */
  export type CategorizationRuleFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter, which CategorizationRule to fetch.
     */
    where: CategorizationRuleWhereUniqueInput;
  };

  /**
   * CategorizationRule findUniqueOrThrow
   */
  export type CategorizationRuleFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter, which CategorizationRule to fetch.
     */
    where: CategorizationRuleWhereUniqueInput;
  };

  /**
   * CategorizationRule findFirst
   */
  export type CategorizationRuleFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter, which CategorizationRule to fetch.
     */
    where?: CategorizationRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CategorizationRules to fetch.
     */
    orderBy?:
      | CategorizationRuleOrderByWithRelationInput
      | CategorizationRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CategorizationRules.
     */
    cursor?: CategorizationRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CategorizationRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CategorizationRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CategorizationRules.
     */
    distinct?:
      | CategorizationRuleScalarFieldEnum
      | CategorizationRuleScalarFieldEnum[];
  };

  /**
   * CategorizationRule findFirstOrThrow
   */
  export type CategorizationRuleFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter, which CategorizationRule to fetch.
     */
    where?: CategorizationRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CategorizationRules to fetch.
     */
    orderBy?:
      | CategorizationRuleOrderByWithRelationInput
      | CategorizationRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CategorizationRules.
     */
    cursor?: CategorizationRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CategorizationRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CategorizationRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CategorizationRules.
     */
    distinct?:
      | CategorizationRuleScalarFieldEnum
      | CategorizationRuleScalarFieldEnum[];
  };

  /**
   * CategorizationRule findMany
   */
  export type CategorizationRuleFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter, which CategorizationRules to fetch.
     */
    where?: CategorizationRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CategorizationRules to fetch.
     */
    orderBy?:
      | CategorizationRuleOrderByWithRelationInput
      | CategorizationRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CategorizationRules.
     */
    cursor?: CategorizationRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CategorizationRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CategorizationRules.
     */
    skip?: number;
    distinct?:
      | CategorizationRuleScalarFieldEnum
      | CategorizationRuleScalarFieldEnum[];
  };

  /**
   * CategorizationRule create
   */
  export type CategorizationRuleCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * The data needed to create a CategorizationRule.
     */
    data: XOR<
      CategorizationRuleCreateInput,
      CategorizationRuleUncheckedCreateInput
    >;
  };

  /**
   * CategorizationRule createMany
   */
  export type CategorizationRuleCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many CategorizationRules.
     */
    data:
      | CategorizationRuleCreateManyInput
      | CategorizationRuleCreateManyInput[];
  };

  /**
   * CategorizationRule createManyAndReturn
   */
  export type CategorizationRuleCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * The data used to create many CategorizationRules.
     */
    data:
      | CategorizationRuleCreateManyInput
      | CategorizationRuleCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * CategorizationRule update
   */
  export type CategorizationRuleUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * The data needed to update a CategorizationRule.
     */
    data: XOR<
      CategorizationRuleUpdateInput,
      CategorizationRuleUncheckedUpdateInput
    >;
    /**
     * Choose, which CategorizationRule to update.
     */
    where: CategorizationRuleWhereUniqueInput;
  };

  /**
   * CategorizationRule updateMany
   */
  export type CategorizationRuleUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update CategorizationRules.
     */
    data: XOR<
      CategorizationRuleUpdateManyMutationInput,
      CategorizationRuleUncheckedUpdateManyInput
    >;
    /**
     * Filter which CategorizationRules to update
     */
    where?: CategorizationRuleWhereInput;
    /**
     * Limit how many CategorizationRules to update.
     */
    limit?: number;
  };

  /**
   * CategorizationRule updateManyAndReturn
   */
  export type CategorizationRuleUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * The data used to update CategorizationRules.
     */
    data: XOR<
      CategorizationRuleUpdateManyMutationInput,
      CategorizationRuleUncheckedUpdateManyInput
    >;
    /**
     * Filter which CategorizationRules to update
     */
    where?: CategorizationRuleWhereInput;
    /**
     * Limit how many CategorizationRules to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * CategorizationRule upsert
   */
  export type CategorizationRuleUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * The filter to search for the CategorizationRule to update in case it exists.
     */
    where: CategorizationRuleWhereUniqueInput;
    /**
     * In case the CategorizationRule found by the `where` argument doesn't exist, create a new CategorizationRule with this data.
     */
    create: XOR<
      CategorizationRuleCreateInput,
      CategorizationRuleUncheckedCreateInput
    >;
    /**
     * In case the CategorizationRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<
      CategorizationRuleUpdateInput,
      CategorizationRuleUncheckedUpdateInput
    >;
  };

  /**
   * CategorizationRule delete
   */
  export type CategorizationRuleDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
    /**
     * Filter which CategorizationRule to delete.
     */
    where: CategorizationRuleWhereUniqueInput;
  };

  /**
   * CategorizationRule deleteMany
   */
  export type CategorizationRuleDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which CategorizationRules to delete
     */
    where?: CategorizationRuleWhereInput;
    /**
     * Limit how many CategorizationRules to delete.
     */
    limit?: number;
  };

  /**
   * CategorizationRule.category
   */
  export type CategorizationRule$categoryArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * CategorizationRule.suggestedTransactions
   */
  export type CategorizationRule$suggestedTransactionsArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null;
    where?: TransactionWhereInput;
    orderBy?:
      | TransactionOrderByWithRelationInput
      | TransactionOrderByWithRelationInput[];
    cursor?: TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[];
  };

  /**
   * CategorizationRule without action
   */
  export type CategorizationRuleDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CategorizationRule
     */
    select?: CategorizationRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CategorizationRule
     */
    omit?: CategorizationRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategorizationRuleInclude<ExtArgs> | null;
  };

  /**
   * Model RuleSuggestion
   */

  export type AggregateRuleSuggestion = {
    _count: RuleSuggestionCountAggregateOutputType | null;
    _avg: RuleSuggestionAvgAggregateOutputType | null;
    _sum: RuleSuggestionSumAggregateOutputType | null;
    _min: RuleSuggestionMinAggregateOutputType | null;
    _max: RuleSuggestionMaxAggregateOutputType | null;
  };

  export type RuleSuggestionAvgAggregateOutputType = {
    confidence: Decimal | null;
    matchCount: number | null;
  };

  export type RuleSuggestionSumAggregateOutputType = {
    confidence: Decimal | null;
    matchCount: number | null;
  };

  export type RuleSuggestionMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    conditionsJson: string | null;
    categoryId: string | null;
    confidence: Decimal | null;
    matchCount: number | null;
    similarityType: string | null;
    sampleTxIds: string | null;
    status: $Enums.SuggestionStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type RuleSuggestionMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    conditionsJson: string | null;
    categoryId: string | null;
    confidence: Decimal | null;
    matchCount: number | null;
    similarityType: string | null;
    sampleTxIds: string | null;
    status: $Enums.SuggestionStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type RuleSuggestionCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    conditionsJson: number;
    categoryId: number;
    confidence: number;
    matchCount: number;
    similarityType: number;
    sampleTxIds: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type RuleSuggestionAvgAggregateInputType = {
    confidence?: true;
    matchCount?: true;
  };

  export type RuleSuggestionSumAggregateInputType = {
    confidence?: true;
    matchCount?: true;
  };

  export type RuleSuggestionMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    conditionsJson?: true;
    categoryId?: true;
    confidence?: true;
    matchCount?: true;
    similarityType?: true;
    sampleTxIds?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type RuleSuggestionMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    conditionsJson?: true;
    categoryId?: true;
    confidence?: true;
    matchCount?: true;
    similarityType?: true;
    sampleTxIds?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type RuleSuggestionCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    conditionsJson?: true;
    categoryId?: true;
    confidence?: true;
    matchCount?: true;
    similarityType?: true;
    sampleTxIds?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type RuleSuggestionAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which RuleSuggestion to aggregate.
     */
    where?: RuleSuggestionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RuleSuggestions to fetch.
     */
    orderBy?:
      | RuleSuggestionOrderByWithRelationInput
      | RuleSuggestionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: RuleSuggestionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RuleSuggestions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RuleSuggestions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned RuleSuggestions
     **/
    _count?: true | RuleSuggestionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: RuleSuggestionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: RuleSuggestionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: RuleSuggestionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: RuleSuggestionMaxAggregateInputType;
  };

  export type GetRuleSuggestionAggregateType<
    T extends RuleSuggestionAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateRuleSuggestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRuleSuggestion[P]>
      : GetScalarType<T[P], AggregateRuleSuggestion[P]>;
  };

  export type RuleSuggestionGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: RuleSuggestionWhereInput;
    orderBy?:
      | RuleSuggestionOrderByWithAggregationInput
      | RuleSuggestionOrderByWithAggregationInput[];
    by: RuleSuggestionScalarFieldEnum[] | RuleSuggestionScalarFieldEnum;
    having?: RuleSuggestionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RuleSuggestionCountAggregateInputType | true;
    _avg?: RuleSuggestionAvgAggregateInputType;
    _sum?: RuleSuggestionSumAggregateInputType;
    _min?: RuleSuggestionMinAggregateInputType;
    _max?: RuleSuggestionMaxAggregateInputType;
  };

  export type RuleSuggestionGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    conditionsJson: string;
    categoryId: string | null;
    confidence: Decimal;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status: $Enums.SuggestionStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: RuleSuggestionCountAggregateOutputType | null;
    _avg: RuleSuggestionAvgAggregateOutputType | null;
    _sum: RuleSuggestionSumAggregateOutputType | null;
    _min: RuleSuggestionMinAggregateOutputType | null;
    _max: RuleSuggestionMaxAggregateOutputType | null;
  };

  type GetRuleSuggestionGroupByPayload<T extends RuleSuggestionGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<RuleSuggestionGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof RuleSuggestionGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RuleSuggestionGroupByOutputType[P]>
            : GetScalarType<T[P], RuleSuggestionGroupByOutputType[P]>;
        }
      >
    >;

  export type RuleSuggestionSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      conditionsJson?: boolean;
      categoryId?: boolean;
      confidence?: boolean;
      matchCount?: boolean;
      similarityType?: boolean;
      sampleTxIds?: boolean;
      status?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['ruleSuggestion']
  >;

  export type RuleSuggestionSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      conditionsJson?: boolean;
      categoryId?: boolean;
      confidence?: boolean;
      matchCount?: boolean;
      similarityType?: boolean;
      sampleTxIds?: boolean;
      status?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['ruleSuggestion']
  >;

  export type RuleSuggestionSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      conditionsJson?: boolean;
      categoryId?: boolean;
      confidence?: boolean;
      matchCount?: boolean;
      similarityType?: boolean;
      sampleTxIds?: boolean;
      status?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['ruleSuggestion']
  >;

  export type RuleSuggestionSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    conditionsJson?: boolean;
    categoryId?: boolean;
    confidence?: boolean;
    matchCount?: boolean;
    similarityType?: boolean;
    sampleTxIds?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type RuleSuggestionOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'description'
    | 'conditionsJson'
    | 'categoryId'
    | 'confidence'
    | 'matchCount'
    | 'similarityType'
    | 'sampleTxIds'
    | 'status'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['ruleSuggestion']
  >;
  export type RuleSuggestionInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
  };
  export type RuleSuggestionIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
  };
  export type RuleSuggestionIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | RuleSuggestion$categoryArgs<ExtArgs>;
  };

  export type $RuleSuggestionPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'RuleSuggestion';
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        description: string | null;
        conditionsJson: string;
        categoryId: string | null;
        confidence: Prisma.Decimal;
        matchCount: number;
        similarityType: string;
        sampleTxIds: string;
        status: $Enums.SuggestionStatus;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['ruleSuggestion']
    >;
    composites: {};
  };

  type RuleSuggestionGetPayload<
    S extends boolean | null | undefined | RuleSuggestionDefaultArgs,
  > = $Result.GetResult<Prisma.$RuleSuggestionPayload, S>;

  type RuleSuggestionCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    RuleSuggestionFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: RuleSuggestionCountAggregateInputType | true;
  };

  export interface RuleSuggestionDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['RuleSuggestion'];
      meta: { name: 'RuleSuggestion' };
    };
    /**
     * Find zero or one RuleSuggestion that matches the filter.
     * @param {RuleSuggestionFindUniqueArgs} args - Arguments to find a RuleSuggestion
     * @example
     * // Get one RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RuleSuggestionFindUniqueArgs>(
      args: SelectSubset<T, RuleSuggestionFindUniqueArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one RuleSuggestion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RuleSuggestionFindUniqueOrThrowArgs} args - Arguments to find a RuleSuggestion
     * @example
     * // Get one RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RuleSuggestionFindUniqueOrThrowArgs>(
      args: SelectSubset<T, RuleSuggestionFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first RuleSuggestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionFindFirstArgs} args - Arguments to find a RuleSuggestion
     * @example
     * // Get one RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RuleSuggestionFindFirstArgs>(
      args?: SelectSubset<T, RuleSuggestionFindFirstArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first RuleSuggestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionFindFirstOrThrowArgs} args - Arguments to find a RuleSuggestion
     * @example
     * // Get one RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RuleSuggestionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, RuleSuggestionFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more RuleSuggestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RuleSuggestions
     * const ruleSuggestions = await prisma.ruleSuggestion.findMany()
     *
     * // Get first 10 RuleSuggestions
     * const ruleSuggestions = await prisma.ruleSuggestion.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const ruleSuggestionWithIdOnly = await prisma.ruleSuggestion.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RuleSuggestionFindManyArgs>(
      args?: SelectSubset<T, RuleSuggestionFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a RuleSuggestion.
     * @param {RuleSuggestionCreateArgs} args - Arguments to create a RuleSuggestion.
     * @example
     * // Create one RuleSuggestion
     * const RuleSuggestion = await prisma.ruleSuggestion.create({
     *   data: {
     *     // ... data to create a RuleSuggestion
     *   }
     * })
     *
     */
    create<T extends RuleSuggestionCreateArgs>(
      args: SelectSubset<T, RuleSuggestionCreateArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many RuleSuggestions.
     * @param {RuleSuggestionCreateManyArgs} args - Arguments to create many RuleSuggestions.
     * @example
     * // Create many RuleSuggestions
     * const ruleSuggestion = await prisma.ruleSuggestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RuleSuggestionCreateManyArgs>(
      args?: SelectSubset<T, RuleSuggestionCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many RuleSuggestions and returns the data saved in the database.
     * @param {RuleSuggestionCreateManyAndReturnArgs} args - Arguments to create many RuleSuggestions.
     * @example
     * // Create many RuleSuggestions
     * const ruleSuggestion = await prisma.ruleSuggestion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many RuleSuggestions and only return the `id`
     * const ruleSuggestionWithIdOnly = await prisma.ruleSuggestion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RuleSuggestionCreateManyAndReturnArgs>(
      args?: SelectSubset<T, RuleSuggestionCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a RuleSuggestion.
     * @param {RuleSuggestionDeleteArgs} args - Arguments to delete one RuleSuggestion.
     * @example
     * // Delete one RuleSuggestion
     * const RuleSuggestion = await prisma.ruleSuggestion.delete({
     *   where: {
     *     // ... filter to delete one RuleSuggestion
     *   }
     * })
     *
     */
    delete<T extends RuleSuggestionDeleteArgs>(
      args: SelectSubset<T, RuleSuggestionDeleteArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one RuleSuggestion.
     * @param {RuleSuggestionUpdateArgs} args - Arguments to update one RuleSuggestion.
     * @example
     * // Update one RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RuleSuggestionUpdateArgs>(
      args: SelectSubset<T, RuleSuggestionUpdateArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more RuleSuggestions.
     * @param {RuleSuggestionDeleteManyArgs} args - Arguments to filter RuleSuggestions to delete.
     * @example
     * // Delete a few RuleSuggestions
     * const { count } = await prisma.ruleSuggestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RuleSuggestionDeleteManyArgs>(
      args?: SelectSubset<T, RuleSuggestionDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more RuleSuggestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RuleSuggestions
     * const ruleSuggestion = await prisma.ruleSuggestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RuleSuggestionUpdateManyArgs>(
      args: SelectSubset<T, RuleSuggestionUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more RuleSuggestions and returns the data updated in the database.
     * @param {RuleSuggestionUpdateManyAndReturnArgs} args - Arguments to update many RuleSuggestions.
     * @example
     * // Update many RuleSuggestions
     * const ruleSuggestion = await prisma.ruleSuggestion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more RuleSuggestions and only return the `id`
     * const ruleSuggestionWithIdOnly = await prisma.ruleSuggestion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends RuleSuggestionUpdateManyAndReturnArgs>(
      args: SelectSubset<T, RuleSuggestionUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one RuleSuggestion.
     * @param {RuleSuggestionUpsertArgs} args - Arguments to update or create a RuleSuggestion.
     * @example
     * // Update or create a RuleSuggestion
     * const ruleSuggestion = await prisma.ruleSuggestion.upsert({
     *   create: {
     *     // ... data to create a RuleSuggestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RuleSuggestion we want to update
     *   }
     * })
     */
    upsert<T extends RuleSuggestionUpsertArgs>(
      args: SelectSubset<T, RuleSuggestionUpsertArgs<ExtArgs>>,
    ): Prisma__RuleSuggestionClient<
      $Result.GetResult<
        Prisma.$RuleSuggestionPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of RuleSuggestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionCountArgs} args - Arguments to filter RuleSuggestions to count.
     * @example
     * // Count the number of RuleSuggestions
     * const count = await prisma.ruleSuggestion.count({
     *   where: {
     *     // ... the filter for the RuleSuggestions we want to count
     *   }
     * })
     **/
    count<T extends RuleSuggestionCountArgs>(
      args?: Subset<T, RuleSuggestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RuleSuggestionCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a RuleSuggestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends RuleSuggestionAggregateArgs>(
      args: Subset<T, RuleSuggestionAggregateArgs>,
    ): Prisma.PrismaPromise<GetRuleSuggestionAggregateType<T>>;

    /**
     * Group by RuleSuggestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RuleSuggestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends RuleSuggestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RuleSuggestionGroupByArgs['orderBy'] }
        : { orderBy?: RuleSuggestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, RuleSuggestionGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetRuleSuggestionGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the RuleSuggestion model
     */
    readonly fields: RuleSuggestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RuleSuggestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RuleSuggestionClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    category<T extends RuleSuggestion$categoryArgs<ExtArgs> = {}>(
      args?: Subset<T, RuleSuggestion$categoryArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the RuleSuggestion model
   */
  interface RuleSuggestionFieldRefs {
    readonly id: FieldRef<'RuleSuggestion', 'String'>;
    readonly name: FieldRef<'RuleSuggestion', 'String'>;
    readonly description: FieldRef<'RuleSuggestion', 'String'>;
    readonly conditionsJson: FieldRef<'RuleSuggestion', 'String'>;
    readonly categoryId: FieldRef<'RuleSuggestion', 'String'>;
    readonly confidence: FieldRef<'RuleSuggestion', 'Decimal'>;
    readonly matchCount: FieldRef<'RuleSuggestion', 'Int'>;
    readonly similarityType: FieldRef<'RuleSuggestion', 'String'>;
    readonly sampleTxIds: FieldRef<'RuleSuggestion', 'String'>;
    readonly status: FieldRef<'RuleSuggestion', 'SuggestionStatus'>;
    readonly createdAt: FieldRef<'RuleSuggestion', 'DateTime'>;
    readonly updatedAt: FieldRef<'RuleSuggestion', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * RuleSuggestion findUnique
   */
  export type RuleSuggestionFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter, which RuleSuggestion to fetch.
     */
    where: RuleSuggestionWhereUniqueInput;
  };

  /**
   * RuleSuggestion findUniqueOrThrow
   */
  export type RuleSuggestionFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter, which RuleSuggestion to fetch.
     */
    where: RuleSuggestionWhereUniqueInput;
  };

  /**
   * RuleSuggestion findFirst
   */
  export type RuleSuggestionFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter, which RuleSuggestion to fetch.
     */
    where?: RuleSuggestionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RuleSuggestions to fetch.
     */
    orderBy?:
      | RuleSuggestionOrderByWithRelationInput
      | RuleSuggestionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RuleSuggestions.
     */
    cursor?: RuleSuggestionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RuleSuggestions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RuleSuggestions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RuleSuggestions.
     */
    distinct?: RuleSuggestionScalarFieldEnum | RuleSuggestionScalarFieldEnum[];
  };

  /**
   * RuleSuggestion findFirstOrThrow
   */
  export type RuleSuggestionFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter, which RuleSuggestion to fetch.
     */
    where?: RuleSuggestionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RuleSuggestions to fetch.
     */
    orderBy?:
      | RuleSuggestionOrderByWithRelationInput
      | RuleSuggestionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RuleSuggestions.
     */
    cursor?: RuleSuggestionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RuleSuggestions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RuleSuggestions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RuleSuggestions.
     */
    distinct?: RuleSuggestionScalarFieldEnum | RuleSuggestionScalarFieldEnum[];
  };

  /**
   * RuleSuggestion findMany
   */
  export type RuleSuggestionFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter, which RuleSuggestions to fetch.
     */
    where?: RuleSuggestionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RuleSuggestions to fetch.
     */
    orderBy?:
      | RuleSuggestionOrderByWithRelationInput
      | RuleSuggestionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing RuleSuggestions.
     */
    cursor?: RuleSuggestionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RuleSuggestions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RuleSuggestions.
     */
    skip?: number;
    distinct?: RuleSuggestionScalarFieldEnum | RuleSuggestionScalarFieldEnum[];
  };

  /**
   * RuleSuggestion create
   */
  export type RuleSuggestionCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * The data needed to create a RuleSuggestion.
     */
    data: XOR<RuleSuggestionCreateInput, RuleSuggestionUncheckedCreateInput>;
  };

  /**
   * RuleSuggestion createMany
   */
  export type RuleSuggestionCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many RuleSuggestions.
     */
    data: RuleSuggestionCreateManyInput | RuleSuggestionCreateManyInput[];
  };

  /**
   * RuleSuggestion createManyAndReturn
   */
  export type RuleSuggestionCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * The data used to create many RuleSuggestions.
     */
    data: RuleSuggestionCreateManyInput | RuleSuggestionCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * RuleSuggestion update
   */
  export type RuleSuggestionUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * The data needed to update a RuleSuggestion.
     */
    data: XOR<RuleSuggestionUpdateInput, RuleSuggestionUncheckedUpdateInput>;
    /**
     * Choose, which RuleSuggestion to update.
     */
    where: RuleSuggestionWhereUniqueInput;
  };

  /**
   * RuleSuggestion updateMany
   */
  export type RuleSuggestionUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update RuleSuggestions.
     */
    data: XOR<
      RuleSuggestionUpdateManyMutationInput,
      RuleSuggestionUncheckedUpdateManyInput
    >;
    /**
     * Filter which RuleSuggestions to update
     */
    where?: RuleSuggestionWhereInput;
    /**
     * Limit how many RuleSuggestions to update.
     */
    limit?: number;
  };

  /**
   * RuleSuggestion updateManyAndReturn
   */
  export type RuleSuggestionUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * The data used to update RuleSuggestions.
     */
    data: XOR<
      RuleSuggestionUpdateManyMutationInput,
      RuleSuggestionUncheckedUpdateManyInput
    >;
    /**
     * Filter which RuleSuggestions to update
     */
    where?: RuleSuggestionWhereInput;
    /**
     * Limit how many RuleSuggestions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * RuleSuggestion upsert
   */
  export type RuleSuggestionUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * The filter to search for the RuleSuggestion to update in case it exists.
     */
    where: RuleSuggestionWhereUniqueInput;
    /**
     * In case the RuleSuggestion found by the `where` argument doesn't exist, create a new RuleSuggestion with this data.
     */
    create: XOR<RuleSuggestionCreateInput, RuleSuggestionUncheckedCreateInput>;
    /**
     * In case the RuleSuggestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RuleSuggestionUpdateInput, RuleSuggestionUncheckedUpdateInput>;
  };

  /**
   * RuleSuggestion delete
   */
  export type RuleSuggestionDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
    /**
     * Filter which RuleSuggestion to delete.
     */
    where: RuleSuggestionWhereUniqueInput;
  };

  /**
   * RuleSuggestion deleteMany
   */
  export type RuleSuggestionDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which RuleSuggestions to delete
     */
    where?: RuleSuggestionWhereInput;
    /**
     * Limit how many RuleSuggestions to delete.
     */
    limit?: number;
  };

  /**
   * RuleSuggestion.category
   */
  export type RuleSuggestion$categoryArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * RuleSuggestion without action
   */
  export type RuleSuggestionDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the RuleSuggestion
     */
    select?: RuleSuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RuleSuggestion
     */
    omit?: RuleSuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RuleSuggestionInclude<ExtArgs> | null;
  };

  /**
   * Model TransactionSplit
   */

  export type AggregateTransactionSplit = {
    _count: TransactionSplitCountAggregateOutputType | null;
    _avg: TransactionSplitAvgAggregateOutputType | null;
    _sum: TransactionSplitSumAggregateOutputType | null;
    _min: TransactionSplitMinAggregateOutputType | null;
    _max: TransactionSplitMaxAggregateOutputType | null;
  };

  export type TransactionSplitAvgAggregateOutputType = {
    amount: Decimal | null;
  };

  export type TransactionSplitSumAggregateOutputType = {
    amount: Decimal | null;
  };

  export type TransactionSplitMinAggregateOutputType = {
    id: string | null;
    parentId: string | null;
    amount: Decimal | null;
    categoryId: string | null;
    costObjectId: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionSplitMaxAggregateOutputType = {
    id: string | null;
    parentId: string | null;
    amount: Decimal | null;
    categoryId: string | null;
    costObjectId: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type TransactionSplitCountAggregateOutputType = {
    id: number;
    parentId: number;
    amount: number;
    categoryId: number;
    costObjectId: number;
    description: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type TransactionSplitAvgAggregateInputType = {
    amount?: true;
  };

  export type TransactionSplitSumAggregateInputType = {
    amount?: true;
  };

  export type TransactionSplitMinAggregateInputType = {
    id?: true;
    parentId?: true;
    amount?: true;
    categoryId?: true;
    costObjectId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionSplitMaxAggregateInputType = {
    id?: true;
    parentId?: true;
    amount?: true;
    categoryId?: true;
    costObjectId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type TransactionSplitCountAggregateInputType = {
    id?: true;
    parentId?: true;
    amount?: true;
    categoryId?: true;
    costObjectId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type TransactionSplitAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which TransactionSplit to aggregate.
     */
    where?: TransactionSplitWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TransactionSplits to fetch.
     */
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: TransactionSplitWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TransactionSplits from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TransactionSplits.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TransactionSplits
     **/
    _count?: true | TransactionSplitCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: TransactionSplitAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: TransactionSplitSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: TransactionSplitMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: TransactionSplitMaxAggregateInputType;
  };

  export type GetTransactionSplitAggregateType<
    T extends TransactionSplitAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateTransactionSplit]: P extends
      | '_count'
      | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransactionSplit[P]>
      : GetScalarType<T[P], AggregateTransactionSplit[P]>;
  };

  export type TransactionSplitGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: TransactionSplitWhereInput;
    orderBy?:
      | TransactionSplitOrderByWithAggregationInput
      | TransactionSplitOrderByWithAggregationInput[];
    by: TransactionSplitScalarFieldEnum[] | TransactionSplitScalarFieldEnum;
    having?: TransactionSplitScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TransactionSplitCountAggregateInputType | true;
    _avg?: TransactionSplitAvgAggregateInputType;
    _sum?: TransactionSplitSumAggregateInputType;
    _min?: TransactionSplitMinAggregateInputType;
    _max?: TransactionSplitMaxAggregateInputType;
  };

  export type TransactionSplitGroupByOutputType = {
    id: string;
    parentId: string;
    amount: Decimal;
    categoryId: string | null;
    costObjectId: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TransactionSplitCountAggregateOutputType | null;
    _avg: TransactionSplitAvgAggregateOutputType | null;
    _sum: TransactionSplitSumAggregateOutputType | null;
    _min: TransactionSplitMinAggregateOutputType | null;
    _max: TransactionSplitMaxAggregateOutputType | null;
  };

  type GetTransactionSplitGroupByPayload<
    T extends TransactionSplitGroupByArgs,
  > = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionSplitGroupByOutputType, T['by']> & {
        [P in keyof T &
          keyof TransactionSplitGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], TransactionSplitGroupByOutputType[P]>
          : GetScalarType<T[P], TransactionSplitGroupByOutputType[P]>;
      }
    >
  >;

  export type TransactionSplitSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      parentId?: boolean;
      amount?: boolean;
      categoryId?: boolean;
      costObjectId?: boolean;
      description?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | TransactionDefaultArgs<ExtArgs>;
      category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
      costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
    },
    ExtArgs['result']['transactionSplit']
  >;

  export type TransactionSplitSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      parentId?: boolean;
      amount?: boolean;
      categoryId?: boolean;
      costObjectId?: boolean;
      description?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | TransactionDefaultArgs<ExtArgs>;
      category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
      costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
    },
    ExtArgs['result']['transactionSplit']
  >;

  export type TransactionSplitSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      parentId?: boolean;
      amount?: boolean;
      categoryId?: boolean;
      costObjectId?: boolean;
      description?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      parent?: boolean | TransactionDefaultArgs<ExtArgs>;
      category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
      costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
    },
    ExtArgs['result']['transactionSplit']
  >;

  export type TransactionSplitSelectScalar = {
    id?: boolean;
    parentId?: boolean;
    amount?: boolean;
    categoryId?: boolean;
    costObjectId?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type TransactionSplitOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'parentId'
    | 'amount'
    | 'categoryId'
    | 'costObjectId'
    | 'description'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['transactionSplit']
  >;
  export type TransactionSplitInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | TransactionDefaultArgs<ExtArgs>;
    category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
    costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
  };
  export type TransactionSplitIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | TransactionDefaultArgs<ExtArgs>;
    category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
    costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
  };
  export type TransactionSplitIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    parent?: boolean | TransactionDefaultArgs<ExtArgs>;
    category?: boolean | TransactionSplit$categoryArgs<ExtArgs>;
    costObject?: boolean | TransactionSplit$costObjectArgs<ExtArgs>;
  };

  export type $TransactionSplitPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'TransactionSplit';
    objects: {
      parent: Prisma.$TransactionPayload<ExtArgs>;
      category: Prisma.$CategoryPayload<ExtArgs> | null;
      costObject: Prisma.$CostObjectPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        parentId: string;
        amount: Prisma.Decimal;
        categoryId: string | null;
        costObjectId: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['transactionSplit']
    >;
    composites: {};
  };

  type TransactionSplitGetPayload<
    S extends boolean | null | undefined | TransactionSplitDefaultArgs,
  > = $Result.GetResult<Prisma.$TransactionSplitPayload, S>;

  type TransactionSplitCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    TransactionSplitFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: TransactionSplitCountAggregateInputType | true;
  };

  export interface TransactionSplitDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['TransactionSplit'];
      meta: { name: 'TransactionSplit' };
    };
    /**
     * Find zero or one TransactionSplit that matches the filter.
     * @param {TransactionSplitFindUniqueArgs} args - Arguments to find a TransactionSplit
     * @example
     * // Get one TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionSplitFindUniqueArgs>(
      args: SelectSubset<T, TransactionSplitFindUniqueArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one TransactionSplit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionSplitFindUniqueOrThrowArgs} args - Arguments to find a TransactionSplit
     * @example
     * // Get one TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionSplitFindUniqueOrThrowArgs>(
      args: SelectSubset<T, TransactionSplitFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first TransactionSplit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitFindFirstArgs} args - Arguments to find a TransactionSplit
     * @example
     * // Get one TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionSplitFindFirstArgs>(
      args?: SelectSubset<T, TransactionSplitFindFirstArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first TransactionSplit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitFindFirstOrThrowArgs} args - Arguments to find a TransactionSplit
     * @example
     * // Get one TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionSplitFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TransactionSplitFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more TransactionSplits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TransactionSplits
     * const transactionSplits = await prisma.transactionSplit.findMany()
     *
     * // Get first 10 TransactionSplits
     * const transactionSplits = await prisma.transactionSplit.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const transactionSplitWithIdOnly = await prisma.transactionSplit.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TransactionSplitFindManyArgs>(
      args?: SelectSubset<T, TransactionSplitFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a TransactionSplit.
     * @param {TransactionSplitCreateArgs} args - Arguments to create a TransactionSplit.
     * @example
     * // Create one TransactionSplit
     * const TransactionSplit = await prisma.transactionSplit.create({
     *   data: {
     *     // ... data to create a TransactionSplit
     *   }
     * })
     *
     */
    create<T extends TransactionSplitCreateArgs>(
      args: SelectSubset<T, TransactionSplitCreateArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many TransactionSplits.
     * @param {TransactionSplitCreateManyArgs} args - Arguments to create many TransactionSplits.
     * @example
     * // Create many TransactionSplits
     * const transactionSplit = await prisma.transactionSplit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TransactionSplitCreateManyArgs>(
      args?: SelectSubset<T, TransactionSplitCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many TransactionSplits and returns the data saved in the database.
     * @param {TransactionSplitCreateManyAndReturnArgs} args - Arguments to create many TransactionSplits.
     * @example
     * // Create many TransactionSplits
     * const transactionSplit = await prisma.transactionSplit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TransactionSplits and only return the `id`
     * const transactionSplitWithIdOnly = await prisma.transactionSplit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TransactionSplitCreateManyAndReturnArgs>(
      args?: SelectSubset<T, TransactionSplitCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a TransactionSplit.
     * @param {TransactionSplitDeleteArgs} args - Arguments to delete one TransactionSplit.
     * @example
     * // Delete one TransactionSplit
     * const TransactionSplit = await prisma.transactionSplit.delete({
     *   where: {
     *     // ... filter to delete one TransactionSplit
     *   }
     * })
     *
     */
    delete<T extends TransactionSplitDeleteArgs>(
      args: SelectSubset<T, TransactionSplitDeleteArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one TransactionSplit.
     * @param {TransactionSplitUpdateArgs} args - Arguments to update one TransactionSplit.
     * @example
     * // Update one TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TransactionSplitUpdateArgs>(
      args: SelectSubset<T, TransactionSplitUpdateArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more TransactionSplits.
     * @param {TransactionSplitDeleteManyArgs} args - Arguments to filter TransactionSplits to delete.
     * @example
     * // Delete a few TransactionSplits
     * const { count } = await prisma.transactionSplit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TransactionSplitDeleteManyArgs>(
      args?: SelectSubset<T, TransactionSplitDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more TransactionSplits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TransactionSplits
     * const transactionSplit = await prisma.transactionSplit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TransactionSplitUpdateManyArgs>(
      args: SelectSubset<T, TransactionSplitUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more TransactionSplits and returns the data updated in the database.
     * @param {TransactionSplitUpdateManyAndReturnArgs} args - Arguments to update many TransactionSplits.
     * @example
     * // Update many TransactionSplits
     * const transactionSplit = await prisma.transactionSplit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more TransactionSplits and only return the `id`
     * const transactionSplitWithIdOnly = await prisma.transactionSplit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TransactionSplitUpdateManyAndReturnArgs>(
      args: SelectSubset<T, TransactionSplitUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one TransactionSplit.
     * @param {TransactionSplitUpsertArgs} args - Arguments to update or create a TransactionSplit.
     * @example
     * // Update or create a TransactionSplit
     * const transactionSplit = await prisma.transactionSplit.upsert({
     *   create: {
     *     // ... data to create a TransactionSplit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TransactionSplit we want to update
     *   }
     * })
     */
    upsert<T extends TransactionSplitUpsertArgs>(
      args: SelectSubset<T, TransactionSplitUpsertArgs<ExtArgs>>,
    ): Prisma__TransactionSplitClient<
      $Result.GetResult<
        Prisma.$TransactionSplitPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of TransactionSplits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitCountArgs} args - Arguments to filter TransactionSplits to count.
     * @example
     * // Count the number of TransactionSplits
     * const count = await prisma.transactionSplit.count({
     *   where: {
     *     // ... the filter for the TransactionSplits we want to count
     *   }
     * })
     **/
    count<T extends TransactionSplitCountArgs>(
      args?: Subset<T, TransactionSplitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionSplitCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a TransactionSplit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends TransactionSplitAggregateArgs>(
      args: Subset<T, TransactionSplitAggregateArgs>,
    ): Prisma.PrismaPromise<GetTransactionSplitAggregateType<T>>;

    /**
     * Group by TransactionSplit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionSplitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends TransactionSplitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionSplitGroupByArgs['orderBy'] }
        : { orderBy?: TransactionSplitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, TransactionSplitGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetTransactionSplitGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TransactionSplit model
     */
    readonly fields: TransactionSplitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TransactionSplit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionSplitClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    parent<T extends TransactionDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, TransactionDefaultArgs<ExtArgs>>,
    ): Prisma__TransactionClient<
      | $Result.GetResult<
          Prisma.$TransactionPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    category<T extends TransactionSplit$categoryArgs<ExtArgs> = {}>(
      args?: Subset<T, TransactionSplit$categoryArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    costObject<T extends TransactionSplit$costObjectArgs<ExtArgs> = {}>(
      args?: Subset<T, TransactionSplit$costObjectArgs<ExtArgs>>,
    ): Prisma__CostObjectClient<
      $Result.GetResult<
        Prisma.$CostObjectPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the TransactionSplit model
   */
  interface TransactionSplitFieldRefs {
    readonly id: FieldRef<'TransactionSplit', 'String'>;
    readonly parentId: FieldRef<'TransactionSplit', 'String'>;
    readonly amount: FieldRef<'TransactionSplit', 'Decimal'>;
    readonly categoryId: FieldRef<'TransactionSplit', 'String'>;
    readonly costObjectId: FieldRef<'TransactionSplit', 'String'>;
    readonly description: FieldRef<'TransactionSplit', 'String'>;
    readonly createdAt: FieldRef<'TransactionSplit', 'DateTime'>;
    readonly updatedAt: FieldRef<'TransactionSplit', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * TransactionSplit findUnique
   */
  export type TransactionSplitFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter, which TransactionSplit to fetch.
     */
    where: TransactionSplitWhereUniqueInput;
  };

  /**
   * TransactionSplit findUniqueOrThrow
   */
  export type TransactionSplitFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter, which TransactionSplit to fetch.
     */
    where: TransactionSplitWhereUniqueInput;
  };

  /**
   * TransactionSplit findFirst
   */
  export type TransactionSplitFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter, which TransactionSplit to fetch.
     */
    where?: TransactionSplitWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TransactionSplits to fetch.
     */
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TransactionSplits.
     */
    cursor?: TransactionSplitWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TransactionSplits from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TransactionSplits.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TransactionSplits.
     */
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * TransactionSplit findFirstOrThrow
   */
  export type TransactionSplitFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter, which TransactionSplit to fetch.
     */
    where?: TransactionSplitWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TransactionSplits to fetch.
     */
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TransactionSplits.
     */
    cursor?: TransactionSplitWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TransactionSplits from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TransactionSplits.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TransactionSplits.
     */
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * TransactionSplit findMany
   */
  export type TransactionSplitFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter, which TransactionSplits to fetch.
     */
    where?: TransactionSplitWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TransactionSplits to fetch.
     */
    orderBy?:
      | TransactionSplitOrderByWithRelationInput
      | TransactionSplitOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TransactionSplits.
     */
    cursor?: TransactionSplitWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TransactionSplits from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TransactionSplits.
     */
    skip?: number;
    distinct?:
      | TransactionSplitScalarFieldEnum
      | TransactionSplitScalarFieldEnum[];
  };

  /**
   * TransactionSplit create
   */
  export type TransactionSplitCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * The data needed to create a TransactionSplit.
     */
    data: XOR<
      TransactionSplitCreateInput,
      TransactionSplitUncheckedCreateInput
    >;
  };

  /**
   * TransactionSplit createMany
   */
  export type TransactionSplitCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many TransactionSplits.
     */
    data: TransactionSplitCreateManyInput | TransactionSplitCreateManyInput[];
  };

  /**
   * TransactionSplit createManyAndReturn
   */
  export type TransactionSplitCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * The data used to create many TransactionSplits.
     */
    data: TransactionSplitCreateManyInput | TransactionSplitCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * TransactionSplit update
   */
  export type TransactionSplitUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * The data needed to update a TransactionSplit.
     */
    data: XOR<
      TransactionSplitUpdateInput,
      TransactionSplitUncheckedUpdateInput
    >;
    /**
     * Choose, which TransactionSplit to update.
     */
    where: TransactionSplitWhereUniqueInput;
  };

  /**
   * TransactionSplit updateMany
   */
  export type TransactionSplitUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update TransactionSplits.
     */
    data: XOR<
      TransactionSplitUpdateManyMutationInput,
      TransactionSplitUncheckedUpdateManyInput
    >;
    /**
     * Filter which TransactionSplits to update
     */
    where?: TransactionSplitWhereInput;
    /**
     * Limit how many TransactionSplits to update.
     */
    limit?: number;
  };

  /**
   * TransactionSplit updateManyAndReturn
   */
  export type TransactionSplitUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * The data used to update TransactionSplits.
     */
    data: XOR<
      TransactionSplitUpdateManyMutationInput,
      TransactionSplitUncheckedUpdateManyInput
    >;
    /**
     * Filter which TransactionSplits to update
     */
    where?: TransactionSplitWhereInput;
    /**
     * Limit how many TransactionSplits to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * TransactionSplit upsert
   */
  export type TransactionSplitUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * The filter to search for the TransactionSplit to update in case it exists.
     */
    where: TransactionSplitWhereUniqueInput;
    /**
     * In case the TransactionSplit found by the `where` argument doesn't exist, create a new TransactionSplit with this data.
     */
    create: XOR<
      TransactionSplitCreateInput,
      TransactionSplitUncheckedCreateInput
    >;
    /**
     * In case the TransactionSplit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<
      TransactionSplitUpdateInput,
      TransactionSplitUncheckedUpdateInput
    >;
  };

  /**
   * TransactionSplit delete
   */
  export type TransactionSplitDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
    /**
     * Filter which TransactionSplit to delete.
     */
    where: TransactionSplitWhereUniqueInput;
  };

  /**
   * TransactionSplit deleteMany
   */
  export type TransactionSplitDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which TransactionSplits to delete
     */
    where?: TransactionSplitWhereInput;
    /**
     * Limit how many TransactionSplits to delete.
     */
    limit?: number;
  };

  /**
   * TransactionSplit.category
   */
  export type TransactionSplit$categoryArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * TransactionSplit.costObject
   */
  export type TransactionSplit$costObjectArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CostObject
     */
    select?: CostObjectSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CostObject
     */
    omit?: CostObjectOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CostObjectInclude<ExtArgs> | null;
    where?: CostObjectWhereInput;
  };

  /**
   * TransactionSplit without action
   */
  export type TransactionSplitDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the TransactionSplit
     */
    select?: TransactionSplitSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TransactionSplit
     */
    omit?: TransactionSplitOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionSplitInclude<ExtArgs> | null;
  };

  /**
   * Model SavingsGoal
   */

  export type AggregateSavingsGoal = {
    _count: SavingsGoalCountAggregateOutputType | null;
    _avg: SavingsGoalAvgAggregateOutputType | null;
    _sum: SavingsGoalSumAggregateOutputType | null;
    _min: SavingsGoalMinAggregateOutputType | null;
    _max: SavingsGoalMaxAggregateOutputType | null;
  };

  export type SavingsGoalAvgAggregateOutputType = {
    targetAmount: Decimal | null;
    savedAmount: Decimal | null;
    targetMonths: number | null;
  };

  export type SavingsGoalSumAggregateOutputType = {
    targetAmount: Decimal | null;
    savedAmount: Decimal | null;
    targetMonths: number | null;
  };

  export type SavingsGoalMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    targetAmount: Decimal | null;
    startDate: Date | null;
    targetDate: Date | null;
    savedAmount: Decimal | null;
    isEvergreen: boolean | null;
    targetMonths: number | null;
    categoryId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type SavingsGoalMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    targetAmount: Decimal | null;
    startDate: Date | null;
    targetDate: Date | null;
    savedAmount: Decimal | null;
    isEvergreen: boolean | null;
    targetMonths: number | null;
    categoryId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type SavingsGoalCountAggregateOutputType = {
    id: number;
    name: number;
    targetAmount: number;
    startDate: number;
    targetDate: number;
    savedAmount: number;
    isEvergreen: number;
    targetMonths: number;
    categoryId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type SavingsGoalAvgAggregateInputType = {
    targetAmount?: true;
    savedAmount?: true;
    targetMonths?: true;
  };

  export type SavingsGoalSumAggregateInputType = {
    targetAmount?: true;
    savedAmount?: true;
    targetMonths?: true;
  };

  export type SavingsGoalMinAggregateInputType = {
    id?: true;
    name?: true;
    targetAmount?: true;
    startDate?: true;
    targetDate?: true;
    savedAmount?: true;
    isEvergreen?: true;
    targetMonths?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type SavingsGoalMaxAggregateInputType = {
    id?: true;
    name?: true;
    targetAmount?: true;
    startDate?: true;
    targetDate?: true;
    savedAmount?: true;
    isEvergreen?: true;
    targetMonths?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type SavingsGoalCountAggregateInputType = {
    id?: true;
    name?: true;
    targetAmount?: true;
    startDate?: true;
    targetDate?: true;
    savedAmount?: true;
    isEvergreen?: true;
    targetMonths?: true;
    categoryId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type SavingsGoalAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SavingsGoal to aggregate.
     */
    where?: SavingsGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SavingsGoals to fetch.
     */
    orderBy?:
      | SavingsGoalOrderByWithRelationInput
      | SavingsGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SavingsGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SavingsGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SavingsGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned SavingsGoals
     **/
    _count?: true | SavingsGoalCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: SavingsGoalAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: SavingsGoalSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SavingsGoalMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SavingsGoalMaxAggregateInputType;
  };

  export type GetSavingsGoalAggregateType<T extends SavingsGoalAggregateArgs> =
    {
      [P in keyof T & keyof AggregateSavingsGoal]: P extends '_count' | 'count'
        ? T[P] extends true
          ? number
          : GetScalarType<T[P], AggregateSavingsGoal[P]>
        : GetScalarType<T[P], AggregateSavingsGoal[P]>;
    };

  export type SavingsGoalGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SavingsGoalWhereInput;
    orderBy?:
      | SavingsGoalOrderByWithAggregationInput
      | SavingsGoalOrderByWithAggregationInput[];
    by: SavingsGoalScalarFieldEnum[] | SavingsGoalScalarFieldEnum;
    having?: SavingsGoalScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SavingsGoalCountAggregateInputType | true;
    _avg?: SavingsGoalAvgAggregateInputType;
    _sum?: SavingsGoalSumAggregateInputType;
    _min?: SavingsGoalMinAggregateInputType;
    _max?: SavingsGoalMaxAggregateInputType;
  };

  export type SavingsGoalGroupByOutputType = {
    id: string;
    name: string;
    targetAmount: Decimal;
    startDate: Date;
    targetDate: Date | null;
    savedAmount: Decimal;
    isEvergreen: boolean;
    targetMonths: number | null;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: SavingsGoalCountAggregateOutputType | null;
    _avg: SavingsGoalAvgAggregateOutputType | null;
    _sum: SavingsGoalSumAggregateOutputType | null;
    _min: SavingsGoalMinAggregateOutputType | null;
    _max: SavingsGoalMaxAggregateOutputType | null;
  };

  type GetSavingsGoalGroupByPayload<T extends SavingsGoalGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<SavingsGoalGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof SavingsGoalGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SavingsGoalGroupByOutputType[P]>
            : GetScalarType<T[P], SavingsGoalGroupByOutputType[P]>;
        }
      >
    >;

  export type SavingsGoalSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      targetAmount?: boolean;
      startDate?: boolean;
      targetDate?: boolean;
      savedAmount?: boolean;
      isEvergreen?: boolean;
      targetMonths?: boolean;
      categoryId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['savingsGoal']
  >;

  export type SavingsGoalSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      targetAmount?: boolean;
      startDate?: boolean;
      targetDate?: boolean;
      savedAmount?: boolean;
      isEvergreen?: boolean;
      targetMonths?: boolean;
      categoryId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['savingsGoal']
  >;

  export type SavingsGoalSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      targetAmount?: boolean;
      startDate?: boolean;
      targetDate?: boolean;
      savedAmount?: boolean;
      isEvergreen?: boolean;
      targetMonths?: boolean;
      categoryId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
    },
    ExtArgs['result']['savingsGoal']
  >;

  export type SavingsGoalSelectScalar = {
    id?: boolean;
    name?: boolean;
    targetAmount?: boolean;
    startDate?: boolean;
    targetDate?: boolean;
    savedAmount?: boolean;
    isEvergreen?: boolean;
    targetMonths?: boolean;
    categoryId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type SavingsGoalOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'name'
    | 'targetAmount'
    | 'startDate'
    | 'targetDate'
    | 'savedAmount'
    | 'isEvergreen'
    | 'targetMonths'
    | 'categoryId'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['savingsGoal']
  >;
  export type SavingsGoalInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
  };
  export type SavingsGoalIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
  };
  export type SavingsGoalIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    category?: boolean | SavingsGoal$categoryArgs<ExtArgs>;
  };

  export type $SavingsGoalPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'SavingsGoal';
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        targetAmount: Prisma.Decimal;
        startDate: Date;
        targetDate: Date | null;
        savedAmount: Prisma.Decimal;
        isEvergreen: boolean;
        targetMonths: number | null;
        categoryId: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['savingsGoal']
    >;
    composites: {};
  };

  type SavingsGoalGetPayload<
    S extends boolean | null | undefined | SavingsGoalDefaultArgs,
  > = $Result.GetResult<Prisma.$SavingsGoalPayload, S>;

  type SavingsGoalCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    SavingsGoalFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: SavingsGoalCountAggregateInputType | true;
  };

  export interface SavingsGoalDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['SavingsGoal'];
      meta: { name: 'SavingsGoal' };
    };
    /**
     * Find zero or one SavingsGoal that matches the filter.
     * @param {SavingsGoalFindUniqueArgs} args - Arguments to find a SavingsGoal
     * @example
     * // Get one SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SavingsGoalFindUniqueArgs>(
      args: SelectSubset<T, SavingsGoalFindUniqueArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one SavingsGoal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SavingsGoalFindUniqueOrThrowArgs} args - Arguments to find a SavingsGoal
     * @example
     * // Get one SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SavingsGoalFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SavingsGoalFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SavingsGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalFindFirstArgs} args - Arguments to find a SavingsGoal
     * @example
     * // Get one SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SavingsGoalFindFirstArgs>(
      args?: SelectSubset<T, SavingsGoalFindFirstArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first SavingsGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalFindFirstOrThrowArgs} args - Arguments to find a SavingsGoal
     * @example
     * // Get one SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SavingsGoalFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SavingsGoalFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more SavingsGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SavingsGoals
     * const savingsGoals = await prisma.savingsGoal.findMany()
     *
     * // Get first 10 SavingsGoals
     * const savingsGoals = await prisma.savingsGoal.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const savingsGoalWithIdOnly = await prisma.savingsGoal.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SavingsGoalFindManyArgs>(
      args?: SelectSubset<T, SavingsGoalFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a SavingsGoal.
     * @param {SavingsGoalCreateArgs} args - Arguments to create a SavingsGoal.
     * @example
     * // Create one SavingsGoal
     * const SavingsGoal = await prisma.savingsGoal.create({
     *   data: {
     *     // ... data to create a SavingsGoal
     *   }
     * })
     *
     */
    create<T extends SavingsGoalCreateArgs>(
      args: SelectSubset<T, SavingsGoalCreateArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many SavingsGoals.
     * @param {SavingsGoalCreateManyArgs} args - Arguments to create many SavingsGoals.
     * @example
     * // Create many SavingsGoals
     * const savingsGoal = await prisma.savingsGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SavingsGoalCreateManyArgs>(
      args?: SelectSubset<T, SavingsGoalCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many SavingsGoals and returns the data saved in the database.
     * @param {SavingsGoalCreateManyAndReturnArgs} args - Arguments to create many SavingsGoals.
     * @example
     * // Create many SavingsGoals
     * const savingsGoal = await prisma.savingsGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many SavingsGoals and only return the `id`
     * const savingsGoalWithIdOnly = await prisma.savingsGoal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SavingsGoalCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SavingsGoalCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a SavingsGoal.
     * @param {SavingsGoalDeleteArgs} args - Arguments to delete one SavingsGoal.
     * @example
     * // Delete one SavingsGoal
     * const SavingsGoal = await prisma.savingsGoal.delete({
     *   where: {
     *     // ... filter to delete one SavingsGoal
     *   }
     * })
     *
     */
    delete<T extends SavingsGoalDeleteArgs>(
      args: SelectSubset<T, SavingsGoalDeleteArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one SavingsGoal.
     * @param {SavingsGoalUpdateArgs} args - Arguments to update one SavingsGoal.
     * @example
     * // Update one SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SavingsGoalUpdateArgs>(
      args: SelectSubset<T, SavingsGoalUpdateArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more SavingsGoals.
     * @param {SavingsGoalDeleteManyArgs} args - Arguments to filter SavingsGoals to delete.
     * @example
     * // Delete a few SavingsGoals
     * const { count } = await prisma.savingsGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SavingsGoalDeleteManyArgs>(
      args?: SelectSubset<T, SavingsGoalDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SavingsGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SavingsGoals
     * const savingsGoal = await prisma.savingsGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SavingsGoalUpdateManyArgs>(
      args: SelectSubset<T, SavingsGoalUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more SavingsGoals and returns the data updated in the database.
     * @param {SavingsGoalUpdateManyAndReturnArgs} args - Arguments to update many SavingsGoals.
     * @example
     * // Update many SavingsGoals
     * const savingsGoal = await prisma.savingsGoal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more SavingsGoals and only return the `id`
     * const savingsGoalWithIdOnly = await prisma.savingsGoal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SavingsGoalUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SavingsGoalUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one SavingsGoal.
     * @param {SavingsGoalUpsertArgs} args - Arguments to update or create a SavingsGoal.
     * @example
     * // Update or create a SavingsGoal
     * const savingsGoal = await prisma.savingsGoal.upsert({
     *   create: {
     *     // ... data to create a SavingsGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SavingsGoal we want to update
     *   }
     * })
     */
    upsert<T extends SavingsGoalUpsertArgs>(
      args: SelectSubset<T, SavingsGoalUpsertArgs<ExtArgs>>,
    ): Prisma__SavingsGoalClient<
      $Result.GetResult<
        Prisma.$SavingsGoalPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of SavingsGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalCountArgs} args - Arguments to filter SavingsGoals to count.
     * @example
     * // Count the number of SavingsGoals
     * const count = await prisma.savingsGoal.count({
     *   where: {
     *     // ... the filter for the SavingsGoals we want to count
     *   }
     * })
     **/
    count<T extends SavingsGoalCountArgs>(
      args?: Subset<T, SavingsGoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SavingsGoalCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a SavingsGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SavingsGoalAggregateArgs>(
      args: Subset<T, SavingsGoalAggregateArgs>,
    ): Prisma.PrismaPromise<GetSavingsGoalAggregateType<T>>;

    /**
     * Group by SavingsGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavingsGoalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SavingsGoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SavingsGoalGroupByArgs['orderBy'] }
        : { orderBy?: SavingsGoalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SavingsGoalGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetSavingsGoalGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the SavingsGoal model
     */
    readonly fields: SavingsGoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SavingsGoal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SavingsGoalClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    category<T extends SavingsGoal$categoryArgs<ExtArgs> = {}>(
      args?: Subset<T, SavingsGoal$categoryArgs<ExtArgs>>,
    ): Prisma__CategoryClient<
      $Result.GetResult<
        Prisma.$CategoryPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the SavingsGoal model
   */
  interface SavingsGoalFieldRefs {
    readonly id: FieldRef<'SavingsGoal', 'String'>;
    readonly name: FieldRef<'SavingsGoal', 'String'>;
    readonly targetAmount: FieldRef<'SavingsGoal', 'Decimal'>;
    readonly startDate: FieldRef<'SavingsGoal', 'DateTime'>;
    readonly targetDate: FieldRef<'SavingsGoal', 'DateTime'>;
    readonly savedAmount: FieldRef<'SavingsGoal', 'Decimal'>;
    readonly isEvergreen: FieldRef<'SavingsGoal', 'Boolean'>;
    readonly targetMonths: FieldRef<'SavingsGoal', 'Int'>;
    readonly categoryId: FieldRef<'SavingsGoal', 'String'>;
    readonly createdAt: FieldRef<'SavingsGoal', 'DateTime'>;
    readonly updatedAt: FieldRef<'SavingsGoal', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * SavingsGoal findUnique
   */
  export type SavingsGoalFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter, which SavingsGoal to fetch.
     */
    where: SavingsGoalWhereUniqueInput;
  };

  /**
   * SavingsGoal findUniqueOrThrow
   */
  export type SavingsGoalFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter, which SavingsGoal to fetch.
     */
    where: SavingsGoalWhereUniqueInput;
  };

  /**
   * SavingsGoal findFirst
   */
  export type SavingsGoalFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter, which SavingsGoal to fetch.
     */
    where?: SavingsGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SavingsGoals to fetch.
     */
    orderBy?:
      | SavingsGoalOrderByWithRelationInput
      | SavingsGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SavingsGoals.
     */
    cursor?: SavingsGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SavingsGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SavingsGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SavingsGoals.
     */
    distinct?: SavingsGoalScalarFieldEnum | SavingsGoalScalarFieldEnum[];
  };

  /**
   * SavingsGoal findFirstOrThrow
   */
  export type SavingsGoalFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter, which SavingsGoal to fetch.
     */
    where?: SavingsGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SavingsGoals to fetch.
     */
    orderBy?:
      | SavingsGoalOrderByWithRelationInput
      | SavingsGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SavingsGoals.
     */
    cursor?: SavingsGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SavingsGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SavingsGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SavingsGoals.
     */
    distinct?: SavingsGoalScalarFieldEnum | SavingsGoalScalarFieldEnum[];
  };

  /**
   * SavingsGoal findMany
   */
  export type SavingsGoalFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter, which SavingsGoals to fetch.
     */
    where?: SavingsGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SavingsGoals to fetch.
     */
    orderBy?:
      | SavingsGoalOrderByWithRelationInput
      | SavingsGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing SavingsGoals.
     */
    cursor?: SavingsGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SavingsGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SavingsGoals.
     */
    skip?: number;
    distinct?: SavingsGoalScalarFieldEnum | SavingsGoalScalarFieldEnum[];
  };

  /**
   * SavingsGoal create
   */
  export type SavingsGoalCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * The data needed to create a SavingsGoal.
     */
    data: XOR<SavingsGoalCreateInput, SavingsGoalUncheckedCreateInput>;
  };

  /**
   * SavingsGoal createMany
   */
  export type SavingsGoalCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many SavingsGoals.
     */
    data: SavingsGoalCreateManyInput | SavingsGoalCreateManyInput[];
  };

  /**
   * SavingsGoal createManyAndReturn
   */
  export type SavingsGoalCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * The data used to create many SavingsGoals.
     */
    data: SavingsGoalCreateManyInput | SavingsGoalCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * SavingsGoal update
   */
  export type SavingsGoalUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * The data needed to update a SavingsGoal.
     */
    data: XOR<SavingsGoalUpdateInput, SavingsGoalUncheckedUpdateInput>;
    /**
     * Choose, which SavingsGoal to update.
     */
    where: SavingsGoalWhereUniqueInput;
  };

  /**
   * SavingsGoal updateMany
   */
  export type SavingsGoalUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update SavingsGoals.
     */
    data: XOR<
      SavingsGoalUpdateManyMutationInput,
      SavingsGoalUncheckedUpdateManyInput
    >;
    /**
     * Filter which SavingsGoals to update
     */
    where?: SavingsGoalWhereInput;
    /**
     * Limit how many SavingsGoals to update.
     */
    limit?: number;
  };

  /**
   * SavingsGoal updateManyAndReturn
   */
  export type SavingsGoalUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * The data used to update SavingsGoals.
     */
    data: XOR<
      SavingsGoalUpdateManyMutationInput,
      SavingsGoalUncheckedUpdateManyInput
    >;
    /**
     * Filter which SavingsGoals to update
     */
    where?: SavingsGoalWhereInput;
    /**
     * Limit how many SavingsGoals to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * SavingsGoal upsert
   */
  export type SavingsGoalUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * The filter to search for the SavingsGoal to update in case it exists.
     */
    where: SavingsGoalWhereUniqueInput;
    /**
     * In case the SavingsGoal found by the `where` argument doesn't exist, create a new SavingsGoal with this data.
     */
    create: XOR<SavingsGoalCreateInput, SavingsGoalUncheckedCreateInput>;
    /**
     * In case the SavingsGoal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SavingsGoalUpdateInput, SavingsGoalUncheckedUpdateInput>;
  };

  /**
   * SavingsGoal delete
   */
  export type SavingsGoalDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
    /**
     * Filter which SavingsGoal to delete.
     */
    where: SavingsGoalWhereUniqueInput;
  };

  /**
   * SavingsGoal deleteMany
   */
  export type SavingsGoalDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which SavingsGoals to delete
     */
    where?: SavingsGoalWhereInput;
    /**
     * Limit how many SavingsGoals to delete.
     */
    limit?: number;
  };

  /**
   * SavingsGoal.category
   */
  export type SavingsGoal$categoryArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null;
    where?: CategoryWhereInput;
  };

  /**
   * SavingsGoal without action
   */
  export type SavingsGoalDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the SavingsGoal
     */
    select?: SavingsGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SavingsGoal
     */
    omit?: SavingsGoalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavingsGoalInclude<ExtArgs> | null;
  };

  /**
   * Model Setting
   */

  export type AggregateSetting = {
    _count: SettingCountAggregateOutputType | null;
    _min: SettingMinAggregateOutputType | null;
    _max: SettingMaxAggregateOutputType | null;
  };

  export type SettingMinAggregateOutputType = {
    key: string | null;
    value: string | null;
  };

  export type SettingMaxAggregateOutputType = {
    key: string | null;
    value: string | null;
  };

  export type SettingCountAggregateOutputType = {
    key: number;
    value: number;
    _all: number;
  };

  export type SettingMinAggregateInputType = {
    key?: true;
    value?: true;
  };

  export type SettingMaxAggregateInputType = {
    key?: true;
    value?: true;
  };

  export type SettingCountAggregateInputType = {
    key?: true;
    value?: true;
    _all?: true;
  };

  export type SettingAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Setting to aggregate.
     */
    where?: SettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Settings to fetch.
     */
    orderBy?:
      | SettingOrderByWithRelationInput
      | SettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: SettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Settings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Settings
     **/
    _count?: true | SettingCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: SettingMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: SettingMaxAggregateInputType;
  };

  export type GetSettingAggregateType<T extends SettingAggregateArgs> = {
    [P in keyof T & keyof AggregateSetting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSetting[P]>
      : GetScalarType<T[P], AggregateSetting[P]>;
  };

  export type SettingGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: SettingWhereInput;
    orderBy?:
      | SettingOrderByWithAggregationInput
      | SettingOrderByWithAggregationInput[];
    by: SettingScalarFieldEnum[] | SettingScalarFieldEnum;
    having?: SettingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SettingCountAggregateInputType | true;
    _min?: SettingMinAggregateInputType;
    _max?: SettingMaxAggregateInputType;
  };

  export type SettingGroupByOutputType = {
    key: string;
    value: string;
    _count: SettingCountAggregateOutputType | null;
    _min: SettingMinAggregateOutputType | null;
    _max: SettingMaxAggregateOutputType | null;
  };

  type GetSettingGroupByPayload<T extends SettingGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<SettingGroupByOutputType, T['by']> & {
          [P in keyof T & keyof SettingGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingGroupByOutputType[P]>
            : GetScalarType<T[P], SettingGroupByOutputType[P]>;
        }
      >
    >;

  export type SettingSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      key?: boolean;
      value?: boolean;
    },
    ExtArgs['result']['setting']
  >;

  export type SettingSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      key?: boolean;
      value?: boolean;
    },
    ExtArgs['result']['setting']
  >;

  export type SettingSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      key?: boolean;
      value?: boolean;
    },
    ExtArgs['result']['setting']
  >;

  export type SettingSelectScalar = {
    key?: boolean;
    value?: boolean;
  };

  export type SettingOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<'key' | 'value', ExtArgs['result']['setting']>;

  export type $SettingPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'Setting';
    objects: {};
    scalars: $Extensions.GetPayloadResult<
      {
        key: string;
        value: string;
      },
      ExtArgs['result']['setting']
    >;
    composites: {};
  };

  type SettingGetPayload<
    S extends boolean | null | undefined | SettingDefaultArgs,
  > = $Result.GetResult<Prisma.$SettingPayload, S>;

  type SettingCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<SettingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SettingCountAggregateInputType | true;
  };

  export interface SettingDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Setting'];
      meta: { name: 'Setting' };
    };
    /**
     * Find zero or one Setting that matches the filter.
     * @param {SettingFindUniqueArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingFindUniqueArgs>(
      args: SelectSubset<T, SettingFindUniqueArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Setting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingFindUniqueOrThrowArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingFindUniqueOrThrowArgs>(
      args: SelectSubset<T, SettingFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Setting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindFirstArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingFindFirstArgs>(
      args?: SelectSubset<T, SettingFindFirstArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Setting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindFirstOrThrowArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SettingFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.setting.findMany()
     *
     * // Get first 10 Settings
     * const settings = await prisma.setting.findMany({ take: 10 })
     *
     * // Only select the `key`
     * const settingWithKeyOnly = await prisma.setting.findMany({ select: { key: true } })
     *
     */
    findMany<T extends SettingFindManyArgs>(
      args?: SelectSubset<T, SettingFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a Setting.
     * @param {SettingCreateArgs} args - Arguments to create a Setting.
     * @example
     * // Create one Setting
     * const Setting = await prisma.setting.create({
     *   data: {
     *     // ... data to create a Setting
     *   }
     * })
     *
     */
    create<T extends SettingCreateArgs>(
      args: SelectSubset<T, SettingCreateArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Settings.
     * @param {SettingCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const setting = await prisma.setting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SettingCreateManyArgs>(
      args?: SelectSubset<T, SettingCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const setting = await prisma.setting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Settings and only return the `key`
     * const settingWithKeyOnly = await prisma.setting.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SettingCreateManyAndReturnArgs>(
      args?: SelectSubset<T, SettingCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Setting.
     * @param {SettingDeleteArgs} args - Arguments to delete one Setting.
     * @example
     * // Delete one Setting
     * const Setting = await prisma.setting.delete({
     *   where: {
     *     // ... filter to delete one Setting
     *   }
     * })
     *
     */
    delete<T extends SettingDeleteArgs>(
      args: SelectSubset<T, SettingDeleteArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Setting.
     * @param {SettingUpdateArgs} args - Arguments to update one Setting.
     * @example
     * // Update one Setting
     * const setting = await prisma.setting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SettingUpdateArgs>(
      args: SelectSubset<T, SettingUpdateArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Settings.
     * @param {SettingDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.setting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SettingDeleteManyArgs>(
      args?: SelectSubset<T, SettingDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const setting = await prisma.setting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SettingUpdateManyArgs>(
      args: SelectSubset<T, SettingUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const setting = await prisma.setting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Settings and only return the `key`
     * const settingWithKeyOnly = await prisma.setting.updateManyAndReturn({
     *   select: { key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SettingUpdateManyAndReturnArgs>(
      args: SelectSubset<T, SettingUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Setting.
     * @param {SettingUpsertArgs} args - Arguments to update or create a Setting.
     * @example
     * // Update or create a Setting
     * const setting = await prisma.setting.upsert({
     *   create: {
     *     // ... data to create a Setting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Setting we want to update
     *   }
     * })
     */
    upsert<T extends SettingUpsertArgs>(
      args: SelectSubset<T, SettingUpsertArgs<ExtArgs>>,
    ): Prisma__SettingClient<
      $Result.GetResult<
        Prisma.$SettingPayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.setting.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
     **/
    count<T extends SettingCountArgs>(
      args?: Subset<T, SettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Setting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends SettingAggregateArgs>(
      args: Subset<T, SettingAggregateArgs>,
    ): Prisma.PrismaPromise<GetSettingAggregateType<T>>;

    /**
     * Group by Setting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends SettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingGroupByArgs['orderBy'] }
        : { orderBy?: SettingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, SettingGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetSettingGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Setting model
     */
    readonly fields: SettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Setting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Setting model
   */
  interface SettingFieldRefs {
    readonly key: FieldRef<'Setting', 'String'>;
    readonly value: FieldRef<'Setting', 'String'>;
  }

  // Custom InputTypes
  /**
   * Setting findUnique
   */
  export type SettingFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter, which Setting to fetch.
     */
    where: SettingWhereUniqueInput;
  };

  /**
   * Setting findUniqueOrThrow
   */
  export type SettingFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter, which Setting to fetch.
     */
    where: SettingWhereUniqueInput;
  };

  /**
   * Setting findFirst
   */
  export type SettingFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter, which Setting to fetch.
     */
    where?: SettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Settings to fetch.
     */
    orderBy?:
      | SettingOrderByWithRelationInput
      | SettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Settings.
     */
    cursor?: SettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Settings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[];
  };

  /**
   * Setting findFirstOrThrow
   */
  export type SettingFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter, which Setting to fetch.
     */
    where?: SettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Settings to fetch.
     */
    orderBy?:
      | SettingOrderByWithRelationInput
      | SettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Settings.
     */
    cursor?: SettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Settings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[];
  };

  /**
   * Setting findMany
   */
  export type SettingFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Settings to fetch.
     */
    orderBy?:
      | SettingOrderByWithRelationInput
      | SettingOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Settings.
     */
    cursor?: SettingWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Settings.
     */
    skip?: number;
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[];
  };

  /**
   * Setting create
   */
  export type SettingCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * The data needed to create a Setting.
     */
    data: XOR<SettingCreateInput, SettingUncheckedCreateInput>;
  };

  /**
   * Setting createMany
   */
  export type SettingCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Settings.
     */
    data: SettingCreateManyInput | SettingCreateManyInput[];
  };

  /**
   * Setting createManyAndReturn
   */
  export type SettingCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * The data used to create many Settings.
     */
    data: SettingCreateManyInput | SettingCreateManyInput[];
  };

  /**
   * Setting update
   */
  export type SettingUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * The data needed to update a Setting.
     */
    data: XOR<SettingUpdateInput, SettingUncheckedUpdateInput>;
    /**
     * Choose, which Setting to update.
     */
    where: SettingWhereUniqueInput;
  };

  /**
   * Setting updateMany
   */
  export type SettingUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingUpdateManyMutationInput, SettingUncheckedUpdateManyInput>;
    /**
     * Filter which Settings to update
     */
    where?: SettingWhereInput;
    /**
     * Limit how many Settings to update.
     */
    limit?: number;
  };

  /**
   * Setting updateManyAndReturn
   */
  export type SettingUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingUpdateManyMutationInput, SettingUncheckedUpdateManyInput>;
    /**
     * Filter which Settings to update
     */
    where?: SettingWhereInput;
    /**
     * Limit how many Settings to update.
     */
    limit?: number;
  };

  /**
   * Setting upsert
   */
  export type SettingUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * The filter to search for the Setting to update in case it exists.
     */
    where: SettingWhereUniqueInput;
    /**
     * In case the Setting found by the `where` argument doesn't exist, create a new Setting with this data.
     */
    create: XOR<SettingCreateInput, SettingUncheckedCreateInput>;
    /**
     * In case the Setting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingUpdateInput, SettingUncheckedUpdateInput>;
  };

  /**
   * Setting delete
   */
  export type SettingDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
    /**
     * Filter which Setting to delete.
     */
    where: SettingWhereUniqueInput;
  };

  /**
   * Setting deleteMany
   */
  export type SettingDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingWhereInput;
    /**
     * Limit how many Settings to delete.
     */
    limit?: number;
  };

  /**
   * Setting without action
   */
  export type SettingDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null;
  };

  /**
   * Model MonthlyBalance
   */

  export type AggregateMonthlyBalance = {
    _count: MonthlyBalanceCountAggregateOutputType | null;
    _avg: MonthlyBalanceAvgAggregateOutputType | null;
    _sum: MonthlyBalanceSumAggregateOutputType | null;
    _min: MonthlyBalanceMinAggregateOutputType | null;
    _max: MonthlyBalanceMaxAggregateOutputType | null;
  };

  export type MonthlyBalanceAvgAggregateOutputType = {
    balance: Decimal | null;
  };

  export type MonthlyBalanceSumAggregateOutputType = {
    balance: Decimal | null;
  };

  export type MonthlyBalanceMinAggregateOutputType = {
    id: string | null;
    month: string | null;
    balance: Decimal | null;
    accountId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type MonthlyBalanceMaxAggregateOutputType = {
    id: string | null;
    month: string | null;
    balance: Decimal | null;
    accountId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type MonthlyBalanceCountAggregateOutputType = {
    id: number;
    month: number;
    balance: number;
    accountId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type MonthlyBalanceAvgAggregateInputType = {
    balance?: true;
  };

  export type MonthlyBalanceSumAggregateInputType = {
    balance?: true;
  };

  export type MonthlyBalanceMinAggregateInputType = {
    id?: true;
    month?: true;
    balance?: true;
    accountId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type MonthlyBalanceMaxAggregateInputType = {
    id?: true;
    month?: true;
    balance?: true;
    accountId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type MonthlyBalanceCountAggregateInputType = {
    id?: true;
    month?: true;
    balance?: true;
    accountId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type MonthlyBalanceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which MonthlyBalance to aggregate.
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MonthlyBalances to fetch.
     */
    orderBy?:
      | MonthlyBalanceOrderByWithRelationInput
      | MonthlyBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: MonthlyBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MonthlyBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MonthlyBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MonthlyBalances
     **/
    _count?: true | MonthlyBalanceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: MonthlyBalanceAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: MonthlyBalanceSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: MonthlyBalanceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: MonthlyBalanceMaxAggregateInputType;
  };

  export type GetMonthlyBalanceAggregateType<
    T extends MonthlyBalanceAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateMonthlyBalance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMonthlyBalance[P]>
      : GetScalarType<T[P], AggregateMonthlyBalance[P]>;
  };

  export type MonthlyBalanceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: MonthlyBalanceWhereInput;
    orderBy?:
      | MonthlyBalanceOrderByWithAggregationInput
      | MonthlyBalanceOrderByWithAggregationInput[];
    by: MonthlyBalanceScalarFieldEnum[] | MonthlyBalanceScalarFieldEnum;
    having?: MonthlyBalanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MonthlyBalanceCountAggregateInputType | true;
    _avg?: MonthlyBalanceAvgAggregateInputType;
    _sum?: MonthlyBalanceSumAggregateInputType;
    _min?: MonthlyBalanceMinAggregateInputType;
    _max?: MonthlyBalanceMaxAggregateInputType;
  };

  export type MonthlyBalanceGroupByOutputType = {
    id: string;
    month: string;
    balance: Decimal;
    accountId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MonthlyBalanceCountAggregateOutputType | null;
    _avg: MonthlyBalanceAvgAggregateOutputType | null;
    _sum: MonthlyBalanceSumAggregateOutputType | null;
    _min: MonthlyBalanceMinAggregateOutputType | null;
    _max: MonthlyBalanceMaxAggregateOutputType | null;
  };

  type GetMonthlyBalanceGroupByPayload<T extends MonthlyBalanceGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<MonthlyBalanceGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof MonthlyBalanceGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MonthlyBalanceGroupByOutputType[P]>
            : GetScalarType<T[P], MonthlyBalanceGroupByOutputType[P]>;
        }
      >
    >;

  export type MonthlyBalanceSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      month?: boolean;
      balance?: boolean;
      accountId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['monthlyBalance']
  >;

  export type MonthlyBalanceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      month?: boolean;
      balance?: boolean;
      accountId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['monthlyBalance']
  >;

  export type MonthlyBalanceSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      month?: boolean;
      balance?: boolean;
      accountId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['monthlyBalance']
  >;

  export type MonthlyBalanceSelectScalar = {
    id?: boolean;
    month?: boolean;
    balance?: boolean;
    accountId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type MonthlyBalanceOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    'id' | 'month' | 'balance' | 'accountId' | 'createdAt' | 'updatedAt',
    ExtArgs['result']['monthlyBalance']
  >;
  export type MonthlyBalanceInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
  };
  export type MonthlyBalanceIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
  };
  export type MonthlyBalanceIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | MonthlyBalance$accountArgs<ExtArgs>;
  };

  export type $MonthlyBalancePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'MonthlyBalance';
    objects: {
      account: Prisma.$AccountPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        month: string;
        balance: Prisma.Decimal;
        accountId: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['monthlyBalance']
    >;
    composites: {};
  };

  type MonthlyBalanceGetPayload<
    S extends boolean | null | undefined | MonthlyBalanceDefaultArgs,
  > = $Result.GetResult<Prisma.$MonthlyBalancePayload, S>;

  type MonthlyBalanceCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    MonthlyBalanceFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: MonthlyBalanceCountAggregateInputType | true;
  };

  export interface MonthlyBalanceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['MonthlyBalance'];
      meta: { name: 'MonthlyBalance' };
    };
    /**
     * Find zero or one MonthlyBalance that matches the filter.
     * @param {MonthlyBalanceFindUniqueArgs} args - Arguments to find a MonthlyBalance
     * @example
     * // Get one MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MonthlyBalanceFindUniqueArgs>(
      args: SelectSubset<T, MonthlyBalanceFindUniqueArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one MonthlyBalance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MonthlyBalanceFindUniqueOrThrowArgs} args - Arguments to find a MonthlyBalance
     * @example
     * // Get one MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MonthlyBalanceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, MonthlyBalanceFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first MonthlyBalance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceFindFirstArgs} args - Arguments to find a MonthlyBalance
     * @example
     * // Get one MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MonthlyBalanceFindFirstArgs>(
      args?: SelectSubset<T, MonthlyBalanceFindFirstArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first MonthlyBalance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceFindFirstOrThrowArgs} args - Arguments to find a MonthlyBalance
     * @example
     * // Get one MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MonthlyBalanceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, MonthlyBalanceFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more MonthlyBalances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MonthlyBalances
     * const monthlyBalances = await prisma.monthlyBalance.findMany()
     *
     * // Get first 10 MonthlyBalances
     * const monthlyBalances = await prisma.monthlyBalance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const monthlyBalanceWithIdOnly = await prisma.monthlyBalance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MonthlyBalanceFindManyArgs>(
      args?: SelectSubset<T, MonthlyBalanceFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a MonthlyBalance.
     * @param {MonthlyBalanceCreateArgs} args - Arguments to create a MonthlyBalance.
     * @example
     * // Create one MonthlyBalance
     * const MonthlyBalance = await prisma.monthlyBalance.create({
     *   data: {
     *     // ... data to create a MonthlyBalance
     *   }
     * })
     *
     */
    create<T extends MonthlyBalanceCreateArgs>(
      args: SelectSubset<T, MonthlyBalanceCreateArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many MonthlyBalances.
     * @param {MonthlyBalanceCreateManyArgs} args - Arguments to create many MonthlyBalances.
     * @example
     * // Create many MonthlyBalances
     * const monthlyBalance = await prisma.monthlyBalance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MonthlyBalanceCreateManyArgs>(
      args?: SelectSubset<T, MonthlyBalanceCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many MonthlyBalances and returns the data saved in the database.
     * @param {MonthlyBalanceCreateManyAndReturnArgs} args - Arguments to create many MonthlyBalances.
     * @example
     * // Create many MonthlyBalances
     * const monthlyBalance = await prisma.monthlyBalance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MonthlyBalances and only return the `id`
     * const monthlyBalanceWithIdOnly = await prisma.monthlyBalance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MonthlyBalanceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, MonthlyBalanceCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a MonthlyBalance.
     * @param {MonthlyBalanceDeleteArgs} args - Arguments to delete one MonthlyBalance.
     * @example
     * // Delete one MonthlyBalance
     * const MonthlyBalance = await prisma.monthlyBalance.delete({
     *   where: {
     *     // ... filter to delete one MonthlyBalance
     *   }
     * })
     *
     */
    delete<T extends MonthlyBalanceDeleteArgs>(
      args: SelectSubset<T, MonthlyBalanceDeleteArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one MonthlyBalance.
     * @param {MonthlyBalanceUpdateArgs} args - Arguments to update one MonthlyBalance.
     * @example
     * // Update one MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MonthlyBalanceUpdateArgs>(
      args: SelectSubset<T, MonthlyBalanceUpdateArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more MonthlyBalances.
     * @param {MonthlyBalanceDeleteManyArgs} args - Arguments to filter MonthlyBalances to delete.
     * @example
     * // Delete a few MonthlyBalances
     * const { count } = await prisma.monthlyBalance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MonthlyBalanceDeleteManyArgs>(
      args?: SelectSubset<T, MonthlyBalanceDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more MonthlyBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MonthlyBalances
     * const monthlyBalance = await prisma.monthlyBalance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MonthlyBalanceUpdateManyArgs>(
      args: SelectSubset<T, MonthlyBalanceUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more MonthlyBalances and returns the data updated in the database.
     * @param {MonthlyBalanceUpdateManyAndReturnArgs} args - Arguments to update many MonthlyBalances.
     * @example
     * // Update many MonthlyBalances
     * const monthlyBalance = await prisma.monthlyBalance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MonthlyBalances and only return the `id`
     * const monthlyBalanceWithIdOnly = await prisma.monthlyBalance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends MonthlyBalanceUpdateManyAndReturnArgs>(
      args: SelectSubset<T, MonthlyBalanceUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one MonthlyBalance.
     * @param {MonthlyBalanceUpsertArgs} args - Arguments to update or create a MonthlyBalance.
     * @example
     * // Update or create a MonthlyBalance
     * const monthlyBalance = await prisma.monthlyBalance.upsert({
     *   create: {
     *     // ... data to create a MonthlyBalance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MonthlyBalance we want to update
     *   }
     * })
     */
    upsert<T extends MonthlyBalanceUpsertArgs>(
      args: SelectSubset<T, MonthlyBalanceUpsertArgs<ExtArgs>>,
    ): Prisma__MonthlyBalanceClient<
      $Result.GetResult<
        Prisma.$MonthlyBalancePayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of MonthlyBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceCountArgs} args - Arguments to filter MonthlyBalances to count.
     * @example
     * // Count the number of MonthlyBalances
     * const count = await prisma.monthlyBalance.count({
     *   where: {
     *     // ... the filter for the MonthlyBalances we want to count
     *   }
     * })
     **/
    count<T extends MonthlyBalanceCountArgs>(
      args?: Subset<T, MonthlyBalanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MonthlyBalanceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a MonthlyBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends MonthlyBalanceAggregateArgs>(
      args: Subset<T, MonthlyBalanceAggregateArgs>,
    ): Prisma.PrismaPromise<GetMonthlyBalanceAggregateType<T>>;

    /**
     * Group by MonthlyBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyBalanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends MonthlyBalanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MonthlyBalanceGroupByArgs['orderBy'] }
        : { orderBy?: MonthlyBalanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, MonthlyBalanceGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetMonthlyBalanceGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MonthlyBalance model
     */
    readonly fields: MonthlyBalanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MonthlyBalance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MonthlyBalanceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    account<T extends MonthlyBalance$accountArgs<ExtArgs> = {}>(
      args?: Subset<T, MonthlyBalance$accountArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the MonthlyBalance model
   */
  interface MonthlyBalanceFieldRefs {
    readonly id: FieldRef<'MonthlyBalance', 'String'>;
    readonly month: FieldRef<'MonthlyBalance', 'String'>;
    readonly balance: FieldRef<'MonthlyBalance', 'Decimal'>;
    readonly accountId: FieldRef<'MonthlyBalance', 'String'>;
    readonly createdAt: FieldRef<'MonthlyBalance', 'DateTime'>;
    readonly updatedAt: FieldRef<'MonthlyBalance', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * MonthlyBalance findUnique
   */
  export type MonthlyBalanceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which MonthlyBalance to fetch.
     */
    where: MonthlyBalanceWhereUniqueInput;
  };

  /**
   * MonthlyBalance findUniqueOrThrow
   */
  export type MonthlyBalanceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which MonthlyBalance to fetch.
     */
    where: MonthlyBalanceWhereUniqueInput;
  };

  /**
   * MonthlyBalance findFirst
   */
  export type MonthlyBalanceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which MonthlyBalance to fetch.
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MonthlyBalances to fetch.
     */
    orderBy?:
      | MonthlyBalanceOrderByWithRelationInput
      | MonthlyBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MonthlyBalances.
     */
    cursor?: MonthlyBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MonthlyBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MonthlyBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MonthlyBalances.
     */
    distinct?: MonthlyBalanceScalarFieldEnum | MonthlyBalanceScalarFieldEnum[];
  };

  /**
   * MonthlyBalance findFirstOrThrow
   */
  export type MonthlyBalanceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which MonthlyBalance to fetch.
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MonthlyBalances to fetch.
     */
    orderBy?:
      | MonthlyBalanceOrderByWithRelationInput
      | MonthlyBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MonthlyBalances.
     */
    cursor?: MonthlyBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MonthlyBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MonthlyBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MonthlyBalances.
     */
    distinct?: MonthlyBalanceScalarFieldEnum | MonthlyBalanceScalarFieldEnum[];
  };

  /**
   * MonthlyBalance findMany
   */
  export type MonthlyBalanceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which MonthlyBalances to fetch.
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MonthlyBalances to fetch.
     */
    orderBy?:
      | MonthlyBalanceOrderByWithRelationInput
      | MonthlyBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MonthlyBalances.
     */
    cursor?: MonthlyBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MonthlyBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MonthlyBalances.
     */
    skip?: number;
    distinct?: MonthlyBalanceScalarFieldEnum | MonthlyBalanceScalarFieldEnum[];
  };

  /**
   * MonthlyBalance create
   */
  export type MonthlyBalanceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * The data needed to create a MonthlyBalance.
     */
    data: XOR<MonthlyBalanceCreateInput, MonthlyBalanceUncheckedCreateInput>;
  };

  /**
   * MonthlyBalance createMany
   */
  export type MonthlyBalanceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many MonthlyBalances.
     */
    data: MonthlyBalanceCreateManyInput | MonthlyBalanceCreateManyInput[];
  };

  /**
   * MonthlyBalance createManyAndReturn
   */
  export type MonthlyBalanceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * The data used to create many MonthlyBalances.
     */
    data: MonthlyBalanceCreateManyInput | MonthlyBalanceCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * MonthlyBalance update
   */
  export type MonthlyBalanceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * The data needed to update a MonthlyBalance.
     */
    data: XOR<MonthlyBalanceUpdateInput, MonthlyBalanceUncheckedUpdateInput>;
    /**
     * Choose, which MonthlyBalance to update.
     */
    where: MonthlyBalanceWhereUniqueInput;
  };

  /**
   * MonthlyBalance updateMany
   */
  export type MonthlyBalanceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update MonthlyBalances.
     */
    data: XOR<
      MonthlyBalanceUpdateManyMutationInput,
      MonthlyBalanceUncheckedUpdateManyInput
    >;
    /**
     * Filter which MonthlyBalances to update
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * Limit how many MonthlyBalances to update.
     */
    limit?: number;
  };

  /**
   * MonthlyBalance updateManyAndReturn
   */
  export type MonthlyBalanceUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * The data used to update MonthlyBalances.
     */
    data: XOR<
      MonthlyBalanceUpdateManyMutationInput,
      MonthlyBalanceUncheckedUpdateManyInput
    >;
    /**
     * Filter which MonthlyBalances to update
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * Limit how many MonthlyBalances to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * MonthlyBalance upsert
   */
  export type MonthlyBalanceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * The filter to search for the MonthlyBalance to update in case it exists.
     */
    where: MonthlyBalanceWhereUniqueInput;
    /**
     * In case the MonthlyBalance found by the `where` argument doesn't exist, create a new MonthlyBalance with this data.
     */
    create: XOR<MonthlyBalanceCreateInput, MonthlyBalanceUncheckedCreateInput>;
    /**
     * In case the MonthlyBalance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MonthlyBalanceUpdateInput, MonthlyBalanceUncheckedUpdateInput>;
  };

  /**
   * MonthlyBalance delete
   */
  export type MonthlyBalanceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
    /**
     * Filter which MonthlyBalance to delete.
     */
    where: MonthlyBalanceWhereUniqueInput;
  };

  /**
   * MonthlyBalance deleteMany
   */
  export type MonthlyBalanceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which MonthlyBalances to delete
     */
    where?: MonthlyBalanceWhereInput;
    /**
     * Limit how many MonthlyBalances to delete.
     */
    limit?: number;
  };

  /**
   * MonthlyBalance.account
   */
  export type MonthlyBalance$accountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    where?: AccountWhereInput;
  };

  /**
   * MonthlyBalance without action
   */
  export type MonthlyBalanceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the MonthlyBalance
     */
    select?: MonthlyBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MonthlyBalance
     */
    omit?: MonthlyBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MonthlyBalanceInclude<ExtArgs> | null;
  };

  /**
   * Model AccountBalance
   */

  export type AggregateAccountBalance = {
    _count: AccountBalanceCountAggregateOutputType | null;
    _avg: AccountBalanceAvgAggregateOutputType | null;
    _sum: AccountBalanceSumAggregateOutputType | null;
    _min: AccountBalanceMinAggregateOutputType | null;
    _max: AccountBalanceMaxAggregateOutputType | null;
  };

  export type AccountBalanceAvgAggregateOutputType = {
    balance: Decimal | null;
  };

  export type AccountBalanceSumAggregateOutputType = {
    balance: Decimal | null;
  };

  export type AccountBalanceMinAggregateOutputType = {
    id: string | null;
    asOfDate: Date | null;
    balance: Decimal | null;
    accountId: string | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type AccountBalanceMaxAggregateOutputType = {
    id: string | null;
    asOfDate: Date | null;
    balance: Decimal | null;
    accountId: string | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type AccountBalanceCountAggregateOutputType = {
    id: number;
    asOfDate: number;
    balance: number;
    accountId: number;
    notes: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type AccountBalanceAvgAggregateInputType = {
    balance?: true;
  };

  export type AccountBalanceSumAggregateInputType = {
    balance?: true;
  };

  export type AccountBalanceMinAggregateInputType = {
    id?: true;
    asOfDate?: true;
    balance?: true;
    accountId?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type AccountBalanceMaxAggregateInputType = {
    id?: true;
    asOfDate?: true;
    balance?: true;
    accountId?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type AccountBalanceCountAggregateInputType = {
    id?: true;
    asOfDate?: true;
    balance?: true;
    accountId?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type AccountBalanceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which AccountBalance to aggregate.
     */
    where?: AccountBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AccountBalances to fetch.
     */
    orderBy?:
      | AccountBalanceOrderByWithRelationInput
      | AccountBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: AccountBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AccountBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AccountBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AccountBalances
     **/
    _count?: true | AccountBalanceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: AccountBalanceAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: AccountBalanceSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: AccountBalanceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: AccountBalanceMaxAggregateInputType;
  };

  export type GetAccountBalanceAggregateType<
    T extends AccountBalanceAggregateArgs,
  > = {
    [P in keyof T & keyof AggregateAccountBalance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccountBalance[P]>
      : GetScalarType<T[P], AggregateAccountBalance[P]>;
  };

  export type AccountBalanceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: AccountBalanceWhereInput;
    orderBy?:
      | AccountBalanceOrderByWithAggregationInput
      | AccountBalanceOrderByWithAggregationInput[];
    by: AccountBalanceScalarFieldEnum[] | AccountBalanceScalarFieldEnum;
    having?: AccountBalanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AccountBalanceCountAggregateInputType | true;
    _avg?: AccountBalanceAvgAggregateInputType;
    _sum?: AccountBalanceSumAggregateInputType;
    _min?: AccountBalanceMinAggregateInputType;
    _max?: AccountBalanceMaxAggregateInputType;
  };

  export type AccountBalanceGroupByOutputType = {
    id: string;
    asOfDate: Date;
    balance: Decimal;
    accountId: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: AccountBalanceCountAggregateOutputType | null;
    _avg: AccountBalanceAvgAggregateOutputType | null;
    _sum: AccountBalanceSumAggregateOutputType | null;
    _min: AccountBalanceMinAggregateOutputType | null;
    _max: AccountBalanceMaxAggregateOutputType | null;
  };

  type GetAccountBalanceGroupByPayload<T extends AccountBalanceGroupByArgs> =
    Prisma.PrismaPromise<
      Array<
        PickEnumerable<AccountBalanceGroupByOutputType, T['by']> & {
          [P in keyof T &
            keyof AccountBalanceGroupByOutputType]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountBalanceGroupByOutputType[P]>
            : GetScalarType<T[P], AccountBalanceGroupByOutputType[P]>;
        }
      >
    >;

  export type AccountBalanceSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      asOfDate?: boolean;
      balance?: boolean;
      accountId?: boolean;
      notes?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | AccountBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['accountBalance']
  >;

  export type AccountBalanceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      asOfDate?: boolean;
      balance?: boolean;
      accountId?: boolean;
      notes?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | AccountBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['accountBalance']
  >;

  export type AccountBalanceSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      asOfDate?: boolean;
      balance?: boolean;
      accountId?: boolean;
      notes?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      account?: boolean | AccountBalance$accountArgs<ExtArgs>;
    },
    ExtArgs['result']['accountBalance']
  >;

  export type AccountBalanceSelectScalar = {
    id?: boolean;
    asOfDate?: boolean;
    balance?: boolean;
    accountId?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type AccountBalanceOmit<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetOmit<
    | 'id'
    | 'asOfDate'
    | 'balance'
    | 'accountId'
    | 'notes'
    | 'createdAt'
    | 'updatedAt',
    ExtArgs['result']['accountBalance']
  >;
  export type AccountBalanceInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | AccountBalance$accountArgs<ExtArgs>;
  };
  export type AccountBalanceIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | AccountBalance$accountArgs<ExtArgs>;
  };
  export type AccountBalanceIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    account?: boolean | AccountBalance$accountArgs<ExtArgs>;
  };

  export type $AccountBalancePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'AccountBalance';
    objects: {
      account: Prisma.$AccountPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        asOfDate: Date;
        balance: Prisma.Decimal;
        accountId: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs['result']['accountBalance']
    >;
    composites: {};
  };

  type AccountBalanceGetPayload<
    S extends boolean | null | undefined | AccountBalanceDefaultArgs,
  > = $Result.GetResult<Prisma.$AccountBalancePayload, S>;

  type AccountBalanceCountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = Omit<
    AccountBalanceFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: AccountBalanceCountAggregateInputType | true;
  };

  export interface AccountBalanceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['AccountBalance'];
      meta: { name: 'AccountBalance' };
    };
    /**
     * Find zero or one AccountBalance that matches the filter.
     * @param {AccountBalanceFindUniqueArgs} args - Arguments to find a AccountBalance
     * @example
     * // Get one AccountBalance
     * const accountBalance = await prisma.accountBalance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountBalanceFindUniqueArgs>(
      args: SelectSubset<T, AccountBalanceFindUniqueArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one AccountBalance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountBalanceFindUniqueOrThrowArgs} args - Arguments to find a AccountBalance
     * @example
     * // Get one AccountBalance
     * const accountBalance = await prisma.accountBalance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountBalanceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, AccountBalanceFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first AccountBalance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceFindFirstArgs} args - Arguments to find a AccountBalance
     * @example
     * // Get one AccountBalance
     * const accountBalance = await prisma.accountBalance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountBalanceFindFirstArgs>(
      args?: SelectSubset<T, AccountBalanceFindFirstArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first AccountBalance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceFindFirstOrThrowArgs} args - Arguments to find a AccountBalance
     * @example
     * // Get one AccountBalance
     * const accountBalance = await prisma.accountBalance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountBalanceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AccountBalanceFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more AccountBalances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccountBalances
     * const accountBalances = await prisma.accountBalance.findMany()
     *
     * // Get first 10 AccountBalances
     * const accountBalances = await prisma.accountBalance.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const accountBalanceWithIdOnly = await prisma.accountBalance.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AccountBalanceFindManyArgs>(
      args?: SelectSubset<T, AccountBalanceFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'findMany',
        GlobalOmitOptions
      >
    >;

    /**
     * Create a AccountBalance.
     * @param {AccountBalanceCreateArgs} args - Arguments to create a AccountBalance.
     * @example
     * // Create one AccountBalance
     * const AccountBalance = await prisma.accountBalance.create({
     *   data: {
     *     // ... data to create a AccountBalance
     *   }
     * })
     *
     */
    create<T extends AccountBalanceCreateArgs>(
      args: SelectSubset<T, AccountBalanceCreateArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'create',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many AccountBalances.
     * @param {AccountBalanceCreateManyArgs} args - Arguments to create many AccountBalances.
     * @example
     * // Create many AccountBalances
     * const accountBalance = await prisma.accountBalance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AccountBalanceCreateManyArgs>(
      args?: SelectSubset<T, AccountBalanceCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many AccountBalances and returns the data saved in the database.
     * @param {AccountBalanceCreateManyAndReturnArgs} args - Arguments to create many AccountBalances.
     * @example
     * // Create many AccountBalances
     * const accountBalance = await prisma.accountBalance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AccountBalances and only return the `id`
     * const accountBalanceWithIdOnly = await prisma.accountBalance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AccountBalanceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, AccountBalanceCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a AccountBalance.
     * @param {AccountBalanceDeleteArgs} args - Arguments to delete one AccountBalance.
     * @example
     * // Delete one AccountBalance
     * const AccountBalance = await prisma.accountBalance.delete({
     *   where: {
     *     // ... filter to delete one AccountBalance
     *   }
     * })
     *
     */
    delete<T extends AccountBalanceDeleteArgs>(
      args: SelectSubset<T, AccountBalanceDeleteArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'delete',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one AccountBalance.
     * @param {AccountBalanceUpdateArgs} args - Arguments to update one AccountBalance.
     * @example
     * // Update one AccountBalance
     * const accountBalance = await prisma.accountBalance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AccountBalanceUpdateArgs>(
      args: SelectSubset<T, AccountBalanceUpdateArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'update',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more AccountBalances.
     * @param {AccountBalanceDeleteManyArgs} args - Arguments to filter AccountBalances to delete.
     * @example
     * // Delete a few AccountBalances
     * const { count } = await prisma.accountBalance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AccountBalanceDeleteManyArgs>(
      args?: SelectSubset<T, AccountBalanceDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AccountBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccountBalances
     * const accountBalance = await prisma.accountBalance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AccountBalanceUpdateManyArgs>(
      args: SelectSubset<T, AccountBalanceUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more AccountBalances and returns the data updated in the database.
     * @param {AccountBalanceUpdateManyAndReturnArgs} args - Arguments to update many AccountBalances.
     * @example
     * // Update many AccountBalances
     * const accountBalance = await prisma.accountBalance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more AccountBalances and only return the `id`
     * const accountBalanceWithIdOnly = await prisma.accountBalance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends AccountBalanceUpdateManyAndReturnArgs>(
      args: SelectSubset<T, AccountBalanceUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one AccountBalance.
     * @param {AccountBalanceUpsertArgs} args - Arguments to update or create a AccountBalance.
     * @example
     * // Update or create a AccountBalance
     * const accountBalance = await prisma.accountBalance.upsert({
     *   create: {
     *     // ... data to create a AccountBalance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccountBalance we want to update
     *   }
     * })
     */
    upsert<T extends AccountBalanceUpsertArgs>(
      args: SelectSubset<T, AccountBalanceUpsertArgs<ExtArgs>>,
    ): Prisma__AccountBalanceClient<
      $Result.GetResult<
        Prisma.$AccountBalancePayload<ExtArgs>,
        T,
        'upsert',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of AccountBalances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceCountArgs} args - Arguments to filter AccountBalances to count.
     * @example
     * // Count the number of AccountBalances
     * const count = await prisma.accountBalance.count({
     *   where: {
     *     // ... the filter for the AccountBalances we want to count
     *   }
     * })
     **/
    count<T extends AccountBalanceCountArgs>(
      args?: Subset<T, AccountBalanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountBalanceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a AccountBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends AccountBalanceAggregateArgs>(
      args: Subset<T, AccountBalanceAggregateArgs>,
    ): Prisma.PrismaPromise<GetAccountBalanceAggregateType<T>>;

    /**
     * Group by AccountBalance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountBalanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends AccountBalanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountBalanceGroupByArgs['orderBy'] }
        : { orderBy?: AccountBalanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<
        Keys<MaybeTupleToUnion<T['orderBy']>>
      >,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [
                      Error,
                      'Field ',
                      P,
                      ` in "having" needs to be provided in "by"`,
                    ];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, AccountBalanceGroupByArgs, OrderByArg> &
        InputErrors,
    ): {} extends InputErrors
      ? GetAccountBalanceGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AccountBalance model
     */
    readonly fields: AccountBalanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccountBalance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountBalanceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    account<T extends AccountBalance$accountArgs<ExtArgs> = {}>(
      args?: Subset<T, AccountBalance$accountArgs<ExtArgs>>,
    ): Prisma__AccountClient<
      $Result.GetResult<
        Prisma.$AccountPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the AccountBalance model
   */
  interface AccountBalanceFieldRefs {
    readonly id: FieldRef<'AccountBalance', 'String'>;
    readonly asOfDate: FieldRef<'AccountBalance', 'DateTime'>;
    readonly balance: FieldRef<'AccountBalance', 'Decimal'>;
    readonly accountId: FieldRef<'AccountBalance', 'String'>;
    readonly notes: FieldRef<'AccountBalance', 'String'>;
    readonly createdAt: FieldRef<'AccountBalance', 'DateTime'>;
    readonly updatedAt: FieldRef<'AccountBalance', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * AccountBalance findUnique
   */
  export type AccountBalanceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which AccountBalance to fetch.
     */
    where: AccountBalanceWhereUniqueInput;
  };

  /**
   * AccountBalance findUniqueOrThrow
   */
  export type AccountBalanceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which AccountBalance to fetch.
     */
    where: AccountBalanceWhereUniqueInput;
  };

  /**
   * AccountBalance findFirst
   */
  export type AccountBalanceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which AccountBalance to fetch.
     */
    where?: AccountBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AccountBalances to fetch.
     */
    orderBy?:
      | AccountBalanceOrderByWithRelationInput
      | AccountBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AccountBalances.
     */
    cursor?: AccountBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AccountBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AccountBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AccountBalances.
     */
    distinct?: AccountBalanceScalarFieldEnum | AccountBalanceScalarFieldEnum[];
  };

  /**
   * AccountBalance findFirstOrThrow
   */
  export type AccountBalanceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which AccountBalance to fetch.
     */
    where?: AccountBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AccountBalances to fetch.
     */
    orderBy?:
      | AccountBalanceOrderByWithRelationInput
      | AccountBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AccountBalances.
     */
    cursor?: AccountBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AccountBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AccountBalances.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AccountBalances.
     */
    distinct?: AccountBalanceScalarFieldEnum | AccountBalanceScalarFieldEnum[];
  };

  /**
   * AccountBalance findMany
   */
  export type AccountBalanceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter, which AccountBalances to fetch.
     */
    where?: AccountBalanceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AccountBalances to fetch.
     */
    orderBy?:
      | AccountBalanceOrderByWithRelationInput
      | AccountBalanceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AccountBalances.
     */
    cursor?: AccountBalanceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AccountBalances from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AccountBalances.
     */
    skip?: number;
    distinct?: AccountBalanceScalarFieldEnum | AccountBalanceScalarFieldEnum[];
  };

  /**
   * AccountBalance create
   */
  export type AccountBalanceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * The data needed to create a AccountBalance.
     */
    data: XOR<AccountBalanceCreateInput, AccountBalanceUncheckedCreateInput>;
  };

  /**
   * AccountBalance createMany
   */
  export type AccountBalanceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many AccountBalances.
     */
    data: AccountBalanceCreateManyInput | AccountBalanceCreateManyInput[];
  };

  /**
   * AccountBalance createManyAndReturn
   */
  export type AccountBalanceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * The data used to create many AccountBalances.
     */
    data: AccountBalanceCreateManyInput | AccountBalanceCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AccountBalance update
   */
  export type AccountBalanceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * The data needed to update a AccountBalance.
     */
    data: XOR<AccountBalanceUpdateInput, AccountBalanceUncheckedUpdateInput>;
    /**
     * Choose, which AccountBalance to update.
     */
    where: AccountBalanceWhereUniqueInput;
  };

  /**
   * AccountBalance updateMany
   */
  export type AccountBalanceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update AccountBalances.
     */
    data: XOR<
      AccountBalanceUpdateManyMutationInput,
      AccountBalanceUncheckedUpdateManyInput
    >;
    /**
     * Filter which AccountBalances to update
     */
    where?: AccountBalanceWhereInput;
    /**
     * Limit how many AccountBalances to update.
     */
    limit?: number;
  };

  /**
   * AccountBalance updateManyAndReturn
   */
  export type AccountBalanceUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * The data used to update AccountBalances.
     */
    data: XOR<
      AccountBalanceUpdateManyMutationInput,
      AccountBalanceUncheckedUpdateManyInput
    >;
    /**
     * Filter which AccountBalances to update
     */
    where?: AccountBalanceWhereInput;
    /**
     * Limit how many AccountBalances to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * AccountBalance upsert
   */
  export type AccountBalanceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * The filter to search for the AccountBalance to update in case it exists.
     */
    where: AccountBalanceWhereUniqueInput;
    /**
     * In case the AccountBalance found by the `where` argument doesn't exist, create a new AccountBalance with this data.
     */
    create: XOR<AccountBalanceCreateInput, AccountBalanceUncheckedCreateInput>;
    /**
     * In case the AccountBalance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountBalanceUpdateInput, AccountBalanceUncheckedUpdateInput>;
  };

  /**
   * AccountBalance delete
   */
  export type AccountBalanceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
    /**
     * Filter which AccountBalance to delete.
     */
    where: AccountBalanceWhereUniqueInput;
  };

  /**
   * AccountBalance deleteMany
   */
  export type AccountBalanceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which AccountBalances to delete
     */
    where?: AccountBalanceWhereInput;
    /**
     * Limit how many AccountBalances to delete.
     */
    limit?: number;
  };

  /**
   * AccountBalance.account
   */
  export type AccountBalance$accountArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null;
    where?: AccountWhereInput;
  };

  /**
   * AccountBalance without action
   */
  export type AccountBalanceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the AccountBalance
     */
    select?: AccountBalanceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AccountBalance
     */
    omit?: AccountBalanceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountBalanceInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const CategoryScalarFieldEnum: {
    id: 'id';
    name: 'name';
    color: 'color';
    icon: 'icon';
    budget: 'budget';
    type: 'type';
    parentId: 'parentId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type CategoryScalarFieldEnum =
    (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum];

  export const AccountScalarFieldEnum: {
    id: 'id';
    name: 'name';
    initialBalance: 'initialBalance';
    type: 'type';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type AccountScalarFieldEnum =
    (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum];

  export const CostObjectScalarFieldEnum: {
    id: 'id';
    name: 'name';
    color: 'color';
    icon: 'icon';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type CostObjectScalarFieldEnum =
    (typeof CostObjectScalarFieldEnum)[keyof typeof CostObjectScalarFieldEnum];

  export const TransactionScalarFieldEnum: {
    id: 'id';
    date: 'date';
    amount: 'amount';
    description: 'description';
    categoryId: 'categoryId';
    accountId: 'accountId';
    costObjectId: 'costObjectId';
    notes: 'notes';
    suggestedCategoryId: 'suggestedCategoryId';
    merchant: 'merchant';
    suggestedByRuleId: 'suggestedByRuleId';
    externalId: 'externalId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type TransactionScalarFieldEnum =
    (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];

  export const CategorizationRuleScalarFieldEnum: {
    id: 'id';
    name: 'name';
    description: 'description';
    enabled: 'enabled';
    priority: 'priority';
    categoryId: 'categoryId';
    mode: 'mode';
    conditionsJson: 'conditionsJson';
    matchCount: 'matchCount';
    lastMatched: 'lastMatched';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type CategorizationRuleScalarFieldEnum =
    (typeof CategorizationRuleScalarFieldEnum)[keyof typeof CategorizationRuleScalarFieldEnum];

  export const RuleSuggestionScalarFieldEnum: {
    id: 'id';
    name: 'name';
    description: 'description';
    conditionsJson: 'conditionsJson';
    categoryId: 'categoryId';
    confidence: 'confidence';
    matchCount: 'matchCount';
    similarityType: 'similarityType';
    sampleTxIds: 'sampleTxIds';
    status: 'status';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type RuleSuggestionScalarFieldEnum =
    (typeof RuleSuggestionScalarFieldEnum)[keyof typeof RuleSuggestionScalarFieldEnum];

  export const TransactionSplitScalarFieldEnum: {
    id: 'id';
    parentId: 'parentId';
    amount: 'amount';
    categoryId: 'categoryId';
    costObjectId: 'costObjectId';
    description: 'description';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type TransactionSplitScalarFieldEnum =
    (typeof TransactionSplitScalarFieldEnum)[keyof typeof TransactionSplitScalarFieldEnum];

  export const SavingsGoalScalarFieldEnum: {
    id: 'id';
    name: 'name';
    targetAmount: 'targetAmount';
    startDate: 'startDate';
    targetDate: 'targetDate';
    savedAmount: 'savedAmount';
    isEvergreen: 'isEvergreen';
    targetMonths: 'targetMonths';
    categoryId: 'categoryId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type SavingsGoalScalarFieldEnum =
    (typeof SavingsGoalScalarFieldEnum)[keyof typeof SavingsGoalScalarFieldEnum];

  export const SettingScalarFieldEnum: {
    key: 'key';
    value: 'value';
  };

  export type SettingScalarFieldEnum =
    (typeof SettingScalarFieldEnum)[keyof typeof SettingScalarFieldEnum];

  export const MonthlyBalanceScalarFieldEnum: {
    id: 'id';
    month: 'month';
    balance: 'balance';
    accountId: 'accountId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type MonthlyBalanceScalarFieldEnum =
    (typeof MonthlyBalanceScalarFieldEnum)[keyof typeof MonthlyBalanceScalarFieldEnum];

  export const AccountBalanceScalarFieldEnum: {
    id: 'id';
    asOfDate: 'asOfDate';
    balance: 'balance';
    accountId: 'accountId';
    notes: 'notes';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type AccountBalanceScalarFieldEnum =
    (typeof AccountBalanceScalarFieldEnum)[keyof typeof AccountBalanceScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'String'
  >;

  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Decimal'
  >;

  /**
   * Reference to a field of type 'CategoryType'
   */
  export type EnumCategoryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'CategoryType'
  >;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime'
  >;

  /**
   * Reference to a field of type 'AccountType'
   */
  export type EnumAccountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'AccountType'
  >;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Boolean'
  >;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Int'
  >;

  /**
   * Reference to a field of type 'RuleMode'
   */
  export type EnumRuleModeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'RuleMode'
  >;

  /**
   * Reference to a field of type 'SuggestionStatus'
   */
  export type EnumSuggestionStatusFieldRefInput<$PrismaModel> =
    FieldRefInputType<$PrismaModel, 'SuggestionStatus'>;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'Float'
  >;

  /**
   * Deep Input Types
   */

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[];
    OR?: CategoryWhereInput[];
    NOT?: CategoryWhereInput | CategoryWhereInput[];
    id?: StringFilter<'Category'> | string;
    name?: StringFilter<'Category'> | string;
    color?: StringNullableFilter<'Category'> | string | null;
    icon?: StringFilter<'Category'> | string;
    budget?:
      | DecimalNullableFilter<'Category'>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFilter<'Category'> | $Enums.CategoryType;
    parentId?: StringNullableFilter<'Category'> | string | null;
    createdAt?: DateTimeFilter<'Category'> | Date | string;
    updatedAt?: DateTimeFilter<'Category'> | Date | string;
    parent?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
    children?: CategoryListRelationFilter;
    transactions?: TransactionListRelationFilter;
    transactionSplits?: TransactionSplitListRelationFilter;
    savingsGoals?: SavingsGoalListRelationFilter;
    categorizationRules?: CategorizationRuleListRelationFilter;
    ruleSuggestions?: RuleSuggestionListRelationFilter;
  };

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrderInput | SortOrder;
    icon?: SortOrder;
    budget?: SortOrderInput | SortOrder;
    type?: SortOrder;
    parentId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    parent?: CategoryOrderByWithRelationInput;
    children?: CategoryOrderByRelationAggregateInput;
    transactions?: TransactionOrderByRelationAggregateInput;
    transactionSplits?: TransactionSplitOrderByRelationAggregateInput;
    savingsGoals?: SavingsGoalOrderByRelationAggregateInput;
    categorizationRules?: CategorizationRuleOrderByRelationAggregateInput;
    ruleSuggestions?: RuleSuggestionOrderByRelationAggregateInput;
  };

  export type CategoryWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: CategoryWhereInput | CategoryWhereInput[];
      OR?: CategoryWhereInput[];
      NOT?: CategoryWhereInput | CategoryWhereInput[];
      name?: StringFilter<'Category'> | string;
      color?: StringNullableFilter<'Category'> | string | null;
      icon?: StringFilter<'Category'> | string;
      budget?:
        | DecimalNullableFilter<'Category'>
        | Decimal
        | DecimalJsLike
        | number
        | string
        | null;
      type?: EnumCategoryTypeFilter<'Category'> | $Enums.CategoryType;
      parentId?: StringNullableFilter<'Category'> | string | null;
      createdAt?: DateTimeFilter<'Category'> | Date | string;
      updatedAt?: DateTimeFilter<'Category'> | Date | string;
      parent?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
      children?: CategoryListRelationFilter;
      transactions?: TransactionListRelationFilter;
      transactionSplits?: TransactionSplitListRelationFilter;
      savingsGoals?: SavingsGoalListRelationFilter;
      categorizationRules?: CategorizationRuleListRelationFilter;
      ruleSuggestions?: RuleSuggestionListRelationFilter;
    },
    'id'
  >;

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrderInput | SortOrder;
    icon?: SortOrder;
    budget?: SortOrderInput | SortOrder;
    type?: SortOrder;
    parentId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: CategoryCountOrderByAggregateInput;
    _avg?: CategoryAvgOrderByAggregateInput;
    _max?: CategoryMaxOrderByAggregateInput;
    _min?: CategoryMinOrderByAggregateInput;
    _sum?: CategorySumOrderByAggregateInput;
  };

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?:
      | CategoryScalarWhereWithAggregatesInput
      | CategoryScalarWhereWithAggregatesInput[];
    OR?: CategoryScalarWhereWithAggregatesInput[];
    NOT?:
      | CategoryScalarWhereWithAggregatesInput
      | CategoryScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Category'> | string;
    name?: StringWithAggregatesFilter<'Category'> | string;
    color?: StringNullableWithAggregatesFilter<'Category'> | string | null;
    icon?: StringWithAggregatesFilter<'Category'> | string;
    budget?:
      | DecimalNullableWithAggregatesFilter<'Category'>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?:
      | EnumCategoryTypeWithAggregatesFilter<'Category'>
      | $Enums.CategoryType;
    parentId?: StringNullableWithAggregatesFilter<'Category'> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'Category'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Category'> | Date | string;
  };

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[];
    OR?: AccountWhereInput[];
    NOT?: AccountWhereInput | AccountWhereInput[];
    id?: StringFilter<'Account'> | string;
    name?: StringFilter<'Account'> | string;
    initialBalance?:
      | DecimalFilter<'Account'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFilter<'Account'> | $Enums.AccountType;
    createdAt?: DateTimeFilter<'Account'> | Date | string;
    updatedAt?: DateTimeFilter<'Account'> | Date | string;
    transactions?: TransactionListRelationFilter;
    monthlyBalances?: MonthlyBalanceListRelationFilter;
    accountBalances?: AccountBalanceListRelationFilter;
  };

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    initialBalance?: SortOrder;
    type?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    transactions?: TransactionOrderByRelationAggregateInput;
    monthlyBalances?: MonthlyBalanceOrderByRelationAggregateInput;
    accountBalances?: AccountBalanceOrderByRelationAggregateInput;
  };

  export type AccountWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: AccountWhereInput | AccountWhereInput[];
      OR?: AccountWhereInput[];
      NOT?: AccountWhereInput | AccountWhereInput[];
      name?: StringFilter<'Account'> | string;
      initialBalance?:
        | DecimalFilter<'Account'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      type?: EnumAccountTypeFilter<'Account'> | $Enums.AccountType;
      createdAt?: DateTimeFilter<'Account'> | Date | string;
      updatedAt?: DateTimeFilter<'Account'> | Date | string;
      transactions?: TransactionListRelationFilter;
      monthlyBalances?: MonthlyBalanceListRelationFilter;
      accountBalances?: AccountBalanceListRelationFilter;
    },
    'id'
  >;

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    initialBalance?: SortOrder;
    type?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: AccountCountOrderByAggregateInput;
    _avg?: AccountAvgOrderByAggregateInput;
    _max?: AccountMaxOrderByAggregateInput;
    _min?: AccountMinOrderByAggregateInput;
    _sum?: AccountSumOrderByAggregateInput;
  };

  export type AccountScalarWhereWithAggregatesInput = {
    AND?:
      | AccountScalarWhereWithAggregatesInput
      | AccountScalarWhereWithAggregatesInput[];
    OR?: AccountScalarWhereWithAggregatesInput[];
    NOT?:
      | AccountScalarWhereWithAggregatesInput
      | AccountScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Account'> | string;
    name?: StringWithAggregatesFilter<'Account'> | string;
    initialBalance?:
      | DecimalWithAggregatesFilter<'Account'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeWithAggregatesFilter<'Account'> | $Enums.AccountType;
    createdAt?: DateTimeWithAggregatesFilter<'Account'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Account'> | Date | string;
  };

  export type CostObjectWhereInput = {
    AND?: CostObjectWhereInput | CostObjectWhereInput[];
    OR?: CostObjectWhereInput[];
    NOT?: CostObjectWhereInput | CostObjectWhereInput[];
    id?: StringFilter<'CostObject'> | string;
    name?: StringFilter<'CostObject'> | string;
    color?: StringNullableFilter<'CostObject'> | string | null;
    icon?: StringFilter<'CostObject'> | string;
    createdAt?: DateTimeFilter<'CostObject'> | Date | string;
    updatedAt?: DateTimeFilter<'CostObject'> | Date | string;
    transactions?: TransactionListRelationFilter;
    transactionSplits?: TransactionSplitListRelationFilter;
  };

  export type CostObjectOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrderInput | SortOrder;
    icon?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    transactions?: TransactionOrderByRelationAggregateInput;
    transactionSplits?: TransactionSplitOrderByRelationAggregateInput;
  };

  export type CostObjectWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: CostObjectWhereInput | CostObjectWhereInput[];
      OR?: CostObjectWhereInput[];
      NOT?: CostObjectWhereInput | CostObjectWhereInput[];
      name?: StringFilter<'CostObject'> | string;
      color?: StringNullableFilter<'CostObject'> | string | null;
      icon?: StringFilter<'CostObject'> | string;
      createdAt?: DateTimeFilter<'CostObject'> | Date | string;
      updatedAt?: DateTimeFilter<'CostObject'> | Date | string;
      transactions?: TransactionListRelationFilter;
      transactionSplits?: TransactionSplitListRelationFilter;
    },
    'id'
  >;

  export type CostObjectOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrderInput | SortOrder;
    icon?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: CostObjectCountOrderByAggregateInput;
    _max?: CostObjectMaxOrderByAggregateInput;
    _min?: CostObjectMinOrderByAggregateInput;
  };

  export type CostObjectScalarWhereWithAggregatesInput = {
    AND?:
      | CostObjectScalarWhereWithAggregatesInput
      | CostObjectScalarWhereWithAggregatesInput[];
    OR?: CostObjectScalarWhereWithAggregatesInput[];
    NOT?:
      | CostObjectScalarWhereWithAggregatesInput
      | CostObjectScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'CostObject'> | string;
    name?: StringWithAggregatesFilter<'CostObject'> | string;
    color?: StringNullableWithAggregatesFilter<'CostObject'> | string | null;
    icon?: StringWithAggregatesFilter<'CostObject'> | string;
    createdAt?: DateTimeWithAggregatesFilter<'CostObject'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'CostObject'> | Date | string;
  };

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[];
    OR?: TransactionWhereInput[];
    NOT?: TransactionWhereInput | TransactionWhereInput[];
    id?: StringFilter<'Transaction'> | string;
    date?: DateTimeFilter<'Transaction'> | Date | string;
    amount?:
      | DecimalFilter<'Transaction'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFilter<'Transaction'> | string;
    categoryId?: StringNullableFilter<'Transaction'> | string | null;
    accountId?: StringNullableFilter<'Transaction'> | string | null;
    costObjectId?: StringNullableFilter<'Transaction'> | string | null;
    notes?: StringNullableFilter<'Transaction'> | string | null;
    suggestedCategoryId?: StringNullableFilter<'Transaction'> | string | null;
    merchant?: StringNullableFilter<'Transaction'> | string | null;
    suggestedByRuleId?: StringNullableFilter<'Transaction'> | string | null;
    externalId?: StringNullableFilter<'Transaction'> | string | null;
    createdAt?: DateTimeFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
    category?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
    account?: XOR<
      AccountNullableScalarRelationFilter,
      AccountWhereInput
    > | null;
    costObject?: XOR<
      CostObjectNullableScalarRelationFilter,
      CostObjectWhereInput
    > | null;
    suggestedRule?: XOR<
      CategorizationRuleNullableScalarRelationFilter,
      CategorizationRuleWhereInput
    > | null;
    splits?: TransactionSplitListRelationFilter;
  };

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder;
    date?: SortOrder;
    amount?: SortOrder;
    description?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    accountId?: SortOrderInput | SortOrder;
    costObjectId?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    suggestedCategoryId?: SortOrderInput | SortOrder;
    merchant?: SortOrderInput | SortOrder;
    suggestedByRuleId?: SortOrderInput | SortOrder;
    externalId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    category?: CategoryOrderByWithRelationInput;
    account?: AccountOrderByWithRelationInput;
    costObject?: CostObjectOrderByWithRelationInput;
    suggestedRule?: CategorizationRuleOrderByWithRelationInput;
    splits?: TransactionSplitOrderByRelationAggregateInput;
  };

  export type TransactionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      externalId?: string;
      AND?: TransactionWhereInput | TransactionWhereInput[];
      OR?: TransactionWhereInput[];
      NOT?: TransactionWhereInput | TransactionWhereInput[];
      date?: DateTimeFilter<'Transaction'> | Date | string;
      amount?:
        | DecimalFilter<'Transaction'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      description?: StringFilter<'Transaction'> | string;
      categoryId?: StringNullableFilter<'Transaction'> | string | null;
      accountId?: StringNullableFilter<'Transaction'> | string | null;
      costObjectId?: StringNullableFilter<'Transaction'> | string | null;
      notes?: StringNullableFilter<'Transaction'> | string | null;
      suggestedCategoryId?: StringNullableFilter<'Transaction'> | string | null;
      merchant?: StringNullableFilter<'Transaction'> | string | null;
      suggestedByRuleId?: StringNullableFilter<'Transaction'> | string | null;
      createdAt?: DateTimeFilter<'Transaction'> | Date | string;
      updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
      category?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
      account?: XOR<
        AccountNullableScalarRelationFilter,
        AccountWhereInput
      > | null;
      costObject?: XOR<
        CostObjectNullableScalarRelationFilter,
        CostObjectWhereInput
      > | null;
      suggestedRule?: XOR<
        CategorizationRuleNullableScalarRelationFilter,
        CategorizationRuleWhereInput
      > | null;
      splits?: TransactionSplitListRelationFilter;
    },
    'id' | 'externalId'
  >;

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder;
    date?: SortOrder;
    amount?: SortOrder;
    description?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    accountId?: SortOrderInput | SortOrder;
    costObjectId?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    suggestedCategoryId?: SortOrderInput | SortOrder;
    merchant?: SortOrderInput | SortOrder;
    suggestedByRuleId?: SortOrderInput | SortOrder;
    externalId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TransactionCountOrderByAggregateInput;
    _avg?: TransactionAvgOrderByAggregateInput;
    _max?: TransactionMaxOrderByAggregateInput;
    _min?: TransactionMinOrderByAggregateInput;
    _sum?: TransactionSumOrderByAggregateInput;
  };

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?:
      | TransactionScalarWhereWithAggregatesInput
      | TransactionScalarWhereWithAggregatesInput[];
    OR?: TransactionScalarWhereWithAggregatesInput[];
    NOT?:
      | TransactionScalarWhereWithAggregatesInput
      | TransactionScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Transaction'> | string;
    date?: DateTimeWithAggregatesFilter<'Transaction'> | Date | string;
    amount?:
      | DecimalWithAggregatesFilter<'Transaction'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringWithAggregatesFilter<'Transaction'> | string;
    categoryId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    accountId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    costObjectId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    notes?: StringNullableWithAggregatesFilter<'Transaction'> | string | null;
    suggestedCategoryId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    merchant?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    suggestedByRuleId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    externalId?:
      | StringNullableWithAggregatesFilter<'Transaction'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Transaction'> | Date | string;
  };

  export type CategorizationRuleWhereInput = {
    AND?: CategorizationRuleWhereInput | CategorizationRuleWhereInput[];
    OR?: CategorizationRuleWhereInput[];
    NOT?: CategorizationRuleWhereInput | CategorizationRuleWhereInput[];
    id?: StringFilter<'CategorizationRule'> | string;
    name?: StringFilter<'CategorizationRule'> | string;
    description?: StringNullableFilter<'CategorizationRule'> | string | null;
    enabled?: BoolFilter<'CategorizationRule'> | boolean;
    priority?: IntFilter<'CategorizationRule'> | number;
    categoryId?: StringNullableFilter<'CategorizationRule'> | string | null;
    mode?: EnumRuleModeFilter<'CategorizationRule'> | $Enums.RuleMode;
    conditionsJson?: StringFilter<'CategorizationRule'> | string;
    matchCount?: IntFilter<'CategorizationRule'> | number;
    lastMatched?:
      | DateTimeNullableFilter<'CategorizationRule'>
      | Date
      | string
      | null;
    createdAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
    updatedAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
    category?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
    suggestedTransactions?: TransactionListRelationFilter;
  };

  export type CategorizationRuleOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrderInput | SortOrder;
    enabled?: SortOrder;
    priority?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    mode?: SortOrder;
    conditionsJson?: SortOrder;
    matchCount?: SortOrder;
    lastMatched?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    category?: CategoryOrderByWithRelationInput;
    suggestedTransactions?: TransactionOrderByRelationAggregateInput;
  };

  export type CategorizationRuleWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: CategorizationRuleWhereInput | CategorizationRuleWhereInput[];
      OR?: CategorizationRuleWhereInput[];
      NOT?: CategorizationRuleWhereInput | CategorizationRuleWhereInput[];
      name?: StringFilter<'CategorizationRule'> | string;
      description?: StringNullableFilter<'CategorizationRule'> | string | null;
      enabled?: BoolFilter<'CategorizationRule'> | boolean;
      priority?: IntFilter<'CategorizationRule'> | number;
      categoryId?: StringNullableFilter<'CategorizationRule'> | string | null;
      mode?: EnumRuleModeFilter<'CategorizationRule'> | $Enums.RuleMode;
      conditionsJson?: StringFilter<'CategorizationRule'> | string;
      matchCount?: IntFilter<'CategorizationRule'> | number;
      lastMatched?:
        | DateTimeNullableFilter<'CategorizationRule'>
        | Date
        | string
        | null;
      createdAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
      updatedAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
      category?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
      suggestedTransactions?: TransactionListRelationFilter;
    },
    'id'
  >;

  export type CategorizationRuleOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrderInput | SortOrder;
    enabled?: SortOrder;
    priority?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    mode?: SortOrder;
    conditionsJson?: SortOrder;
    matchCount?: SortOrder;
    lastMatched?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: CategorizationRuleCountOrderByAggregateInput;
    _avg?: CategorizationRuleAvgOrderByAggregateInput;
    _max?: CategorizationRuleMaxOrderByAggregateInput;
    _min?: CategorizationRuleMinOrderByAggregateInput;
    _sum?: CategorizationRuleSumOrderByAggregateInput;
  };

  export type CategorizationRuleScalarWhereWithAggregatesInput = {
    AND?:
      | CategorizationRuleScalarWhereWithAggregatesInput
      | CategorizationRuleScalarWhereWithAggregatesInput[];
    OR?: CategorizationRuleScalarWhereWithAggregatesInput[];
    NOT?:
      | CategorizationRuleScalarWhereWithAggregatesInput
      | CategorizationRuleScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'CategorizationRule'> | string;
    name?: StringWithAggregatesFilter<'CategorizationRule'> | string;
    description?:
      | StringNullableWithAggregatesFilter<'CategorizationRule'>
      | string
      | null;
    enabled?: BoolWithAggregatesFilter<'CategorizationRule'> | boolean;
    priority?: IntWithAggregatesFilter<'CategorizationRule'> | number;
    categoryId?:
      | StringNullableWithAggregatesFilter<'CategorizationRule'>
      | string
      | null;
    mode?:
      | EnumRuleModeWithAggregatesFilter<'CategorizationRule'>
      | $Enums.RuleMode;
    conditionsJson?: StringWithAggregatesFilter<'CategorizationRule'> | string;
    matchCount?: IntWithAggregatesFilter<'CategorizationRule'> | number;
    lastMatched?:
      | DateTimeNullableWithAggregatesFilter<'CategorizationRule'>
      | Date
      | string
      | null;
    createdAt?:
      | DateTimeWithAggregatesFilter<'CategorizationRule'>
      | Date
      | string;
    updatedAt?:
      | DateTimeWithAggregatesFilter<'CategorizationRule'>
      | Date
      | string;
  };

  export type RuleSuggestionWhereInput = {
    AND?: RuleSuggestionWhereInput | RuleSuggestionWhereInput[];
    OR?: RuleSuggestionWhereInput[];
    NOT?: RuleSuggestionWhereInput | RuleSuggestionWhereInput[];
    id?: StringFilter<'RuleSuggestion'> | string;
    name?: StringFilter<'RuleSuggestion'> | string;
    description?: StringNullableFilter<'RuleSuggestion'> | string | null;
    conditionsJson?: StringFilter<'RuleSuggestion'> | string;
    categoryId?: StringNullableFilter<'RuleSuggestion'> | string | null;
    confidence?:
      | DecimalFilter<'RuleSuggestion'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFilter<'RuleSuggestion'> | number;
    similarityType?: StringFilter<'RuleSuggestion'> | string;
    sampleTxIds?: StringFilter<'RuleSuggestion'> | string;
    status?:
      | EnumSuggestionStatusFilter<'RuleSuggestion'>
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
    updatedAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
    category?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
  };

  export type RuleSuggestionOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrderInput | SortOrder;
    conditionsJson?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    confidence?: SortOrder;
    matchCount?: SortOrder;
    similarityType?: SortOrder;
    sampleTxIds?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    category?: CategoryOrderByWithRelationInput;
  };

  export type RuleSuggestionWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: RuleSuggestionWhereInput | RuleSuggestionWhereInput[];
      OR?: RuleSuggestionWhereInput[];
      NOT?: RuleSuggestionWhereInput | RuleSuggestionWhereInput[];
      name?: StringFilter<'RuleSuggestion'> | string;
      description?: StringNullableFilter<'RuleSuggestion'> | string | null;
      conditionsJson?: StringFilter<'RuleSuggestion'> | string;
      categoryId?: StringNullableFilter<'RuleSuggestion'> | string | null;
      confidence?:
        | DecimalFilter<'RuleSuggestion'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      matchCount?: IntFilter<'RuleSuggestion'> | number;
      similarityType?: StringFilter<'RuleSuggestion'> | string;
      sampleTxIds?: StringFilter<'RuleSuggestion'> | string;
      status?:
        | EnumSuggestionStatusFilter<'RuleSuggestion'>
        | $Enums.SuggestionStatus;
      createdAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
      updatedAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
      category?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
    },
    'id'
  >;

  export type RuleSuggestionOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrderInput | SortOrder;
    conditionsJson?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    confidence?: SortOrder;
    matchCount?: SortOrder;
    similarityType?: SortOrder;
    sampleTxIds?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: RuleSuggestionCountOrderByAggregateInput;
    _avg?: RuleSuggestionAvgOrderByAggregateInput;
    _max?: RuleSuggestionMaxOrderByAggregateInput;
    _min?: RuleSuggestionMinOrderByAggregateInput;
    _sum?: RuleSuggestionSumOrderByAggregateInput;
  };

  export type RuleSuggestionScalarWhereWithAggregatesInput = {
    AND?:
      | RuleSuggestionScalarWhereWithAggregatesInput
      | RuleSuggestionScalarWhereWithAggregatesInput[];
    OR?: RuleSuggestionScalarWhereWithAggregatesInput[];
    NOT?:
      | RuleSuggestionScalarWhereWithAggregatesInput
      | RuleSuggestionScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'RuleSuggestion'> | string;
    name?: StringWithAggregatesFilter<'RuleSuggestion'> | string;
    description?:
      | StringNullableWithAggregatesFilter<'RuleSuggestion'>
      | string
      | null;
    conditionsJson?: StringWithAggregatesFilter<'RuleSuggestion'> | string;
    categoryId?:
      | StringNullableWithAggregatesFilter<'RuleSuggestion'>
      | string
      | null;
    confidence?:
      | DecimalWithAggregatesFilter<'RuleSuggestion'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntWithAggregatesFilter<'RuleSuggestion'> | number;
    similarityType?: StringWithAggregatesFilter<'RuleSuggestion'> | string;
    sampleTxIds?: StringWithAggregatesFilter<'RuleSuggestion'> | string;
    status?:
      | EnumSuggestionStatusWithAggregatesFilter<'RuleSuggestion'>
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeWithAggregatesFilter<'RuleSuggestion'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'RuleSuggestion'> | Date | string;
  };

  export type TransactionSplitWhereInput = {
    AND?: TransactionSplitWhereInput | TransactionSplitWhereInput[];
    OR?: TransactionSplitWhereInput[];
    NOT?: TransactionSplitWhereInput | TransactionSplitWhereInput[];
    id?: StringFilter<'TransactionSplit'> | string;
    parentId?: StringFilter<'TransactionSplit'> | string;
    amount?:
      | DecimalFilter<'TransactionSplit'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: StringNullableFilter<'TransactionSplit'> | string | null;
    costObjectId?: StringNullableFilter<'TransactionSplit'> | string | null;
    description?: StringNullableFilter<'TransactionSplit'> | string | null;
    createdAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
    updatedAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
    parent?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>;
    category?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
    costObject?: XOR<
      CostObjectNullableScalarRelationFilter,
      CostObjectWhereInput
    > | null;
  };

  export type TransactionSplitOrderByWithRelationInput = {
    id?: SortOrder;
    parentId?: SortOrder;
    amount?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    costObjectId?: SortOrderInput | SortOrder;
    description?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    parent?: TransactionOrderByWithRelationInput;
    category?: CategoryOrderByWithRelationInput;
    costObject?: CostObjectOrderByWithRelationInput;
  };

  export type TransactionSplitWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: TransactionSplitWhereInput | TransactionSplitWhereInput[];
      OR?: TransactionSplitWhereInput[];
      NOT?: TransactionSplitWhereInput | TransactionSplitWhereInput[];
      parentId?: StringFilter<'TransactionSplit'> | string;
      amount?:
        | DecimalFilter<'TransactionSplit'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      categoryId?: StringNullableFilter<'TransactionSplit'> | string | null;
      costObjectId?: StringNullableFilter<'TransactionSplit'> | string | null;
      description?: StringNullableFilter<'TransactionSplit'> | string | null;
      createdAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
      updatedAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
      parent?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>;
      category?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
      costObject?: XOR<
        CostObjectNullableScalarRelationFilter,
        CostObjectWhereInput
      > | null;
    },
    'id'
  >;

  export type TransactionSplitOrderByWithAggregationInput = {
    id?: SortOrder;
    parentId?: SortOrder;
    amount?: SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    costObjectId?: SortOrderInput | SortOrder;
    description?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: TransactionSplitCountOrderByAggregateInput;
    _avg?: TransactionSplitAvgOrderByAggregateInput;
    _max?: TransactionSplitMaxOrderByAggregateInput;
    _min?: TransactionSplitMinOrderByAggregateInput;
    _sum?: TransactionSplitSumOrderByAggregateInput;
  };

  export type TransactionSplitScalarWhereWithAggregatesInput = {
    AND?:
      | TransactionSplitScalarWhereWithAggregatesInput
      | TransactionSplitScalarWhereWithAggregatesInput[];
    OR?: TransactionSplitScalarWhereWithAggregatesInput[];
    NOT?:
      | TransactionSplitScalarWhereWithAggregatesInput
      | TransactionSplitScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'TransactionSplit'> | string;
    parentId?: StringWithAggregatesFilter<'TransactionSplit'> | string;
    amount?:
      | DecimalWithAggregatesFilter<'TransactionSplit'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?:
      | StringNullableWithAggregatesFilter<'TransactionSplit'>
      | string
      | null;
    costObjectId?:
      | StringNullableWithAggregatesFilter<'TransactionSplit'>
      | string
      | null;
    description?:
      | StringNullableWithAggregatesFilter<'TransactionSplit'>
      | string
      | null;
    createdAt?:
      | DateTimeWithAggregatesFilter<'TransactionSplit'>
      | Date
      | string;
    updatedAt?:
      | DateTimeWithAggregatesFilter<'TransactionSplit'>
      | Date
      | string;
  };

  export type SavingsGoalWhereInput = {
    AND?: SavingsGoalWhereInput | SavingsGoalWhereInput[];
    OR?: SavingsGoalWhereInput[];
    NOT?: SavingsGoalWhereInput | SavingsGoalWhereInput[];
    id?: StringFilter<'SavingsGoal'> | string;
    name?: StringFilter<'SavingsGoal'> | string;
    targetAmount?:
      | DecimalFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFilter<'SavingsGoal'> | Date | string;
    targetDate?: DateTimeNullableFilter<'SavingsGoal'> | Date | string | null;
    savedAmount?:
      | DecimalFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFilter<'SavingsGoal'> | boolean;
    targetMonths?: IntNullableFilter<'SavingsGoal'> | number | null;
    categoryId?: StringNullableFilter<'SavingsGoal'> | string | null;
    createdAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
    updatedAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
    category?: XOR<
      CategoryNullableScalarRelationFilter,
      CategoryWhereInput
    > | null;
  };

  export type SavingsGoalOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    targetAmount?: SortOrder;
    startDate?: SortOrder;
    targetDate?: SortOrderInput | SortOrder;
    savedAmount?: SortOrder;
    isEvergreen?: SortOrder;
    targetMonths?: SortOrderInput | SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    category?: CategoryOrderByWithRelationInput;
  };

  export type SavingsGoalWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: SavingsGoalWhereInput | SavingsGoalWhereInput[];
      OR?: SavingsGoalWhereInput[];
      NOT?: SavingsGoalWhereInput | SavingsGoalWhereInput[];
      name?: StringFilter<'SavingsGoal'> | string;
      targetAmount?:
        | DecimalFilter<'SavingsGoal'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      startDate?: DateTimeFilter<'SavingsGoal'> | Date | string;
      targetDate?: DateTimeNullableFilter<'SavingsGoal'> | Date | string | null;
      savedAmount?:
        | DecimalFilter<'SavingsGoal'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      isEvergreen?: BoolFilter<'SavingsGoal'> | boolean;
      targetMonths?: IntNullableFilter<'SavingsGoal'> | number | null;
      categoryId?: StringNullableFilter<'SavingsGoal'> | string | null;
      createdAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
      updatedAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
      category?: XOR<
        CategoryNullableScalarRelationFilter,
        CategoryWhereInput
      > | null;
    },
    'id'
  >;

  export type SavingsGoalOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    targetAmount?: SortOrder;
    startDate?: SortOrder;
    targetDate?: SortOrderInput | SortOrder;
    savedAmount?: SortOrder;
    isEvergreen?: SortOrder;
    targetMonths?: SortOrderInput | SortOrder;
    categoryId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: SavingsGoalCountOrderByAggregateInput;
    _avg?: SavingsGoalAvgOrderByAggregateInput;
    _max?: SavingsGoalMaxOrderByAggregateInput;
    _min?: SavingsGoalMinOrderByAggregateInput;
    _sum?: SavingsGoalSumOrderByAggregateInput;
  };

  export type SavingsGoalScalarWhereWithAggregatesInput = {
    AND?:
      | SavingsGoalScalarWhereWithAggregatesInput
      | SavingsGoalScalarWhereWithAggregatesInput[];
    OR?: SavingsGoalScalarWhereWithAggregatesInput[];
    NOT?:
      | SavingsGoalScalarWhereWithAggregatesInput
      | SavingsGoalScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'SavingsGoal'> | string;
    name?: StringWithAggregatesFilter<'SavingsGoal'> | string;
    targetAmount?:
      | DecimalWithAggregatesFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeWithAggregatesFilter<'SavingsGoal'> | Date | string;
    targetDate?:
      | DateTimeNullableWithAggregatesFilter<'SavingsGoal'>
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalWithAggregatesFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolWithAggregatesFilter<'SavingsGoal'> | boolean;
    targetMonths?:
      | IntNullableWithAggregatesFilter<'SavingsGoal'>
      | number
      | null;
    categoryId?:
      | StringNullableWithAggregatesFilter<'SavingsGoal'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'SavingsGoal'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'SavingsGoal'> | Date | string;
  };

  export type SettingWhereInput = {
    AND?: SettingWhereInput | SettingWhereInput[];
    OR?: SettingWhereInput[];
    NOT?: SettingWhereInput | SettingWhereInput[];
    key?: StringFilter<'Setting'> | string;
    value?: StringFilter<'Setting'> | string;
  };

  export type SettingOrderByWithRelationInput = {
    key?: SortOrder;
    value?: SortOrder;
  };

  export type SettingWhereUniqueInput = Prisma.AtLeast<
    {
      key?: string;
      AND?: SettingWhereInput | SettingWhereInput[];
      OR?: SettingWhereInput[];
      NOT?: SettingWhereInput | SettingWhereInput[];
      value?: StringFilter<'Setting'> | string;
    },
    'key'
  >;

  export type SettingOrderByWithAggregationInput = {
    key?: SortOrder;
    value?: SortOrder;
    _count?: SettingCountOrderByAggregateInput;
    _max?: SettingMaxOrderByAggregateInput;
    _min?: SettingMinOrderByAggregateInput;
  };

  export type SettingScalarWhereWithAggregatesInput = {
    AND?:
      | SettingScalarWhereWithAggregatesInput
      | SettingScalarWhereWithAggregatesInput[];
    OR?: SettingScalarWhereWithAggregatesInput[];
    NOT?:
      | SettingScalarWhereWithAggregatesInput
      | SettingScalarWhereWithAggregatesInput[];
    key?: StringWithAggregatesFilter<'Setting'> | string;
    value?: StringWithAggregatesFilter<'Setting'> | string;
  };

  export type MonthlyBalanceWhereInput = {
    AND?: MonthlyBalanceWhereInput | MonthlyBalanceWhereInput[];
    OR?: MonthlyBalanceWhereInput[];
    NOT?: MonthlyBalanceWhereInput | MonthlyBalanceWhereInput[];
    id?: StringFilter<'MonthlyBalance'> | string;
    month?: StringFilter<'MonthlyBalance'> | string;
    balance?:
      | DecimalFilter<'MonthlyBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: StringNullableFilter<'MonthlyBalance'> | string | null;
    createdAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
    updatedAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
    account?: XOR<
      AccountNullableScalarRelationFilter,
      AccountWhereInput
    > | null;
  };

  export type MonthlyBalanceOrderByWithRelationInput = {
    id?: SortOrder;
    month?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    account?: AccountOrderByWithRelationInput;
  };

  export type MonthlyBalanceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      month_accountId?: MonthlyBalanceMonthAccountIdCompoundUniqueInput;
      AND?: MonthlyBalanceWhereInput | MonthlyBalanceWhereInput[];
      OR?: MonthlyBalanceWhereInput[];
      NOT?: MonthlyBalanceWhereInput | MonthlyBalanceWhereInput[];
      month?: StringFilter<'MonthlyBalance'> | string;
      balance?:
        | DecimalFilter<'MonthlyBalance'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      accountId?: StringNullableFilter<'MonthlyBalance'> | string | null;
      createdAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
      updatedAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
      account?: XOR<
        AccountNullableScalarRelationFilter,
        AccountWhereInput
      > | null;
    },
    'id' | 'month_accountId'
  >;

  export type MonthlyBalanceOrderByWithAggregationInput = {
    id?: SortOrder;
    month?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: MonthlyBalanceCountOrderByAggregateInput;
    _avg?: MonthlyBalanceAvgOrderByAggregateInput;
    _max?: MonthlyBalanceMaxOrderByAggregateInput;
    _min?: MonthlyBalanceMinOrderByAggregateInput;
    _sum?: MonthlyBalanceSumOrderByAggregateInput;
  };

  export type MonthlyBalanceScalarWhereWithAggregatesInput = {
    AND?:
      | MonthlyBalanceScalarWhereWithAggregatesInput
      | MonthlyBalanceScalarWhereWithAggregatesInput[];
    OR?: MonthlyBalanceScalarWhereWithAggregatesInput[];
    NOT?:
      | MonthlyBalanceScalarWhereWithAggregatesInput
      | MonthlyBalanceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'MonthlyBalance'> | string;
    month?: StringWithAggregatesFilter<'MonthlyBalance'> | string;
    balance?:
      | DecimalWithAggregatesFilter<'MonthlyBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?:
      | StringNullableWithAggregatesFilter<'MonthlyBalance'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'MonthlyBalance'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'MonthlyBalance'> | Date | string;
  };

  export type AccountBalanceWhereInput = {
    AND?: AccountBalanceWhereInput | AccountBalanceWhereInput[];
    OR?: AccountBalanceWhereInput[];
    NOT?: AccountBalanceWhereInput | AccountBalanceWhereInput[];
    id?: StringFilter<'AccountBalance'> | string;
    asOfDate?: DateTimeFilter<'AccountBalance'> | Date | string;
    balance?:
      | DecimalFilter<'AccountBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: StringNullableFilter<'AccountBalance'> | string | null;
    notes?: StringNullableFilter<'AccountBalance'> | string | null;
    createdAt?: DateTimeFilter<'AccountBalance'> | Date | string;
    updatedAt?: DateTimeFilter<'AccountBalance'> | Date | string;
    account?: XOR<
      AccountNullableScalarRelationFilter,
      AccountWhereInput
    > | null;
  };

  export type AccountBalanceOrderByWithRelationInput = {
    id?: SortOrder;
    asOfDate?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    account?: AccountOrderByWithRelationInput;
  };

  export type AccountBalanceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      asOfDate_accountId?: AccountBalanceAsOfDateAccountIdCompoundUniqueInput;
      AND?: AccountBalanceWhereInput | AccountBalanceWhereInput[];
      OR?: AccountBalanceWhereInput[];
      NOT?: AccountBalanceWhereInput | AccountBalanceWhereInput[];
      asOfDate?: DateTimeFilter<'AccountBalance'> | Date | string;
      balance?:
        | DecimalFilter<'AccountBalance'>
        | Decimal
        | DecimalJsLike
        | number
        | string;
      accountId?: StringNullableFilter<'AccountBalance'> | string | null;
      notes?: StringNullableFilter<'AccountBalance'> | string | null;
      createdAt?: DateTimeFilter<'AccountBalance'> | Date | string;
      updatedAt?: DateTimeFilter<'AccountBalance'> | Date | string;
      account?: XOR<
        AccountNullableScalarRelationFilter,
        AccountWhereInput
      > | null;
    },
    'id' | 'asOfDate_accountId'
  >;

  export type AccountBalanceOrderByWithAggregationInput = {
    id?: SortOrder;
    asOfDate?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrderInput | SortOrder;
    notes?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: AccountBalanceCountOrderByAggregateInput;
    _avg?: AccountBalanceAvgOrderByAggregateInput;
    _max?: AccountBalanceMaxOrderByAggregateInput;
    _min?: AccountBalanceMinOrderByAggregateInput;
    _sum?: AccountBalanceSumOrderByAggregateInput;
  };

  export type AccountBalanceScalarWhereWithAggregatesInput = {
    AND?:
      | AccountBalanceScalarWhereWithAggregatesInput
      | AccountBalanceScalarWhereWithAggregatesInput[];
    OR?: AccountBalanceScalarWhereWithAggregatesInput[];
    NOT?:
      | AccountBalanceScalarWhereWithAggregatesInput
      | AccountBalanceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'AccountBalance'> | string;
    asOfDate?: DateTimeWithAggregatesFilter<'AccountBalance'> | Date | string;
    balance?:
      | DecimalWithAggregatesFilter<'AccountBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?:
      | StringNullableWithAggregatesFilter<'AccountBalance'>
      | string
      | null;
    notes?:
      | StringNullableWithAggregatesFilter<'AccountBalance'>
      | string
      | null;
    createdAt?: DateTimeWithAggregatesFilter<'AccountBalance'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'AccountBalance'> | Date | string;
  };

  export type CategoryCreateInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryCreateManyInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type CategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountCreateInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionCreateNestedManyWithoutAccountInput;
    monthlyBalances?: MonthlyBalanceCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceCreateNestedManyWithoutAccountInput;
  };

  export type AccountUncheckedCreateInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutAccountInput;
    monthlyBalances?: MonthlyBalanceUncheckedCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceUncheckedCreateNestedManyWithoutAccountInput;
  };

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUpdateManyWithoutAccountNestedInput;
    monthlyBalances?: MonthlyBalanceUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUpdateManyWithoutAccountNestedInput;
  };

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutAccountNestedInput;
    monthlyBalances?: MonthlyBalanceUncheckedUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUncheckedUpdateManyWithoutAccountNestedInput;
  };

  export type AccountCreateManyInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CostObjectCreateInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionCreateNestedManyWithoutCostObjectInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectUncheckedCreateInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCostObjectInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUpdateManyWithoutCostObjectNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCostObjectNestedInput;
  };

  export type CostObjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutCostObjectNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCostObjectNestedInput;
  };

  export type CostObjectCreateManyInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type CostObjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CostObjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionsInput;
    account?: AccountCreateNestedOneWithoutTransactionsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionsInput;
    suggestedRule?: CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput;
    splits?: TransactionSplitCreateNestedManyWithoutParentInput;
  };

  export type TransactionUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    splits?: TransactionSplitUncheckedCreateNestedManyWithoutParentInput;
  };

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionsNestedInput;
    account?: AccountUpdateOneWithoutTransactionsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionsNestedInput;
    suggestedRule?: CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput;
    splits?: TransactionSplitUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    splits?: TransactionSplitUncheckedUpdateManyWithoutParentNestedInput;
  };

  export type TransactionCreateManyInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CategorizationRuleCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutCategorizationRulesInput;
    suggestedTransactions?: TransactionCreateNestedManyWithoutSuggestedRuleInput;
  };

  export type CategorizationRuleUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    categoryId?: string | null;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    suggestedTransactions?: TransactionUncheckedCreateNestedManyWithoutSuggestedRuleInput;
  };

  export type CategorizationRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutCategorizationRulesNestedInput;
    suggestedTransactions?: TransactionUpdateManyWithoutSuggestedRuleNestedInput;
  };

  export type CategorizationRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    suggestedTransactions?: TransactionUncheckedUpdateManyWithoutSuggestedRuleNestedInput;
  };

  export type CategorizationRuleCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    categoryId?: string | null;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type CategorizationRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CategorizationRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutRuleSuggestionsInput;
  };

  export type RuleSuggestionUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    categoryId?: string | null;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RuleSuggestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutRuleSuggestionsNestedInput;
  };

  export type RuleSuggestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    categoryId?: string | null;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RuleSuggestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitCreateInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent: TransactionCreateNestedOneWithoutSplitsInput;
    category?: CategoryCreateNestedOneWithoutTransactionSplitsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionSplitsInput;
  };

  export type TransactionSplitUncheckedCreateInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: TransactionUpdateOneRequiredWithoutSplitsNestedInput;
    category?: CategoryUpdateOneWithoutTransactionSplitsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionSplitsNestedInput;
  };

  export type TransactionSplitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitCreateManyInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalCreateInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutSavingsGoalsInput;
  };

  export type SavingsGoalUncheckedCreateInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type SavingsGoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutSavingsGoalsNestedInput;
  };

  export type SavingsGoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalCreateManyInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    categoryId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type SavingsGoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SettingCreateInput = {
    key: string;
    value: string;
  };

  export type SettingUncheckedCreateInput = {
    key: string;
    value: string;
  };

  export type SettingUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
  };

  export type SettingUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
  };

  export type SettingCreateManyInput = {
    key: string;
    value: string;
  };

  export type SettingUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
  };

  export type SettingUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string;
    value?: StringFieldUpdateOperationsInput | string;
  };

  export type MonthlyBalanceCreateInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    account?: AccountCreateNestedOneWithoutMonthlyBalancesInput;
  };

  export type MonthlyBalanceUncheckedCreateInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    accountId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MonthlyBalanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    account?: AccountUpdateOneWithoutMonthlyBalancesNestedInput;
  };

  export type MonthlyBalanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MonthlyBalanceCreateManyInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    accountId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MonthlyBalanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MonthlyBalanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceCreateInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    account?: AccountCreateNestedOneWithoutAccountBalancesInput;
  };

  export type AccountBalanceUncheckedCreateInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    accountId?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountBalanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    account?: AccountUpdateOneWithoutAccountBalancesNestedInput;
  };

  export type AccountBalanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceCreateManyInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    accountId?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountBalanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[];
    notIn?: string[];
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | null;
    notIn?: string[] | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>
      | null;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalNullableFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
  };

  export type EnumCategoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoryType | EnumCategoryTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoryType[];
    notIn?: $Enums.CategoryType[];
    not?: NestedEnumCategoryTypeFilter<$PrismaModel> | $Enums.CategoryType;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[];
    notIn?: Date[] | string[];
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null;
    isNot?: CategoryWhereInput | null;
  };

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput;
    some?: CategoryWhereInput;
    none?: CategoryWhereInput;
  };

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput;
    some?: TransactionWhereInput;
    none?: TransactionWhereInput;
  };

  export type TransactionSplitListRelationFilter = {
    every?: TransactionSplitWhereInput;
    some?: TransactionSplitWhereInput;
    none?: TransactionSplitWhereInput;
  };

  export type SavingsGoalListRelationFilter = {
    every?: SavingsGoalWhereInput;
    some?: SavingsGoalWhereInput;
    none?: SavingsGoalWhereInput;
  };

  export type CategorizationRuleListRelationFilter = {
    every?: CategorizationRuleWhereInput;
    some?: CategorizationRuleWhereInput;
    none?: CategorizationRuleWhereInput;
  };

  export type RuleSuggestionListRelationFilter = {
    every?: RuleSuggestionWhereInput;
    some?: RuleSuggestionWhereInput;
    none?: RuleSuggestionWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type TransactionSplitOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type SavingsGoalOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type CategorizationRuleOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type RuleSuggestionOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    budget?: SortOrder;
    type?: SortOrder;
    parentId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategoryAvgOrderByAggregateInput = {
    budget?: SortOrder;
  };

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    budget?: SortOrder;
    type?: SortOrder;
    parentId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    budget?: SortOrder;
    type?: SortOrder;
    parentId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategorySumOrderByAggregateInput = {
    budget?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[];
    notIn?: string[];
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | null;
    notIn?: string[] | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>
      | null;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalNullableWithAggregatesFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedDecimalNullableFilter<$PrismaModel>;
    _sum?: NestedDecimalNullableFilter<$PrismaModel>;
    _min?: NestedDecimalNullableFilter<$PrismaModel>;
    _max?: NestedDecimalNullableFilter<$PrismaModel>;
  };

  export type EnumCategoryTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoryType | EnumCategoryTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoryType[];
    notIn?: $Enums.CategoryType[];
    not?:
      | NestedEnumCategoryTypeWithAggregatesFilter<$PrismaModel>
      | $Enums.CategoryType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumCategoryTypeFilter<$PrismaModel>;
    _max?: NestedEnumCategoryTypeFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[];
    notIn?: Date[] | string[];
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type DecimalFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[];
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[];
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
  };

  export type EnumAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountType | EnumAccountTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountType[];
    notIn?: $Enums.AccountType[];
    not?: NestedEnumAccountTypeFilter<$PrismaModel> | $Enums.AccountType;
  };

  export type MonthlyBalanceListRelationFilter = {
    every?: MonthlyBalanceWhereInput;
    some?: MonthlyBalanceWhereInput;
    none?: MonthlyBalanceWhereInput;
  };

  export type AccountBalanceListRelationFilter = {
    every?: AccountBalanceWhereInput;
    some?: AccountBalanceWhereInput;
    none?: AccountBalanceWhereInput;
  };

  export type MonthlyBalanceOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type AccountBalanceOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    initialBalance?: SortOrder;
    type?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountAvgOrderByAggregateInput = {
    initialBalance?: SortOrder;
  };

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    initialBalance?: SortOrder;
    type?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    initialBalance?: SortOrder;
    type?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountSumOrderByAggregateInput = {
    initialBalance?: SortOrder;
  };

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[];
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[];
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalWithAggregatesFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedDecimalFilter<$PrismaModel>;
    _sum?: NestedDecimalFilter<$PrismaModel>;
    _min?: NestedDecimalFilter<$PrismaModel>;
    _max?: NestedDecimalFilter<$PrismaModel>;
  };

  export type EnumAccountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountType | EnumAccountTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountType[];
    notIn?: $Enums.AccountType[];
    not?:
      | NestedEnumAccountTypeWithAggregatesFilter<$PrismaModel>
      | $Enums.AccountType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumAccountTypeFilter<$PrismaModel>;
    _max?: NestedEnumAccountTypeFilter<$PrismaModel>;
  };

  export type CostObjectCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CostObjectMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CostObjectMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    color?: SortOrder;
    icon?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountNullableScalarRelationFilter = {
    is?: AccountWhereInput | null;
    isNot?: AccountWhereInput | null;
  };

  export type CostObjectNullableScalarRelationFilter = {
    is?: CostObjectWhereInput | null;
    isNot?: CostObjectWhereInput | null;
  };

  export type CategorizationRuleNullableScalarRelationFilter = {
    is?: CategorizationRuleWhereInput | null;
    isNot?: CategorizationRuleWhereInput | null;
  };

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder;
    date?: SortOrder;
    amount?: SortOrder;
    description?: SortOrder;
    categoryId?: SortOrder;
    accountId?: SortOrder;
    costObjectId?: SortOrder;
    notes?: SortOrder;
    suggestedCategoryId?: SortOrder;
    merchant?: SortOrder;
    suggestedByRuleId?: SortOrder;
    externalId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionAvgOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder;
    date?: SortOrder;
    amount?: SortOrder;
    description?: SortOrder;
    categoryId?: SortOrder;
    accountId?: SortOrder;
    costObjectId?: SortOrder;
    notes?: SortOrder;
    suggestedCategoryId?: SortOrder;
    merchant?: SortOrder;
    suggestedByRuleId?: SortOrder;
    externalId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder;
    date?: SortOrder;
    amount?: SortOrder;
    description?: SortOrder;
    categoryId?: SortOrder;
    accountId?: SortOrder;
    costObjectId?: SortOrder;
    notes?: SortOrder;
    suggestedCategoryId?: SortOrder;
    merchant?: SortOrder;
    suggestedByRuleId?: SortOrder;
    externalId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionSumOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[];
    notIn?: number[];
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type EnumRuleModeFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleMode | EnumRuleModeFieldRefInput<$PrismaModel>;
    in?: $Enums.RuleMode[];
    notIn?: $Enums.RuleMode[];
    not?: NestedEnumRuleModeFilter<$PrismaModel> | $Enums.RuleMode;
  };

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | null;
    notIn?: Date[] | string[] | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type CategorizationRuleCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    enabled?: SortOrder;
    priority?: SortOrder;
    categoryId?: SortOrder;
    mode?: SortOrder;
    conditionsJson?: SortOrder;
    matchCount?: SortOrder;
    lastMatched?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategorizationRuleAvgOrderByAggregateInput = {
    priority?: SortOrder;
    matchCount?: SortOrder;
  };

  export type CategorizationRuleMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    enabled?: SortOrder;
    priority?: SortOrder;
    categoryId?: SortOrder;
    mode?: SortOrder;
    conditionsJson?: SortOrder;
    matchCount?: SortOrder;
    lastMatched?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategorizationRuleMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    enabled?: SortOrder;
    priority?: SortOrder;
    categoryId?: SortOrder;
    mode?: SortOrder;
    conditionsJson?: SortOrder;
    matchCount?: SortOrder;
    lastMatched?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type CategorizationRuleSumOrderByAggregateInput = {
    priority?: SortOrder;
    matchCount?: SortOrder;
  };

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[];
    notIn?: number[];
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type EnumRuleModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleMode | EnumRuleModeFieldRefInput<$PrismaModel>;
    in?: $Enums.RuleMode[];
    notIn?: $Enums.RuleMode[];
    not?:
      | NestedEnumRuleModeWithAggregatesFilter<$PrismaModel>
      | $Enums.RuleMode;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRuleModeFilter<$PrismaModel>;
    _max?: NestedEnumRuleModeFilter<$PrismaModel>;
  };

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | null;
    notIn?: Date[] | string[] | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?:
      | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
      | Date
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: NestedDateTimeNullableFilter<$PrismaModel>;
  };

  export type EnumSuggestionStatusFilter<$PrismaModel = never> = {
    equals?:
      | $Enums.SuggestionStatus
      | EnumSuggestionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.SuggestionStatus[];
    notIn?: $Enums.SuggestionStatus[];
    not?:
      | NestedEnumSuggestionStatusFilter<$PrismaModel>
      | $Enums.SuggestionStatus;
  };

  export type RuleSuggestionCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    conditionsJson?: SortOrder;
    categoryId?: SortOrder;
    confidence?: SortOrder;
    matchCount?: SortOrder;
    similarityType?: SortOrder;
    sampleTxIds?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RuleSuggestionAvgOrderByAggregateInput = {
    confidence?: SortOrder;
    matchCount?: SortOrder;
  };

  export type RuleSuggestionMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    conditionsJson?: SortOrder;
    categoryId?: SortOrder;
    confidence?: SortOrder;
    matchCount?: SortOrder;
    similarityType?: SortOrder;
    sampleTxIds?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RuleSuggestionMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    description?: SortOrder;
    conditionsJson?: SortOrder;
    categoryId?: SortOrder;
    confidence?: SortOrder;
    matchCount?: SortOrder;
    similarityType?: SortOrder;
    sampleTxIds?: SortOrder;
    status?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type RuleSuggestionSumOrderByAggregateInput = {
    confidence?: SortOrder;
    matchCount?: SortOrder;
  };

  export type EnumSuggestionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | $Enums.SuggestionStatus
      | EnumSuggestionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.SuggestionStatus[];
    notIn?: $Enums.SuggestionStatus[];
    not?:
      | NestedEnumSuggestionStatusWithAggregatesFilter<$PrismaModel>
      | $Enums.SuggestionStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumSuggestionStatusFilter<$PrismaModel>;
    _max?: NestedEnumSuggestionStatusFilter<$PrismaModel>;
  };

  export type TransactionScalarRelationFilter = {
    is?: TransactionWhereInput;
    isNot?: TransactionWhereInput;
  };

  export type TransactionSplitCountOrderByAggregateInput = {
    id?: SortOrder;
    parentId?: SortOrder;
    amount?: SortOrder;
    categoryId?: SortOrder;
    costObjectId?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionSplitAvgOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type TransactionSplitMaxOrderByAggregateInput = {
    id?: SortOrder;
    parentId?: SortOrder;
    amount?: SortOrder;
    categoryId?: SortOrder;
    costObjectId?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionSplitMinOrderByAggregateInput = {
    id?: SortOrder;
    parentId?: SortOrder;
    amount?: SortOrder;
    categoryId?: SortOrder;
    costObjectId?: SortOrder;
    description?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type TransactionSplitSumOrderByAggregateInput = {
    amount?: SortOrder;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | null;
    notIn?: number[] | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type SavingsGoalCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    targetAmount?: SortOrder;
    startDate?: SortOrder;
    targetDate?: SortOrder;
    savedAmount?: SortOrder;
    isEvergreen?: SortOrder;
    targetMonths?: SortOrder;
    categoryId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type SavingsGoalAvgOrderByAggregateInput = {
    targetAmount?: SortOrder;
    savedAmount?: SortOrder;
    targetMonths?: SortOrder;
  };

  export type SavingsGoalMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    targetAmount?: SortOrder;
    startDate?: SortOrder;
    targetDate?: SortOrder;
    savedAmount?: SortOrder;
    isEvergreen?: SortOrder;
    targetMonths?: SortOrder;
    categoryId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type SavingsGoalMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    targetAmount?: SortOrder;
    startDate?: SortOrder;
    targetDate?: SortOrder;
    savedAmount?: SortOrder;
    isEvergreen?: SortOrder;
    targetMonths?: SortOrder;
    categoryId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type SavingsGoalSumOrderByAggregateInput = {
    targetAmount?: SortOrder;
    savedAmount?: SortOrder;
    targetMonths?: SortOrder;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | null;
    notIn?: number[] | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type SettingCountOrderByAggregateInput = {
    key?: SortOrder;
    value?: SortOrder;
  };

  export type SettingMaxOrderByAggregateInput = {
    key?: SortOrder;
    value?: SortOrder;
  };

  export type SettingMinOrderByAggregateInput = {
    key?: SortOrder;
    value?: SortOrder;
  };

  export type MonthlyBalanceMonthAccountIdCompoundUniqueInput = {
    month: string;
    accountId: string;
  };

  export type MonthlyBalanceCountOrderByAggregateInput = {
    id?: SortOrder;
    month?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MonthlyBalanceAvgOrderByAggregateInput = {
    balance?: SortOrder;
  };

  export type MonthlyBalanceMaxOrderByAggregateInput = {
    id?: SortOrder;
    month?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MonthlyBalanceMinOrderByAggregateInput = {
    id?: SortOrder;
    month?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type MonthlyBalanceSumOrderByAggregateInput = {
    balance?: SortOrder;
  };

  export type AccountBalanceAsOfDateAccountIdCompoundUniqueInput = {
    asOfDate: Date | string;
    accountId: string;
  };

  export type AccountBalanceCountOrderByAggregateInput = {
    id?: SortOrder;
    asOfDate?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    notes?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountBalanceAvgOrderByAggregateInput = {
    balance?: SortOrder;
  };

  export type AccountBalanceMaxOrderByAggregateInput = {
    id?: SortOrder;
    asOfDate?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    notes?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountBalanceMinOrderByAggregateInput = {
    id?: SortOrder;
    asOfDate?: SortOrder;
    balance?: SortOrder;
    accountId?: SortOrder;
    notes?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type AccountBalanceSumOrderByAggregateInput = {
    balance?: SortOrder;
  };

  export type CategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<
      CategoryCreateWithoutChildrenInput,
      CategoryUncheckedCreateWithoutChildrenInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type CategoryCreateNestedManyWithoutParentInput = {
    create?:
      | XOR<
          CategoryCreateWithoutParentInput,
          CategoryUncheckedCreateWithoutParentInput
        >
      | CategoryCreateWithoutParentInput[]
      | CategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | CategoryCreateOrConnectWithoutParentInput
      | CategoryCreateOrConnectWithoutParentInput[];
    createMany?: CategoryCreateManyParentInputEnvelope;
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
  };

  export type TransactionCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCategoryInput,
          TransactionUncheckedCreateWithoutCategoryInput
        >
      | TransactionCreateWithoutCategoryInput[]
      | TransactionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCategoryInput
      | TransactionCreateOrConnectWithoutCategoryInput[];
    createMany?: TransactionCreateManyCategoryInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionSplitCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCategoryInput,
          TransactionSplitUncheckedCreateWithoutCategoryInput
        >
      | TransactionSplitCreateWithoutCategoryInput[]
      | TransactionSplitUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCategoryInput
      | TransactionSplitCreateOrConnectWithoutCategoryInput[];
    createMany?: TransactionSplitCreateManyCategoryInputEnvelope;
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
  };

  export type SavingsGoalCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          SavingsGoalCreateWithoutCategoryInput,
          SavingsGoalUncheckedCreateWithoutCategoryInput
        >
      | SavingsGoalCreateWithoutCategoryInput[]
      | SavingsGoalUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | SavingsGoalCreateOrConnectWithoutCategoryInput
      | SavingsGoalCreateOrConnectWithoutCategoryInput[];
    createMany?: SavingsGoalCreateManyCategoryInputEnvelope;
    connect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
  };

  export type CategorizationRuleCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          CategorizationRuleCreateWithoutCategoryInput,
          CategorizationRuleUncheckedCreateWithoutCategoryInput
        >
      | CategorizationRuleCreateWithoutCategoryInput[]
      | CategorizationRuleUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | CategorizationRuleCreateOrConnectWithoutCategoryInput
      | CategorizationRuleCreateOrConnectWithoutCategoryInput[];
    createMany?: CategorizationRuleCreateManyCategoryInputEnvelope;
    connect?:
      | CategorizationRuleWhereUniqueInput
      | CategorizationRuleWhereUniqueInput[];
  };

  export type RuleSuggestionCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          RuleSuggestionCreateWithoutCategoryInput,
          RuleSuggestionUncheckedCreateWithoutCategoryInput
        >
      | RuleSuggestionCreateWithoutCategoryInput[]
      | RuleSuggestionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | RuleSuggestionCreateOrConnectWithoutCategoryInput
      | RuleSuggestionCreateOrConnectWithoutCategoryInput[];
    createMany?: RuleSuggestionCreateManyCategoryInputEnvelope;
    connect?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
  };

  export type CategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?:
      | XOR<
          CategoryCreateWithoutParentInput,
          CategoryUncheckedCreateWithoutParentInput
        >
      | CategoryCreateWithoutParentInput[]
      | CategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | CategoryCreateOrConnectWithoutParentInput
      | CategoryCreateOrConnectWithoutParentInput[];
    createMany?: CategoryCreateManyParentInputEnvelope;
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCategoryInput,
          TransactionUncheckedCreateWithoutCategoryInput
        >
      | TransactionCreateWithoutCategoryInput[]
      | TransactionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCategoryInput
      | TransactionCreateOrConnectWithoutCategoryInput[];
    createMany?: TransactionCreateManyCategoryInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCategoryInput,
          TransactionSplitUncheckedCreateWithoutCategoryInput
        >
      | TransactionSplitCreateWithoutCategoryInput[]
      | TransactionSplitUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCategoryInput
      | TransactionSplitCreateOrConnectWithoutCategoryInput[];
    createMany?: TransactionSplitCreateManyCategoryInputEnvelope;
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
  };

  export type SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          SavingsGoalCreateWithoutCategoryInput,
          SavingsGoalUncheckedCreateWithoutCategoryInput
        >
      | SavingsGoalCreateWithoutCategoryInput[]
      | SavingsGoalUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | SavingsGoalCreateOrConnectWithoutCategoryInput
      | SavingsGoalCreateOrConnectWithoutCategoryInput[];
    createMany?: SavingsGoalCreateManyCategoryInputEnvelope;
    connect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
  };

  export type CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput =
    {
      create?:
        | XOR<
            CategorizationRuleCreateWithoutCategoryInput,
            CategorizationRuleUncheckedCreateWithoutCategoryInput
          >
        | CategorizationRuleCreateWithoutCategoryInput[]
        | CategorizationRuleUncheckedCreateWithoutCategoryInput[];
      connectOrCreate?:
        | CategorizationRuleCreateOrConnectWithoutCategoryInput
        | CategorizationRuleCreateOrConnectWithoutCategoryInput[];
      createMany?: CategorizationRuleCreateManyCategoryInputEnvelope;
      connect?:
        | CategorizationRuleWhereUniqueInput
        | CategorizationRuleWhereUniqueInput[];
    };

  export type RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput = {
    create?:
      | XOR<
          RuleSuggestionCreateWithoutCategoryInput,
          RuleSuggestionUncheckedCreateWithoutCategoryInput
        >
      | RuleSuggestionCreateWithoutCategoryInput[]
      | RuleSuggestionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | RuleSuggestionCreateOrConnectWithoutCategoryInput
      | RuleSuggestionCreateOrConnectWithoutCategoryInput[];
    createMany?: RuleSuggestionCreateManyCategoryInputEnvelope;
    connect?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null;
    increment?: Decimal | DecimalJsLike | number | string;
    decrement?: Decimal | DecimalJsLike | number | string;
    multiply?: Decimal | DecimalJsLike | number | string;
    divide?: Decimal | DecimalJsLike | number | string;
  };

  export type EnumCategoryTypeFieldUpdateOperationsInput = {
    set?: $Enums.CategoryType;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type CategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<
      CategoryCreateWithoutChildrenInput,
      CategoryUncheckedCreateWithoutChildrenInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput;
    upsert?: CategoryUpsertWithoutChildrenInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutChildrenInput,
        CategoryUpdateWithoutChildrenInput
      >,
      CategoryUncheckedUpdateWithoutChildrenInput
    >;
  };

  export type CategoryUpdateManyWithoutParentNestedInput = {
    create?:
      | XOR<
          CategoryCreateWithoutParentInput,
          CategoryUncheckedCreateWithoutParentInput
        >
      | CategoryCreateWithoutParentInput[]
      | CategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | CategoryCreateOrConnectWithoutParentInput
      | CategoryCreateOrConnectWithoutParentInput[];
    upsert?:
      | CategoryUpsertWithWhereUniqueWithoutParentInput
      | CategoryUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: CategoryCreateManyParentInputEnvelope;
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    update?:
      | CategoryUpdateWithWhereUniqueWithoutParentInput
      | CategoryUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?:
      | CategoryUpdateManyWithWhereWithoutParentInput
      | CategoryUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[];
  };

  export type TransactionUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCategoryInput,
          TransactionUncheckedCreateWithoutCategoryInput
        >
      | TransactionCreateWithoutCategoryInput[]
      | TransactionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCategoryInput
      | TransactionCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCategoryInput
      | TransactionUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: TransactionCreateManyCategoryInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCategoryInput
      | TransactionUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCategoryInput
      | TransactionUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionSplitUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCategoryInput,
          TransactionSplitUncheckedCreateWithoutCategoryInput
        >
      | TransactionSplitCreateWithoutCategoryInput[]
      | TransactionSplitUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCategoryInput
      | TransactionSplitCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | TransactionSplitUpsertWithWhereUniqueWithoutCategoryInput
      | TransactionSplitUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: TransactionSplitCreateManyCategoryInputEnvelope;
    set?: TransactionSplitWhereUniqueInput | TransactionSplitWhereUniqueInput[];
    disconnect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    delete?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    update?:
      | TransactionSplitUpdateWithWhereUniqueWithoutCategoryInput
      | TransactionSplitUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | TransactionSplitUpdateManyWithWhereWithoutCategoryInput
      | TransactionSplitUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?:
      | TransactionSplitScalarWhereInput
      | TransactionSplitScalarWhereInput[];
  };

  export type SavingsGoalUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          SavingsGoalCreateWithoutCategoryInput,
          SavingsGoalUncheckedCreateWithoutCategoryInput
        >
      | SavingsGoalCreateWithoutCategoryInput[]
      | SavingsGoalUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | SavingsGoalCreateOrConnectWithoutCategoryInput
      | SavingsGoalCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | SavingsGoalUpsertWithWhereUniqueWithoutCategoryInput
      | SavingsGoalUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: SavingsGoalCreateManyCategoryInputEnvelope;
    set?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    disconnect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    delete?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    connect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    update?:
      | SavingsGoalUpdateWithWhereUniqueWithoutCategoryInput
      | SavingsGoalUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | SavingsGoalUpdateManyWithWhereWithoutCategoryInput
      | SavingsGoalUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: SavingsGoalScalarWhereInput | SavingsGoalScalarWhereInput[];
  };

  export type CategorizationRuleUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          CategorizationRuleCreateWithoutCategoryInput,
          CategorizationRuleUncheckedCreateWithoutCategoryInput
        >
      | CategorizationRuleCreateWithoutCategoryInput[]
      | CategorizationRuleUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | CategorizationRuleCreateOrConnectWithoutCategoryInput
      | CategorizationRuleCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | CategorizationRuleUpsertWithWhereUniqueWithoutCategoryInput
      | CategorizationRuleUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: CategorizationRuleCreateManyCategoryInputEnvelope;
    set?:
      | CategorizationRuleWhereUniqueInput
      | CategorizationRuleWhereUniqueInput[];
    disconnect?:
      | CategorizationRuleWhereUniqueInput
      | CategorizationRuleWhereUniqueInput[];
    delete?:
      | CategorizationRuleWhereUniqueInput
      | CategorizationRuleWhereUniqueInput[];
    connect?:
      | CategorizationRuleWhereUniqueInput
      | CategorizationRuleWhereUniqueInput[];
    update?:
      | CategorizationRuleUpdateWithWhereUniqueWithoutCategoryInput
      | CategorizationRuleUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | CategorizationRuleUpdateManyWithWhereWithoutCategoryInput
      | CategorizationRuleUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?:
      | CategorizationRuleScalarWhereInput
      | CategorizationRuleScalarWhereInput[];
  };

  export type RuleSuggestionUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          RuleSuggestionCreateWithoutCategoryInput,
          RuleSuggestionUncheckedCreateWithoutCategoryInput
        >
      | RuleSuggestionCreateWithoutCategoryInput[]
      | RuleSuggestionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | RuleSuggestionCreateOrConnectWithoutCategoryInput
      | RuleSuggestionCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | RuleSuggestionUpsertWithWhereUniqueWithoutCategoryInput
      | RuleSuggestionUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: RuleSuggestionCreateManyCategoryInputEnvelope;
    set?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    disconnect?:
      | RuleSuggestionWhereUniqueInput
      | RuleSuggestionWhereUniqueInput[];
    delete?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    connect?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    update?:
      | RuleSuggestionUpdateWithWhereUniqueWithoutCategoryInput
      | RuleSuggestionUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | RuleSuggestionUpdateManyWithWhereWithoutCategoryInput
      | RuleSuggestionUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?:
      | RuleSuggestionScalarWhereInput
      | RuleSuggestionScalarWhereInput[];
  };

  export type CategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?:
      | XOR<
          CategoryCreateWithoutParentInput,
          CategoryUncheckedCreateWithoutParentInput
        >
      | CategoryCreateWithoutParentInput[]
      | CategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | CategoryCreateOrConnectWithoutParentInput
      | CategoryCreateOrConnectWithoutParentInput[];
    upsert?:
      | CategoryUpsertWithWhereUniqueWithoutParentInput
      | CategoryUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: CategoryCreateManyParentInputEnvelope;
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[];
    update?:
      | CategoryUpdateWithWhereUniqueWithoutParentInput
      | CategoryUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?:
      | CategoryUpdateManyWithWhereWithoutParentInput
      | CategoryUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCategoryInput,
          TransactionUncheckedCreateWithoutCategoryInput
        >
      | TransactionCreateWithoutCategoryInput[]
      | TransactionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCategoryInput
      | TransactionCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCategoryInput
      | TransactionUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: TransactionCreateManyCategoryInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCategoryInput
      | TransactionUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCategoryInput
      | TransactionUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCategoryInput,
          TransactionSplitUncheckedCreateWithoutCategoryInput
        >
      | TransactionSplitCreateWithoutCategoryInput[]
      | TransactionSplitUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCategoryInput
      | TransactionSplitCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | TransactionSplitUpsertWithWhereUniqueWithoutCategoryInput
      | TransactionSplitUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: TransactionSplitCreateManyCategoryInputEnvelope;
    set?: TransactionSplitWhereUniqueInput | TransactionSplitWhereUniqueInput[];
    disconnect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    delete?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    update?:
      | TransactionSplitUpdateWithWhereUniqueWithoutCategoryInput
      | TransactionSplitUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | TransactionSplitUpdateManyWithWhereWithoutCategoryInput
      | TransactionSplitUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?:
      | TransactionSplitScalarWhereInput
      | TransactionSplitScalarWhereInput[];
  };

  export type SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          SavingsGoalCreateWithoutCategoryInput,
          SavingsGoalUncheckedCreateWithoutCategoryInput
        >
      | SavingsGoalCreateWithoutCategoryInput[]
      | SavingsGoalUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | SavingsGoalCreateOrConnectWithoutCategoryInput
      | SavingsGoalCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | SavingsGoalUpsertWithWhereUniqueWithoutCategoryInput
      | SavingsGoalUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: SavingsGoalCreateManyCategoryInputEnvelope;
    set?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    disconnect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    delete?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    connect?: SavingsGoalWhereUniqueInput | SavingsGoalWhereUniqueInput[];
    update?:
      | SavingsGoalUpdateWithWhereUniqueWithoutCategoryInput
      | SavingsGoalUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | SavingsGoalUpdateManyWithWhereWithoutCategoryInput
      | SavingsGoalUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: SavingsGoalScalarWhereInput | SavingsGoalScalarWhereInput[];
  };

  export type CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput =
    {
      create?:
        | XOR<
            CategorizationRuleCreateWithoutCategoryInput,
            CategorizationRuleUncheckedCreateWithoutCategoryInput
          >
        | CategorizationRuleCreateWithoutCategoryInput[]
        | CategorizationRuleUncheckedCreateWithoutCategoryInput[];
      connectOrCreate?:
        | CategorizationRuleCreateOrConnectWithoutCategoryInput
        | CategorizationRuleCreateOrConnectWithoutCategoryInput[];
      upsert?:
        | CategorizationRuleUpsertWithWhereUniqueWithoutCategoryInput
        | CategorizationRuleUpsertWithWhereUniqueWithoutCategoryInput[];
      createMany?: CategorizationRuleCreateManyCategoryInputEnvelope;
      set?:
        | CategorizationRuleWhereUniqueInput
        | CategorizationRuleWhereUniqueInput[];
      disconnect?:
        | CategorizationRuleWhereUniqueInput
        | CategorizationRuleWhereUniqueInput[];
      delete?:
        | CategorizationRuleWhereUniqueInput
        | CategorizationRuleWhereUniqueInput[];
      connect?:
        | CategorizationRuleWhereUniqueInput
        | CategorizationRuleWhereUniqueInput[];
      update?:
        | CategorizationRuleUpdateWithWhereUniqueWithoutCategoryInput
        | CategorizationRuleUpdateWithWhereUniqueWithoutCategoryInput[];
      updateMany?:
        | CategorizationRuleUpdateManyWithWhereWithoutCategoryInput
        | CategorizationRuleUpdateManyWithWhereWithoutCategoryInput[];
      deleteMany?:
        | CategorizationRuleScalarWhereInput
        | CategorizationRuleScalarWhereInput[];
    };

  export type RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?:
      | XOR<
          RuleSuggestionCreateWithoutCategoryInput,
          RuleSuggestionUncheckedCreateWithoutCategoryInput
        >
      | RuleSuggestionCreateWithoutCategoryInput[]
      | RuleSuggestionUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?:
      | RuleSuggestionCreateOrConnectWithoutCategoryInput
      | RuleSuggestionCreateOrConnectWithoutCategoryInput[];
    upsert?:
      | RuleSuggestionUpsertWithWhereUniqueWithoutCategoryInput
      | RuleSuggestionUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: RuleSuggestionCreateManyCategoryInputEnvelope;
    set?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    disconnect?:
      | RuleSuggestionWhereUniqueInput
      | RuleSuggestionWhereUniqueInput[];
    delete?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    connect?: RuleSuggestionWhereUniqueInput | RuleSuggestionWhereUniqueInput[];
    update?:
      | RuleSuggestionUpdateWithWhereUniqueWithoutCategoryInput
      | RuleSuggestionUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?:
      | RuleSuggestionUpdateManyWithWhereWithoutCategoryInput
      | RuleSuggestionUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?:
      | RuleSuggestionScalarWhereInput
      | RuleSuggestionScalarWhereInput[];
  };

  export type TransactionCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          TransactionCreateWithoutAccountInput,
          TransactionUncheckedCreateWithoutAccountInput
        >
      | TransactionCreateWithoutAccountInput[]
      | TransactionUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutAccountInput
      | TransactionCreateOrConnectWithoutAccountInput[];
    createMany?: TransactionCreateManyAccountInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type MonthlyBalanceCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          MonthlyBalanceCreateWithoutAccountInput,
          MonthlyBalanceUncheckedCreateWithoutAccountInput
        >
      | MonthlyBalanceCreateWithoutAccountInput[]
      | MonthlyBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | MonthlyBalanceCreateOrConnectWithoutAccountInput
      | MonthlyBalanceCreateOrConnectWithoutAccountInput[];
    createMany?: MonthlyBalanceCreateManyAccountInputEnvelope;
    connect?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
  };

  export type AccountBalanceCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          AccountBalanceCreateWithoutAccountInput,
          AccountBalanceUncheckedCreateWithoutAccountInput
        >
      | AccountBalanceCreateWithoutAccountInput[]
      | AccountBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | AccountBalanceCreateOrConnectWithoutAccountInput
      | AccountBalanceCreateOrConnectWithoutAccountInput[];
    createMany?: AccountBalanceCreateManyAccountInputEnvelope;
    connect?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          TransactionCreateWithoutAccountInput,
          TransactionUncheckedCreateWithoutAccountInput
        >
      | TransactionCreateWithoutAccountInput[]
      | TransactionUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutAccountInput
      | TransactionCreateOrConnectWithoutAccountInput[];
    createMany?: TransactionCreateManyAccountInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type MonthlyBalanceUncheckedCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          MonthlyBalanceCreateWithoutAccountInput,
          MonthlyBalanceUncheckedCreateWithoutAccountInput
        >
      | MonthlyBalanceCreateWithoutAccountInput[]
      | MonthlyBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | MonthlyBalanceCreateOrConnectWithoutAccountInput
      | MonthlyBalanceCreateOrConnectWithoutAccountInput[];
    createMany?: MonthlyBalanceCreateManyAccountInputEnvelope;
    connect?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
  };

  export type AccountBalanceUncheckedCreateNestedManyWithoutAccountInput = {
    create?:
      | XOR<
          AccountBalanceCreateWithoutAccountInput,
          AccountBalanceUncheckedCreateWithoutAccountInput
        >
      | AccountBalanceCreateWithoutAccountInput[]
      | AccountBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | AccountBalanceCreateOrConnectWithoutAccountInput
      | AccountBalanceCreateOrConnectWithoutAccountInput[];
    createMany?: AccountBalanceCreateManyAccountInputEnvelope;
    connect?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
  };

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string;
    increment?: Decimal | DecimalJsLike | number | string;
    decrement?: Decimal | DecimalJsLike | number | string;
    multiply?: Decimal | DecimalJsLike | number | string;
    divide?: Decimal | DecimalJsLike | number | string;
  };

  export type EnumAccountTypeFieldUpdateOperationsInput = {
    set?: $Enums.AccountType;
  };

  export type TransactionUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutAccountInput,
          TransactionUncheckedCreateWithoutAccountInput
        >
      | TransactionCreateWithoutAccountInput[]
      | TransactionUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutAccountInput
      | TransactionCreateOrConnectWithoutAccountInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutAccountInput
      | TransactionUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: TransactionCreateManyAccountInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutAccountInput
      | TransactionUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutAccountInput
      | TransactionUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type MonthlyBalanceUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          MonthlyBalanceCreateWithoutAccountInput,
          MonthlyBalanceUncheckedCreateWithoutAccountInput
        >
      | MonthlyBalanceCreateWithoutAccountInput[]
      | MonthlyBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | MonthlyBalanceCreateOrConnectWithoutAccountInput
      | MonthlyBalanceCreateOrConnectWithoutAccountInput[];
    upsert?:
      | MonthlyBalanceUpsertWithWhereUniqueWithoutAccountInput
      | MonthlyBalanceUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: MonthlyBalanceCreateManyAccountInputEnvelope;
    set?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    disconnect?:
      | MonthlyBalanceWhereUniqueInput
      | MonthlyBalanceWhereUniqueInput[];
    delete?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    connect?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    update?:
      | MonthlyBalanceUpdateWithWhereUniqueWithoutAccountInput
      | MonthlyBalanceUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | MonthlyBalanceUpdateManyWithWhereWithoutAccountInput
      | MonthlyBalanceUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?:
      | MonthlyBalanceScalarWhereInput
      | MonthlyBalanceScalarWhereInput[];
  };

  export type AccountBalanceUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          AccountBalanceCreateWithoutAccountInput,
          AccountBalanceUncheckedCreateWithoutAccountInput
        >
      | AccountBalanceCreateWithoutAccountInput[]
      | AccountBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | AccountBalanceCreateOrConnectWithoutAccountInput
      | AccountBalanceCreateOrConnectWithoutAccountInput[];
    upsert?:
      | AccountBalanceUpsertWithWhereUniqueWithoutAccountInput
      | AccountBalanceUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: AccountBalanceCreateManyAccountInputEnvelope;
    set?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    disconnect?:
      | AccountBalanceWhereUniqueInput
      | AccountBalanceWhereUniqueInput[];
    delete?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    connect?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    update?:
      | AccountBalanceUpdateWithWhereUniqueWithoutAccountInput
      | AccountBalanceUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | AccountBalanceUpdateManyWithWhereWithoutAccountInput
      | AccountBalanceUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?:
      | AccountBalanceScalarWhereInput
      | AccountBalanceScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutAccountInput,
          TransactionUncheckedCreateWithoutAccountInput
        >
      | TransactionCreateWithoutAccountInput[]
      | TransactionUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutAccountInput
      | TransactionCreateOrConnectWithoutAccountInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutAccountInput
      | TransactionUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: TransactionCreateManyAccountInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutAccountInput
      | TransactionUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutAccountInput
      | TransactionUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type MonthlyBalanceUncheckedUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          MonthlyBalanceCreateWithoutAccountInput,
          MonthlyBalanceUncheckedCreateWithoutAccountInput
        >
      | MonthlyBalanceCreateWithoutAccountInput[]
      | MonthlyBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | MonthlyBalanceCreateOrConnectWithoutAccountInput
      | MonthlyBalanceCreateOrConnectWithoutAccountInput[];
    upsert?:
      | MonthlyBalanceUpsertWithWhereUniqueWithoutAccountInput
      | MonthlyBalanceUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: MonthlyBalanceCreateManyAccountInputEnvelope;
    set?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    disconnect?:
      | MonthlyBalanceWhereUniqueInput
      | MonthlyBalanceWhereUniqueInput[];
    delete?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    connect?: MonthlyBalanceWhereUniqueInput | MonthlyBalanceWhereUniqueInput[];
    update?:
      | MonthlyBalanceUpdateWithWhereUniqueWithoutAccountInput
      | MonthlyBalanceUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | MonthlyBalanceUpdateManyWithWhereWithoutAccountInput
      | MonthlyBalanceUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?:
      | MonthlyBalanceScalarWhereInput
      | MonthlyBalanceScalarWhereInput[];
  };

  export type AccountBalanceUncheckedUpdateManyWithoutAccountNestedInput = {
    create?:
      | XOR<
          AccountBalanceCreateWithoutAccountInput,
          AccountBalanceUncheckedCreateWithoutAccountInput
        >
      | AccountBalanceCreateWithoutAccountInput[]
      | AccountBalanceUncheckedCreateWithoutAccountInput[];
    connectOrCreate?:
      | AccountBalanceCreateOrConnectWithoutAccountInput
      | AccountBalanceCreateOrConnectWithoutAccountInput[];
    upsert?:
      | AccountBalanceUpsertWithWhereUniqueWithoutAccountInput
      | AccountBalanceUpsertWithWhereUniqueWithoutAccountInput[];
    createMany?: AccountBalanceCreateManyAccountInputEnvelope;
    set?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    disconnect?:
      | AccountBalanceWhereUniqueInput
      | AccountBalanceWhereUniqueInput[];
    delete?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    connect?: AccountBalanceWhereUniqueInput | AccountBalanceWhereUniqueInput[];
    update?:
      | AccountBalanceUpdateWithWhereUniqueWithoutAccountInput
      | AccountBalanceUpdateWithWhereUniqueWithoutAccountInput[];
    updateMany?:
      | AccountBalanceUpdateManyWithWhereWithoutAccountInput
      | AccountBalanceUpdateManyWithWhereWithoutAccountInput[];
    deleteMany?:
      | AccountBalanceScalarWhereInput
      | AccountBalanceScalarWhereInput[];
  };

  export type TransactionCreateNestedManyWithoutCostObjectInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCostObjectInput,
          TransactionUncheckedCreateWithoutCostObjectInput
        >
      | TransactionCreateWithoutCostObjectInput[]
      | TransactionUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCostObjectInput
      | TransactionCreateOrConnectWithoutCostObjectInput[];
    createMany?: TransactionCreateManyCostObjectInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionSplitCreateNestedManyWithoutCostObjectInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCostObjectInput,
          TransactionSplitUncheckedCreateWithoutCostObjectInput
        >
      | TransactionSplitCreateWithoutCostObjectInput[]
      | TransactionSplitUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCostObjectInput
      | TransactionSplitCreateOrConnectWithoutCostObjectInput[];
    createMany?: TransactionSplitCreateManyCostObjectInputEnvelope;
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutCostObjectInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCostObjectInput,
          TransactionUncheckedCreateWithoutCostObjectInput
        >
      | TransactionCreateWithoutCostObjectInput[]
      | TransactionUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCostObjectInput
      | TransactionCreateOrConnectWithoutCostObjectInput[];
    createMany?: TransactionCreateManyCostObjectInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionSplitUncheckedCreateNestedManyWithoutCostObjectInput =
    {
      create?:
        | XOR<
            TransactionSplitCreateWithoutCostObjectInput,
            TransactionSplitUncheckedCreateWithoutCostObjectInput
          >
        | TransactionSplitCreateWithoutCostObjectInput[]
        | TransactionSplitUncheckedCreateWithoutCostObjectInput[];
      connectOrCreate?:
        | TransactionSplitCreateOrConnectWithoutCostObjectInput
        | TransactionSplitCreateOrConnectWithoutCostObjectInput[];
      createMany?: TransactionSplitCreateManyCostObjectInputEnvelope;
      connect?:
        | TransactionSplitWhereUniqueInput
        | TransactionSplitWhereUniqueInput[];
    };

  export type TransactionUpdateManyWithoutCostObjectNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCostObjectInput,
          TransactionUncheckedCreateWithoutCostObjectInput
        >
      | TransactionCreateWithoutCostObjectInput[]
      | TransactionUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCostObjectInput
      | TransactionCreateOrConnectWithoutCostObjectInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCostObjectInput
      | TransactionUpsertWithWhereUniqueWithoutCostObjectInput[];
    createMany?: TransactionCreateManyCostObjectInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCostObjectInput
      | TransactionUpdateWithWhereUniqueWithoutCostObjectInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCostObjectInput
      | TransactionUpdateManyWithWhereWithoutCostObjectInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionSplitUpdateManyWithoutCostObjectNestedInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutCostObjectInput,
          TransactionSplitUncheckedCreateWithoutCostObjectInput
        >
      | TransactionSplitCreateWithoutCostObjectInput[]
      | TransactionSplitUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutCostObjectInput
      | TransactionSplitCreateOrConnectWithoutCostObjectInput[];
    upsert?:
      | TransactionSplitUpsertWithWhereUniqueWithoutCostObjectInput
      | TransactionSplitUpsertWithWhereUniqueWithoutCostObjectInput[];
    createMany?: TransactionSplitCreateManyCostObjectInputEnvelope;
    set?: TransactionSplitWhereUniqueInput | TransactionSplitWhereUniqueInput[];
    disconnect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    delete?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    update?:
      | TransactionSplitUpdateWithWhereUniqueWithoutCostObjectInput
      | TransactionSplitUpdateWithWhereUniqueWithoutCostObjectInput[];
    updateMany?:
      | TransactionSplitUpdateManyWithWhereWithoutCostObjectInput
      | TransactionSplitUpdateManyWithWhereWithoutCostObjectInput[];
    deleteMany?:
      | TransactionSplitScalarWhereInput
      | TransactionSplitScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutCostObjectNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutCostObjectInput,
          TransactionUncheckedCreateWithoutCostObjectInput
        >
      | TransactionCreateWithoutCostObjectInput[]
      | TransactionUncheckedCreateWithoutCostObjectInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutCostObjectInput
      | TransactionCreateOrConnectWithoutCostObjectInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutCostObjectInput
      | TransactionUpsertWithWhereUniqueWithoutCostObjectInput[];
    createMany?: TransactionCreateManyCostObjectInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutCostObjectInput
      | TransactionUpdateWithWhereUniqueWithoutCostObjectInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutCostObjectInput
      | TransactionUpdateManyWithWhereWithoutCostObjectInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionSplitUncheckedUpdateManyWithoutCostObjectNestedInput =
    {
      create?:
        | XOR<
            TransactionSplitCreateWithoutCostObjectInput,
            TransactionSplitUncheckedCreateWithoutCostObjectInput
          >
        | TransactionSplitCreateWithoutCostObjectInput[]
        | TransactionSplitUncheckedCreateWithoutCostObjectInput[];
      connectOrCreate?:
        | TransactionSplitCreateOrConnectWithoutCostObjectInput
        | TransactionSplitCreateOrConnectWithoutCostObjectInput[];
      upsert?:
        | TransactionSplitUpsertWithWhereUniqueWithoutCostObjectInput
        | TransactionSplitUpsertWithWhereUniqueWithoutCostObjectInput[];
      createMany?: TransactionSplitCreateManyCostObjectInputEnvelope;
      set?:
        | TransactionSplitWhereUniqueInput
        | TransactionSplitWhereUniqueInput[];
      disconnect?:
        | TransactionSplitWhereUniqueInput
        | TransactionSplitWhereUniqueInput[];
      delete?:
        | TransactionSplitWhereUniqueInput
        | TransactionSplitWhereUniqueInput[];
      connect?:
        | TransactionSplitWhereUniqueInput
        | TransactionSplitWhereUniqueInput[];
      update?:
        | TransactionSplitUpdateWithWhereUniqueWithoutCostObjectInput
        | TransactionSplitUpdateWithWhereUniqueWithoutCostObjectInput[];
      updateMany?:
        | TransactionSplitUpdateManyWithWhereWithoutCostObjectInput
        | TransactionSplitUpdateManyWithWhereWithoutCostObjectInput[];
      deleteMany?:
        | TransactionSplitScalarWhereInput
        | TransactionSplitScalarWhereInput[];
    };

  export type CategoryCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<
      CategoryCreateWithoutTransactionsInput,
      CategoryUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutTransactionsInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type AccountCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<
      AccountCreateWithoutTransactionsInput,
      AccountUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutTransactionsInput;
    connect?: AccountWhereUniqueInput;
  };

  export type CostObjectCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<
      CostObjectCreateWithoutTransactionsInput,
      CostObjectUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: CostObjectCreateOrConnectWithoutTransactionsInput;
    connect?: CostObjectWhereUniqueInput;
  };

  export type CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput =
    {
      create?: XOR<
        CategorizationRuleCreateWithoutSuggestedTransactionsInput,
        CategorizationRuleUncheckedCreateWithoutSuggestedTransactionsInput
      >;
      connectOrCreate?: CategorizationRuleCreateOrConnectWithoutSuggestedTransactionsInput;
      connect?: CategorizationRuleWhereUniqueInput;
    };

  export type TransactionSplitCreateNestedManyWithoutParentInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutParentInput,
          TransactionSplitUncheckedCreateWithoutParentInput
        >
      | TransactionSplitCreateWithoutParentInput[]
      | TransactionSplitUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutParentInput
      | TransactionSplitCreateOrConnectWithoutParentInput[];
    createMany?: TransactionSplitCreateManyParentInputEnvelope;
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
  };

  export type TransactionSplitUncheckedCreateNestedManyWithoutParentInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutParentInput,
          TransactionSplitUncheckedCreateWithoutParentInput
        >
      | TransactionSplitCreateWithoutParentInput[]
      | TransactionSplitUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutParentInput
      | TransactionSplitCreateOrConnectWithoutParentInput[];
    createMany?: TransactionSplitCreateManyParentInputEnvelope;
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
  };

  export type CategoryUpdateOneWithoutTransactionsNestedInput = {
    create?: XOR<
      CategoryCreateWithoutTransactionsInput,
      CategoryUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutTransactionsInput;
    upsert?: CategoryUpsertWithoutTransactionsInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutTransactionsInput,
        CategoryUpdateWithoutTransactionsInput
      >,
      CategoryUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type AccountUpdateOneWithoutTransactionsNestedInput = {
    create?: XOR<
      AccountCreateWithoutTransactionsInput,
      AccountUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutTransactionsInput;
    upsert?: AccountUpsertWithoutTransactionsInput;
    disconnect?: AccountWhereInput | boolean;
    delete?: AccountWhereInput | boolean;
    connect?: AccountWhereUniqueInput;
    update?: XOR<
      XOR<
        AccountUpdateToOneWithWhereWithoutTransactionsInput,
        AccountUpdateWithoutTransactionsInput
      >,
      AccountUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type CostObjectUpdateOneWithoutTransactionsNestedInput = {
    create?: XOR<
      CostObjectCreateWithoutTransactionsInput,
      CostObjectUncheckedCreateWithoutTransactionsInput
    >;
    connectOrCreate?: CostObjectCreateOrConnectWithoutTransactionsInput;
    upsert?: CostObjectUpsertWithoutTransactionsInput;
    disconnect?: CostObjectWhereInput | boolean;
    delete?: CostObjectWhereInput | boolean;
    connect?: CostObjectWhereUniqueInput;
    update?: XOR<
      XOR<
        CostObjectUpdateToOneWithWhereWithoutTransactionsInput,
        CostObjectUpdateWithoutTransactionsInput
      >,
      CostObjectUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput =
    {
      create?: XOR<
        CategorizationRuleCreateWithoutSuggestedTransactionsInput,
        CategorizationRuleUncheckedCreateWithoutSuggestedTransactionsInput
      >;
      connectOrCreate?: CategorizationRuleCreateOrConnectWithoutSuggestedTransactionsInput;
      upsert?: CategorizationRuleUpsertWithoutSuggestedTransactionsInput;
      disconnect?: CategorizationRuleWhereInput | boolean;
      delete?: CategorizationRuleWhereInput | boolean;
      connect?: CategorizationRuleWhereUniqueInput;
      update?: XOR<
        XOR<
          CategorizationRuleUpdateToOneWithWhereWithoutSuggestedTransactionsInput,
          CategorizationRuleUpdateWithoutSuggestedTransactionsInput
        >,
        CategorizationRuleUncheckedUpdateWithoutSuggestedTransactionsInput
      >;
    };

  export type TransactionSplitUpdateManyWithoutParentNestedInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutParentInput,
          TransactionSplitUncheckedCreateWithoutParentInput
        >
      | TransactionSplitCreateWithoutParentInput[]
      | TransactionSplitUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutParentInput
      | TransactionSplitCreateOrConnectWithoutParentInput[];
    upsert?:
      | TransactionSplitUpsertWithWhereUniqueWithoutParentInput
      | TransactionSplitUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: TransactionSplitCreateManyParentInputEnvelope;
    set?: TransactionSplitWhereUniqueInput | TransactionSplitWhereUniqueInput[];
    disconnect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    delete?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    update?:
      | TransactionSplitUpdateWithWhereUniqueWithoutParentInput
      | TransactionSplitUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?:
      | TransactionSplitUpdateManyWithWhereWithoutParentInput
      | TransactionSplitUpdateManyWithWhereWithoutParentInput[];
    deleteMany?:
      | TransactionSplitScalarWhereInput
      | TransactionSplitScalarWhereInput[];
  };

  export type TransactionSplitUncheckedUpdateManyWithoutParentNestedInput = {
    create?:
      | XOR<
          TransactionSplitCreateWithoutParentInput,
          TransactionSplitUncheckedCreateWithoutParentInput
        >
      | TransactionSplitCreateWithoutParentInput[]
      | TransactionSplitUncheckedCreateWithoutParentInput[];
    connectOrCreate?:
      | TransactionSplitCreateOrConnectWithoutParentInput
      | TransactionSplitCreateOrConnectWithoutParentInput[];
    upsert?:
      | TransactionSplitUpsertWithWhereUniqueWithoutParentInput
      | TransactionSplitUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: TransactionSplitCreateManyParentInputEnvelope;
    set?: TransactionSplitWhereUniqueInput | TransactionSplitWhereUniqueInput[];
    disconnect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    delete?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    connect?:
      | TransactionSplitWhereUniqueInput
      | TransactionSplitWhereUniqueInput[];
    update?:
      | TransactionSplitUpdateWithWhereUniqueWithoutParentInput
      | TransactionSplitUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?:
      | TransactionSplitUpdateManyWithWhereWithoutParentInput
      | TransactionSplitUpdateManyWithWhereWithoutParentInput[];
    deleteMany?:
      | TransactionSplitScalarWhereInput
      | TransactionSplitScalarWhereInput[];
  };

  export type CategoryCreateNestedOneWithoutCategorizationRulesInput = {
    create?: XOR<
      CategoryCreateWithoutCategorizationRulesInput,
      CategoryUncheckedCreateWithoutCategorizationRulesInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutCategorizationRulesInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type TransactionCreateNestedManyWithoutSuggestedRuleInput = {
    create?:
      | XOR<
          TransactionCreateWithoutSuggestedRuleInput,
          TransactionUncheckedCreateWithoutSuggestedRuleInput
        >
      | TransactionCreateWithoutSuggestedRuleInput[]
      | TransactionUncheckedCreateWithoutSuggestedRuleInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutSuggestedRuleInput
      | TransactionCreateOrConnectWithoutSuggestedRuleInput[];
    createMany?: TransactionCreateManySuggestedRuleInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type TransactionUncheckedCreateNestedManyWithoutSuggestedRuleInput = {
    create?:
      | XOR<
          TransactionCreateWithoutSuggestedRuleInput,
          TransactionUncheckedCreateWithoutSuggestedRuleInput
        >
      | TransactionCreateWithoutSuggestedRuleInput[]
      | TransactionUncheckedCreateWithoutSuggestedRuleInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutSuggestedRuleInput
      | TransactionCreateOrConnectWithoutSuggestedRuleInput[];
    createMany?: TransactionCreateManySuggestedRuleInputEnvelope;
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
  };

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };

  export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type EnumRuleModeFieldUpdateOperationsInput = {
    set?: $Enums.RuleMode;
  };

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
  };

  export type CategoryUpdateOneWithoutCategorizationRulesNestedInput = {
    create?: XOR<
      CategoryCreateWithoutCategorizationRulesInput,
      CategoryUncheckedCreateWithoutCategorizationRulesInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutCategorizationRulesInput;
    upsert?: CategoryUpsertWithoutCategorizationRulesInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutCategorizationRulesInput,
        CategoryUpdateWithoutCategorizationRulesInput
      >,
      CategoryUncheckedUpdateWithoutCategorizationRulesInput
    >;
  };

  export type TransactionUpdateManyWithoutSuggestedRuleNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutSuggestedRuleInput,
          TransactionUncheckedCreateWithoutSuggestedRuleInput
        >
      | TransactionCreateWithoutSuggestedRuleInput[]
      | TransactionUncheckedCreateWithoutSuggestedRuleInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutSuggestedRuleInput
      | TransactionCreateOrConnectWithoutSuggestedRuleInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutSuggestedRuleInput
      | TransactionUpsertWithWhereUniqueWithoutSuggestedRuleInput[];
    createMany?: TransactionCreateManySuggestedRuleInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutSuggestedRuleInput
      | TransactionUpdateWithWhereUniqueWithoutSuggestedRuleInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutSuggestedRuleInput
      | TransactionUpdateManyWithWhereWithoutSuggestedRuleInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type TransactionUncheckedUpdateManyWithoutSuggestedRuleNestedInput = {
    create?:
      | XOR<
          TransactionCreateWithoutSuggestedRuleInput,
          TransactionUncheckedCreateWithoutSuggestedRuleInput
        >
      | TransactionCreateWithoutSuggestedRuleInput[]
      | TransactionUncheckedCreateWithoutSuggestedRuleInput[];
    connectOrCreate?:
      | TransactionCreateOrConnectWithoutSuggestedRuleInput
      | TransactionCreateOrConnectWithoutSuggestedRuleInput[];
    upsert?:
      | TransactionUpsertWithWhereUniqueWithoutSuggestedRuleInput
      | TransactionUpsertWithWhereUniqueWithoutSuggestedRuleInput[];
    createMany?: TransactionCreateManySuggestedRuleInputEnvelope;
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[];
    update?:
      | TransactionUpdateWithWhereUniqueWithoutSuggestedRuleInput
      | TransactionUpdateWithWhereUniqueWithoutSuggestedRuleInput[];
    updateMany?:
      | TransactionUpdateManyWithWhereWithoutSuggestedRuleInput
      | TransactionUpdateManyWithWhereWithoutSuggestedRuleInput[];
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
  };

  export type CategoryCreateNestedOneWithoutRuleSuggestionsInput = {
    create?: XOR<
      CategoryCreateWithoutRuleSuggestionsInput,
      CategoryUncheckedCreateWithoutRuleSuggestionsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutRuleSuggestionsInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type EnumSuggestionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SuggestionStatus;
  };

  export type CategoryUpdateOneWithoutRuleSuggestionsNestedInput = {
    create?: XOR<
      CategoryCreateWithoutRuleSuggestionsInput,
      CategoryUncheckedCreateWithoutRuleSuggestionsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutRuleSuggestionsInput;
    upsert?: CategoryUpsertWithoutRuleSuggestionsInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutRuleSuggestionsInput,
        CategoryUpdateWithoutRuleSuggestionsInput
      >,
      CategoryUncheckedUpdateWithoutRuleSuggestionsInput
    >;
  };

  export type TransactionCreateNestedOneWithoutSplitsInput = {
    create?: XOR<
      TransactionCreateWithoutSplitsInput,
      TransactionUncheckedCreateWithoutSplitsInput
    >;
    connectOrCreate?: TransactionCreateOrConnectWithoutSplitsInput;
    connect?: TransactionWhereUniqueInput;
  };

  export type CategoryCreateNestedOneWithoutTransactionSplitsInput = {
    create?: XOR<
      CategoryCreateWithoutTransactionSplitsInput,
      CategoryUncheckedCreateWithoutTransactionSplitsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutTransactionSplitsInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type CostObjectCreateNestedOneWithoutTransactionSplitsInput = {
    create?: XOR<
      CostObjectCreateWithoutTransactionSplitsInput,
      CostObjectUncheckedCreateWithoutTransactionSplitsInput
    >;
    connectOrCreate?: CostObjectCreateOrConnectWithoutTransactionSplitsInput;
    connect?: CostObjectWhereUniqueInput;
  };

  export type TransactionUpdateOneRequiredWithoutSplitsNestedInput = {
    create?: XOR<
      TransactionCreateWithoutSplitsInput,
      TransactionUncheckedCreateWithoutSplitsInput
    >;
    connectOrCreate?: TransactionCreateOrConnectWithoutSplitsInput;
    upsert?: TransactionUpsertWithoutSplitsInput;
    connect?: TransactionWhereUniqueInput;
    update?: XOR<
      XOR<
        TransactionUpdateToOneWithWhereWithoutSplitsInput,
        TransactionUpdateWithoutSplitsInput
      >,
      TransactionUncheckedUpdateWithoutSplitsInput
    >;
  };

  export type CategoryUpdateOneWithoutTransactionSplitsNestedInput = {
    create?: XOR<
      CategoryCreateWithoutTransactionSplitsInput,
      CategoryUncheckedCreateWithoutTransactionSplitsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutTransactionSplitsInput;
    upsert?: CategoryUpsertWithoutTransactionSplitsInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutTransactionSplitsInput,
        CategoryUpdateWithoutTransactionSplitsInput
      >,
      CategoryUncheckedUpdateWithoutTransactionSplitsInput
    >;
  };

  export type CostObjectUpdateOneWithoutTransactionSplitsNestedInput = {
    create?: XOR<
      CostObjectCreateWithoutTransactionSplitsInput,
      CostObjectUncheckedCreateWithoutTransactionSplitsInput
    >;
    connectOrCreate?: CostObjectCreateOrConnectWithoutTransactionSplitsInput;
    upsert?: CostObjectUpsertWithoutTransactionSplitsInput;
    disconnect?: CostObjectWhereInput | boolean;
    delete?: CostObjectWhereInput | boolean;
    connect?: CostObjectWhereUniqueInput;
    update?: XOR<
      XOR<
        CostObjectUpdateToOneWithWhereWithoutTransactionSplitsInput,
        CostObjectUpdateWithoutTransactionSplitsInput
      >,
      CostObjectUncheckedUpdateWithoutTransactionSplitsInput
    >;
  };

  export type CategoryCreateNestedOneWithoutSavingsGoalsInput = {
    create?: XOR<
      CategoryCreateWithoutSavingsGoalsInput,
      CategoryUncheckedCreateWithoutSavingsGoalsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutSavingsGoalsInput;
    connect?: CategoryWhereUniqueInput;
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type CategoryUpdateOneWithoutSavingsGoalsNestedInput = {
    create?: XOR<
      CategoryCreateWithoutSavingsGoalsInput,
      CategoryUncheckedCreateWithoutSavingsGoalsInput
    >;
    connectOrCreate?: CategoryCreateOrConnectWithoutSavingsGoalsInput;
    upsert?: CategoryUpsertWithoutSavingsGoalsInput;
    disconnect?: CategoryWhereInput | boolean;
    delete?: CategoryWhereInput | boolean;
    connect?: CategoryWhereUniqueInput;
    update?: XOR<
      XOR<
        CategoryUpdateToOneWithWhereWithoutSavingsGoalsInput,
        CategoryUpdateWithoutSavingsGoalsInput
      >,
      CategoryUncheckedUpdateWithoutSavingsGoalsInput
    >;
  };

  export type AccountCreateNestedOneWithoutMonthlyBalancesInput = {
    create?: XOR<
      AccountCreateWithoutMonthlyBalancesInput,
      AccountUncheckedCreateWithoutMonthlyBalancesInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutMonthlyBalancesInput;
    connect?: AccountWhereUniqueInput;
  };

  export type AccountUpdateOneWithoutMonthlyBalancesNestedInput = {
    create?: XOR<
      AccountCreateWithoutMonthlyBalancesInput,
      AccountUncheckedCreateWithoutMonthlyBalancesInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutMonthlyBalancesInput;
    upsert?: AccountUpsertWithoutMonthlyBalancesInput;
    disconnect?: AccountWhereInput | boolean;
    delete?: AccountWhereInput | boolean;
    connect?: AccountWhereUniqueInput;
    update?: XOR<
      XOR<
        AccountUpdateToOneWithWhereWithoutMonthlyBalancesInput,
        AccountUpdateWithoutMonthlyBalancesInput
      >,
      AccountUncheckedUpdateWithoutMonthlyBalancesInput
    >;
  };

  export type AccountCreateNestedOneWithoutAccountBalancesInput = {
    create?: XOR<
      AccountCreateWithoutAccountBalancesInput,
      AccountUncheckedCreateWithoutAccountBalancesInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutAccountBalancesInput;
    connect?: AccountWhereUniqueInput;
  };

  export type AccountUpdateOneWithoutAccountBalancesNestedInput = {
    create?: XOR<
      AccountCreateWithoutAccountBalancesInput,
      AccountUncheckedCreateWithoutAccountBalancesInput
    >;
    connectOrCreate?: AccountCreateOrConnectWithoutAccountBalancesInput;
    upsert?: AccountUpsertWithoutAccountBalancesInput;
    disconnect?: AccountWhereInput | boolean;
    delete?: AccountWhereInput | boolean;
    connect?: AccountWhereUniqueInput;
    update?: XOR<
      XOR<
        AccountUpdateToOneWithWhereWithoutAccountBalancesInput,
        AccountUpdateWithoutAccountBalancesInput
      >,
      AccountUncheckedUpdateWithoutAccountBalancesInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[];
    notIn?: string[];
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | null;
    notIn?: string[] | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>
      | null;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalNullableFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
  };

  export type NestedEnumCategoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CategoryType | EnumCategoryTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.CategoryType[];
    notIn?: $Enums.CategoryType[];
    not?: NestedEnumCategoryTypeFilter<$PrismaModel> | $Enums.CategoryType;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[];
    notIn?: Date[] | string[];
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[];
    notIn?: string[];
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[];
    notIn?: number[];
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | null;
    notIn?: string[] | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?:
      | NestedStringNullableWithAggregatesFilter<$PrismaModel>
      | string
      | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | null;
    notIn?: number[] | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?:
        | Decimal
        | DecimalJsLike
        | number
        | string
        | DecimalFieldRefInput<$PrismaModel>
        | null;
      in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
      notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null;
      lt?:
        | Decimal
        | DecimalJsLike
        | number
        | string
        | DecimalFieldRefInput<$PrismaModel>;
      lte?:
        | Decimal
        | DecimalJsLike
        | number
        | string
        | DecimalFieldRefInput<$PrismaModel>;
      gt?:
        | Decimal
        | DecimalJsLike
        | number
        | string
        | DecimalFieldRefInput<$PrismaModel>;
      gte?:
        | Decimal
        | DecimalJsLike
        | number
        | string
        | DecimalFieldRefInput<$PrismaModel>;
      not?:
        | NestedDecimalNullableWithAggregatesFilter<$PrismaModel>
        | Decimal
        | DecimalJsLike
        | number
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _avg?: NestedDecimalNullableFilter<$PrismaModel>;
      _sum?: NestedDecimalNullableFilter<$PrismaModel>;
      _min?: NestedDecimalNullableFilter<$PrismaModel>;
      _max?: NestedDecimalNullableFilter<$PrismaModel>;
    };

  export type NestedEnumCategoryTypeWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?:
        | $Enums.CategoryType
        | EnumCategoryTypeFieldRefInput<$PrismaModel>;
      in?: $Enums.CategoryType[];
      notIn?: $Enums.CategoryType[];
      not?:
        | NestedEnumCategoryTypeWithAggregatesFilter<$PrismaModel>
        | $Enums.CategoryType;
      _count?: NestedIntFilter<$PrismaModel>;
      _min?: NestedEnumCategoryTypeFilter<$PrismaModel>;
      _max?: NestedEnumCategoryTypeFilter<$PrismaModel>;
    };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[];
    notIn?: Date[] | string[];
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[];
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[];
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
  };

  export type NestedEnumAccountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountType | EnumAccountTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.AccountType[];
    notIn?: $Enums.AccountType[];
    not?: NestedEnumAccountTypeFilter<$PrismaModel> | $Enums.AccountType;
  };

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    in?: Decimal[] | DecimalJsLike[] | number[] | string[];
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[];
    lt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    lte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gt?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    gte?:
      | Decimal
      | DecimalJsLike
      | number
      | string
      | DecimalFieldRefInput<$PrismaModel>;
    not?:
      | NestedDecimalWithAggregatesFilter<$PrismaModel>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedDecimalFilter<$PrismaModel>;
    _sum?: NestedDecimalFilter<$PrismaModel>;
    _min?: NestedDecimalFilter<$PrismaModel>;
    _max?: NestedDecimalFilter<$PrismaModel>;
  };

  export type NestedEnumAccountTypeWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: $Enums.AccountType | EnumAccountTypeFieldRefInput<$PrismaModel>;
      in?: $Enums.AccountType[];
      notIn?: $Enums.AccountType[];
      not?:
        | NestedEnumAccountTypeWithAggregatesFilter<$PrismaModel>
        | $Enums.AccountType;
      _count?: NestedIntFilter<$PrismaModel>;
      _min?: NestedEnumAccountTypeFilter<$PrismaModel>;
      _max?: NestedEnumAccountTypeFilter<$PrismaModel>;
    };

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };

  export type NestedEnumRuleModeFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleMode | EnumRuleModeFieldRefInput<$PrismaModel>;
    in?: $Enums.RuleMode[];
    notIn?: $Enums.RuleMode[];
    not?: NestedEnumRuleModeFilter<$PrismaModel> | $Enums.RuleMode;
  };

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | null;
    notIn?: Date[] | string[] | null;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
  };

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[];
    notIn?: number[];
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedIntFilter<$PrismaModel>;
    _min?: NestedIntFilter<$PrismaModel>;
    _max?: NestedIntFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[];
    notIn?: number[];
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedEnumRuleModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RuleMode | EnumRuleModeFieldRefInput<$PrismaModel>;
    in?: $Enums.RuleMode[];
    notIn?: $Enums.RuleMode[];
    not?:
      | NestedEnumRuleModeWithAggregatesFilter<$PrismaModel>
      | $Enums.RuleMode;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumRuleModeFilter<$PrismaModel>;
    _max?: NestedEnumRuleModeFilter<$PrismaModel>;
  };

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> =
    {
      equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null;
      in?: Date[] | string[] | null;
      notIn?: Date[] | string[] | null;
      lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
      not?:
        | NestedDateTimeNullableWithAggregatesFilter<$PrismaModel>
        | Date
        | string
        | null;
      _count?: NestedIntNullableFilter<$PrismaModel>;
      _min?: NestedDateTimeNullableFilter<$PrismaModel>;
      _max?: NestedDateTimeNullableFilter<$PrismaModel>;
    };

  export type NestedEnumSuggestionStatusFilter<$PrismaModel = never> = {
    equals?:
      | $Enums.SuggestionStatus
      | EnumSuggestionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.SuggestionStatus[];
    notIn?: $Enums.SuggestionStatus[];
    not?:
      | NestedEnumSuggestionStatusFilter<$PrismaModel>
      | $Enums.SuggestionStatus;
  };

  export type NestedEnumSuggestionStatusWithAggregatesFilter<
    $PrismaModel = never,
  > = {
    equals?:
      | $Enums.SuggestionStatus
      | EnumSuggestionStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.SuggestionStatus[];
    notIn?: $Enums.SuggestionStatus[];
    not?:
      | NestedEnumSuggestionStatusWithAggregatesFilter<$PrismaModel>
      | $Enums.SuggestionStatus;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumSuggestionStatusFilter<$PrismaModel>;
    _max?: NestedEnumSuggestionStatusFilter<$PrismaModel>;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | null;
    notIn?: number[] | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | null;
    notIn?: number[] | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type CategoryCreateWithoutChildrenInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutChildrenInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutChildrenInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutChildrenInput,
      CategoryUncheckedCreateWithoutChildrenInput
    >;
  };

  export type CategoryCreateWithoutParentInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutParentInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutParentInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutParentInput,
      CategoryUncheckedCreateWithoutParentInput
    >;
  };

  export type CategoryCreateManyParentInputEnvelope = {
    data: CategoryCreateManyParentInput | CategoryCreateManyParentInput[];
  };

  export type TransactionCreateWithoutCategoryInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    account?: AccountCreateNestedOneWithoutTransactionsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionsInput;
    suggestedRule?: CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput;
    splits?: TransactionSplitCreateNestedManyWithoutParentInput;
  };

  export type TransactionUncheckedCreateWithoutCategoryInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    splits?: TransactionSplitUncheckedCreateNestedManyWithoutParentInput;
  };

  export type TransactionCreateOrConnectWithoutCategoryInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutCategoryInput,
      TransactionUncheckedCreateWithoutCategoryInput
    >;
  };

  export type TransactionCreateManyCategoryInputEnvelope = {
    data:
      | TransactionCreateManyCategoryInput
      | TransactionCreateManyCategoryInput[];
  };

  export type TransactionSplitCreateWithoutCategoryInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent: TransactionCreateNestedOneWithoutSplitsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionSplitsInput;
  };

  export type TransactionSplitUncheckedCreateWithoutCategoryInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitCreateOrConnectWithoutCategoryInput = {
    where: TransactionSplitWhereUniqueInput;
    create: XOR<
      TransactionSplitCreateWithoutCategoryInput,
      TransactionSplitUncheckedCreateWithoutCategoryInput
    >;
  };

  export type TransactionSplitCreateManyCategoryInputEnvelope = {
    data:
      | TransactionSplitCreateManyCategoryInput
      | TransactionSplitCreateManyCategoryInput[];
  };

  export type SavingsGoalCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type SavingsGoalUncheckedCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type SavingsGoalCreateOrConnectWithoutCategoryInput = {
    where: SavingsGoalWhereUniqueInput;
    create: XOR<
      SavingsGoalCreateWithoutCategoryInput,
      SavingsGoalUncheckedCreateWithoutCategoryInput
    >;
  };

  export type SavingsGoalCreateManyCategoryInputEnvelope = {
    data:
      | SavingsGoalCreateManyCategoryInput
      | SavingsGoalCreateManyCategoryInput[];
  };

  export type CategorizationRuleCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    suggestedTransactions?: TransactionCreateNestedManyWithoutSuggestedRuleInput;
  };

  export type CategorizationRuleUncheckedCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    suggestedTransactions?: TransactionUncheckedCreateNestedManyWithoutSuggestedRuleInput;
  };

  export type CategorizationRuleCreateOrConnectWithoutCategoryInput = {
    where: CategorizationRuleWhereUniqueInput;
    create: XOR<
      CategorizationRuleCreateWithoutCategoryInput,
      CategorizationRuleUncheckedCreateWithoutCategoryInput
    >;
  };

  export type CategorizationRuleCreateManyCategoryInputEnvelope = {
    data:
      | CategorizationRuleCreateManyCategoryInput
      | CategorizationRuleCreateManyCategoryInput[];
  };

  export type RuleSuggestionCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RuleSuggestionUncheckedCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RuleSuggestionCreateOrConnectWithoutCategoryInput = {
    where: RuleSuggestionWhereUniqueInput;
    create: XOR<
      RuleSuggestionCreateWithoutCategoryInput,
      RuleSuggestionUncheckedCreateWithoutCategoryInput
    >;
  };

  export type RuleSuggestionCreateManyCategoryInputEnvelope = {
    data:
      | RuleSuggestionCreateManyCategoryInput
      | RuleSuggestionCreateManyCategoryInput[];
  };

  export type CategoryUpsertWithoutChildrenInput = {
    update: XOR<
      CategoryUpdateWithoutChildrenInput,
      CategoryUncheckedUpdateWithoutChildrenInput
    >;
    create: XOR<
      CategoryCreateWithoutChildrenInput,
      CategoryUncheckedCreateWithoutChildrenInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutChildrenInput,
      CategoryUncheckedUpdateWithoutChildrenInput
    >;
  };

  export type CategoryUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput;
    update: XOR<
      CategoryUpdateWithoutParentInput,
      CategoryUncheckedUpdateWithoutParentInput
    >;
    create: XOR<
      CategoryCreateWithoutParentInput,
      CategoryUncheckedCreateWithoutParentInput
    >;
  };

  export type CategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput;
    data: XOR<
      CategoryUpdateWithoutParentInput,
      CategoryUncheckedUpdateWithoutParentInput
    >;
  };

  export type CategoryUpdateManyWithWhereWithoutParentInput = {
    where: CategoryScalarWhereInput;
    data: XOR<
      CategoryUpdateManyMutationInput,
      CategoryUncheckedUpdateManyWithoutParentInput
    >;
  };

  export type CategoryScalarWhereInput = {
    AND?: CategoryScalarWhereInput | CategoryScalarWhereInput[];
    OR?: CategoryScalarWhereInput[];
    NOT?: CategoryScalarWhereInput | CategoryScalarWhereInput[];
    id?: StringFilter<'Category'> | string;
    name?: StringFilter<'Category'> | string;
    color?: StringNullableFilter<'Category'> | string | null;
    icon?: StringFilter<'Category'> | string;
    budget?:
      | DecimalNullableFilter<'Category'>
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFilter<'Category'> | $Enums.CategoryType;
    parentId?: StringNullableFilter<'Category'> | string | null;
    createdAt?: DateTimeFilter<'Category'> | Date | string;
    updatedAt?: DateTimeFilter<'Category'> | Date | string;
  };

  export type TransactionUpsertWithWhereUniqueWithoutCategoryInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutCategoryInput,
      TransactionUncheckedUpdateWithoutCategoryInput
    >;
    create: XOR<
      TransactionCreateWithoutCategoryInput,
      TransactionUncheckedCreateWithoutCategoryInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutCategoryInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<
      TransactionUpdateWithoutCategoryInput,
      TransactionUncheckedUpdateWithoutCategoryInput
    >;
  };

  export type TransactionUpdateManyWithWhereWithoutCategoryInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutCategoryInput
    >;
  };

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    OR?: TransactionScalarWhereInput[];
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[];
    id?: StringFilter<'Transaction'> | string;
    date?: DateTimeFilter<'Transaction'> | Date | string;
    amount?:
      | DecimalFilter<'Transaction'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFilter<'Transaction'> | string;
    categoryId?: StringNullableFilter<'Transaction'> | string | null;
    accountId?: StringNullableFilter<'Transaction'> | string | null;
    costObjectId?: StringNullableFilter<'Transaction'> | string | null;
    notes?: StringNullableFilter<'Transaction'> | string | null;
    suggestedCategoryId?: StringNullableFilter<'Transaction'> | string | null;
    merchant?: StringNullableFilter<'Transaction'> | string | null;
    suggestedByRuleId?: StringNullableFilter<'Transaction'> | string | null;
    externalId?: StringNullableFilter<'Transaction'> | string | null;
    createdAt?: DateTimeFilter<'Transaction'> | Date | string;
    updatedAt?: DateTimeFilter<'Transaction'> | Date | string;
  };

  export type TransactionSplitUpsertWithWhereUniqueWithoutCategoryInput = {
    where: TransactionSplitWhereUniqueInput;
    update: XOR<
      TransactionSplitUpdateWithoutCategoryInput,
      TransactionSplitUncheckedUpdateWithoutCategoryInput
    >;
    create: XOR<
      TransactionSplitCreateWithoutCategoryInput,
      TransactionSplitUncheckedCreateWithoutCategoryInput
    >;
  };

  export type TransactionSplitUpdateWithWhereUniqueWithoutCategoryInput = {
    where: TransactionSplitWhereUniqueInput;
    data: XOR<
      TransactionSplitUpdateWithoutCategoryInput,
      TransactionSplitUncheckedUpdateWithoutCategoryInput
    >;
  };

  export type TransactionSplitUpdateManyWithWhereWithoutCategoryInput = {
    where: TransactionSplitScalarWhereInput;
    data: XOR<
      TransactionSplitUpdateManyMutationInput,
      TransactionSplitUncheckedUpdateManyWithoutCategoryInput
    >;
  };

  export type TransactionSplitScalarWhereInput = {
    AND?: TransactionSplitScalarWhereInput | TransactionSplitScalarWhereInput[];
    OR?: TransactionSplitScalarWhereInput[];
    NOT?: TransactionSplitScalarWhereInput | TransactionSplitScalarWhereInput[];
    id?: StringFilter<'TransactionSplit'> | string;
    parentId?: StringFilter<'TransactionSplit'> | string;
    amount?:
      | DecimalFilter<'TransactionSplit'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: StringNullableFilter<'TransactionSplit'> | string | null;
    costObjectId?: StringNullableFilter<'TransactionSplit'> | string | null;
    description?: StringNullableFilter<'TransactionSplit'> | string | null;
    createdAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
    updatedAt?: DateTimeFilter<'TransactionSplit'> | Date | string;
  };

  export type SavingsGoalUpsertWithWhereUniqueWithoutCategoryInput = {
    where: SavingsGoalWhereUniqueInput;
    update: XOR<
      SavingsGoalUpdateWithoutCategoryInput,
      SavingsGoalUncheckedUpdateWithoutCategoryInput
    >;
    create: XOR<
      SavingsGoalCreateWithoutCategoryInput,
      SavingsGoalUncheckedCreateWithoutCategoryInput
    >;
  };

  export type SavingsGoalUpdateWithWhereUniqueWithoutCategoryInput = {
    where: SavingsGoalWhereUniqueInput;
    data: XOR<
      SavingsGoalUpdateWithoutCategoryInput,
      SavingsGoalUncheckedUpdateWithoutCategoryInput
    >;
  };

  export type SavingsGoalUpdateManyWithWhereWithoutCategoryInput = {
    where: SavingsGoalScalarWhereInput;
    data: XOR<
      SavingsGoalUpdateManyMutationInput,
      SavingsGoalUncheckedUpdateManyWithoutCategoryInput
    >;
  };

  export type SavingsGoalScalarWhereInput = {
    AND?: SavingsGoalScalarWhereInput | SavingsGoalScalarWhereInput[];
    OR?: SavingsGoalScalarWhereInput[];
    NOT?: SavingsGoalScalarWhereInput | SavingsGoalScalarWhereInput[];
    id?: StringFilter<'SavingsGoal'> | string;
    name?: StringFilter<'SavingsGoal'> | string;
    targetAmount?:
      | DecimalFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFilter<'SavingsGoal'> | Date | string;
    targetDate?: DateTimeNullableFilter<'SavingsGoal'> | Date | string | null;
    savedAmount?:
      | DecimalFilter<'SavingsGoal'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFilter<'SavingsGoal'> | boolean;
    targetMonths?: IntNullableFilter<'SavingsGoal'> | number | null;
    categoryId?: StringNullableFilter<'SavingsGoal'> | string | null;
    createdAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
    updatedAt?: DateTimeFilter<'SavingsGoal'> | Date | string;
  };

  export type CategorizationRuleUpsertWithWhereUniqueWithoutCategoryInput = {
    where: CategorizationRuleWhereUniqueInput;
    update: XOR<
      CategorizationRuleUpdateWithoutCategoryInput,
      CategorizationRuleUncheckedUpdateWithoutCategoryInput
    >;
    create: XOR<
      CategorizationRuleCreateWithoutCategoryInput,
      CategorizationRuleUncheckedCreateWithoutCategoryInput
    >;
  };

  export type CategorizationRuleUpdateWithWhereUniqueWithoutCategoryInput = {
    where: CategorizationRuleWhereUniqueInput;
    data: XOR<
      CategorizationRuleUpdateWithoutCategoryInput,
      CategorizationRuleUncheckedUpdateWithoutCategoryInput
    >;
  };

  export type CategorizationRuleUpdateManyWithWhereWithoutCategoryInput = {
    where: CategorizationRuleScalarWhereInput;
    data: XOR<
      CategorizationRuleUpdateManyMutationInput,
      CategorizationRuleUncheckedUpdateManyWithoutCategoryInput
    >;
  };

  export type CategorizationRuleScalarWhereInput = {
    AND?:
      | CategorizationRuleScalarWhereInput
      | CategorizationRuleScalarWhereInput[];
    OR?: CategorizationRuleScalarWhereInput[];
    NOT?:
      | CategorizationRuleScalarWhereInput
      | CategorizationRuleScalarWhereInput[];
    id?: StringFilter<'CategorizationRule'> | string;
    name?: StringFilter<'CategorizationRule'> | string;
    description?: StringNullableFilter<'CategorizationRule'> | string | null;
    enabled?: BoolFilter<'CategorizationRule'> | boolean;
    priority?: IntFilter<'CategorizationRule'> | number;
    categoryId?: StringNullableFilter<'CategorizationRule'> | string | null;
    mode?: EnumRuleModeFilter<'CategorizationRule'> | $Enums.RuleMode;
    conditionsJson?: StringFilter<'CategorizationRule'> | string;
    matchCount?: IntFilter<'CategorizationRule'> | number;
    lastMatched?:
      | DateTimeNullableFilter<'CategorizationRule'>
      | Date
      | string
      | null;
    createdAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
    updatedAt?: DateTimeFilter<'CategorizationRule'> | Date | string;
  };

  export type RuleSuggestionUpsertWithWhereUniqueWithoutCategoryInput = {
    where: RuleSuggestionWhereUniqueInput;
    update: XOR<
      RuleSuggestionUpdateWithoutCategoryInput,
      RuleSuggestionUncheckedUpdateWithoutCategoryInput
    >;
    create: XOR<
      RuleSuggestionCreateWithoutCategoryInput,
      RuleSuggestionUncheckedCreateWithoutCategoryInput
    >;
  };

  export type RuleSuggestionUpdateWithWhereUniqueWithoutCategoryInput = {
    where: RuleSuggestionWhereUniqueInput;
    data: XOR<
      RuleSuggestionUpdateWithoutCategoryInput,
      RuleSuggestionUncheckedUpdateWithoutCategoryInput
    >;
  };

  export type RuleSuggestionUpdateManyWithWhereWithoutCategoryInput = {
    where: RuleSuggestionScalarWhereInput;
    data: XOR<
      RuleSuggestionUpdateManyMutationInput,
      RuleSuggestionUncheckedUpdateManyWithoutCategoryInput
    >;
  };

  export type RuleSuggestionScalarWhereInput = {
    AND?: RuleSuggestionScalarWhereInput | RuleSuggestionScalarWhereInput[];
    OR?: RuleSuggestionScalarWhereInput[];
    NOT?: RuleSuggestionScalarWhereInput | RuleSuggestionScalarWhereInput[];
    id?: StringFilter<'RuleSuggestion'> | string;
    name?: StringFilter<'RuleSuggestion'> | string;
    description?: StringNullableFilter<'RuleSuggestion'> | string | null;
    conditionsJson?: StringFilter<'RuleSuggestion'> | string;
    categoryId?: StringNullableFilter<'RuleSuggestion'> | string | null;
    confidence?:
      | DecimalFilter<'RuleSuggestion'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFilter<'RuleSuggestion'> | number;
    similarityType?: StringFilter<'RuleSuggestion'> | string;
    sampleTxIds?: StringFilter<'RuleSuggestion'> | string;
    status?:
      | EnumSuggestionStatusFilter<'RuleSuggestion'>
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
    updatedAt?: DateTimeFilter<'RuleSuggestion'> | Date | string;
  };

  export type TransactionCreateWithoutAccountInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionsInput;
    suggestedRule?: CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput;
    splits?: TransactionSplitCreateNestedManyWithoutParentInput;
  };

  export type TransactionUncheckedCreateWithoutAccountInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    splits?: TransactionSplitUncheckedCreateNestedManyWithoutParentInput;
  };

  export type TransactionCreateOrConnectWithoutAccountInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutAccountInput,
      TransactionUncheckedCreateWithoutAccountInput
    >;
  };

  export type TransactionCreateManyAccountInputEnvelope = {
    data:
      | TransactionCreateManyAccountInput
      | TransactionCreateManyAccountInput[];
  };

  export type MonthlyBalanceCreateWithoutAccountInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MonthlyBalanceUncheckedCreateWithoutAccountInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MonthlyBalanceCreateOrConnectWithoutAccountInput = {
    where: MonthlyBalanceWhereUniqueInput;
    create: XOR<
      MonthlyBalanceCreateWithoutAccountInput,
      MonthlyBalanceUncheckedCreateWithoutAccountInput
    >;
  };

  export type MonthlyBalanceCreateManyAccountInputEnvelope = {
    data:
      | MonthlyBalanceCreateManyAccountInput
      | MonthlyBalanceCreateManyAccountInput[];
  };

  export type AccountBalanceCreateWithoutAccountInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountBalanceUncheckedCreateWithoutAccountInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountBalanceCreateOrConnectWithoutAccountInput = {
    where: AccountBalanceWhereUniqueInput;
    create: XOR<
      AccountBalanceCreateWithoutAccountInput,
      AccountBalanceUncheckedCreateWithoutAccountInput
    >;
  };

  export type AccountBalanceCreateManyAccountInputEnvelope = {
    data:
      | AccountBalanceCreateManyAccountInput
      | AccountBalanceCreateManyAccountInput[];
  };

  export type TransactionUpsertWithWhereUniqueWithoutAccountInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutAccountInput,
      TransactionUncheckedUpdateWithoutAccountInput
    >;
    create: XOR<
      TransactionCreateWithoutAccountInput,
      TransactionUncheckedCreateWithoutAccountInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutAccountInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<
      TransactionUpdateWithoutAccountInput,
      TransactionUncheckedUpdateWithoutAccountInput
    >;
  };

  export type TransactionUpdateManyWithWhereWithoutAccountInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutAccountInput
    >;
  };

  export type MonthlyBalanceUpsertWithWhereUniqueWithoutAccountInput = {
    where: MonthlyBalanceWhereUniqueInput;
    update: XOR<
      MonthlyBalanceUpdateWithoutAccountInput,
      MonthlyBalanceUncheckedUpdateWithoutAccountInput
    >;
    create: XOR<
      MonthlyBalanceCreateWithoutAccountInput,
      MonthlyBalanceUncheckedCreateWithoutAccountInput
    >;
  };

  export type MonthlyBalanceUpdateWithWhereUniqueWithoutAccountInput = {
    where: MonthlyBalanceWhereUniqueInput;
    data: XOR<
      MonthlyBalanceUpdateWithoutAccountInput,
      MonthlyBalanceUncheckedUpdateWithoutAccountInput
    >;
  };

  export type MonthlyBalanceUpdateManyWithWhereWithoutAccountInput = {
    where: MonthlyBalanceScalarWhereInput;
    data: XOR<
      MonthlyBalanceUpdateManyMutationInput,
      MonthlyBalanceUncheckedUpdateManyWithoutAccountInput
    >;
  };

  export type MonthlyBalanceScalarWhereInput = {
    AND?: MonthlyBalanceScalarWhereInput | MonthlyBalanceScalarWhereInput[];
    OR?: MonthlyBalanceScalarWhereInput[];
    NOT?: MonthlyBalanceScalarWhereInput | MonthlyBalanceScalarWhereInput[];
    id?: StringFilter<'MonthlyBalance'> | string;
    month?: StringFilter<'MonthlyBalance'> | string;
    balance?:
      | DecimalFilter<'MonthlyBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: StringNullableFilter<'MonthlyBalance'> | string | null;
    createdAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
    updatedAt?: DateTimeFilter<'MonthlyBalance'> | Date | string;
  };

  export type AccountBalanceUpsertWithWhereUniqueWithoutAccountInput = {
    where: AccountBalanceWhereUniqueInput;
    update: XOR<
      AccountBalanceUpdateWithoutAccountInput,
      AccountBalanceUncheckedUpdateWithoutAccountInput
    >;
    create: XOR<
      AccountBalanceCreateWithoutAccountInput,
      AccountBalanceUncheckedCreateWithoutAccountInput
    >;
  };

  export type AccountBalanceUpdateWithWhereUniqueWithoutAccountInput = {
    where: AccountBalanceWhereUniqueInput;
    data: XOR<
      AccountBalanceUpdateWithoutAccountInput,
      AccountBalanceUncheckedUpdateWithoutAccountInput
    >;
  };

  export type AccountBalanceUpdateManyWithWhereWithoutAccountInput = {
    where: AccountBalanceScalarWhereInput;
    data: XOR<
      AccountBalanceUpdateManyMutationInput,
      AccountBalanceUncheckedUpdateManyWithoutAccountInput
    >;
  };

  export type AccountBalanceScalarWhereInput = {
    AND?: AccountBalanceScalarWhereInput | AccountBalanceScalarWhereInput[];
    OR?: AccountBalanceScalarWhereInput[];
    NOT?: AccountBalanceScalarWhereInput | AccountBalanceScalarWhereInput[];
    id?: StringFilter<'AccountBalance'> | string;
    asOfDate?: DateTimeFilter<'AccountBalance'> | Date | string;
    balance?:
      | DecimalFilter<'AccountBalance'>
      | Decimal
      | DecimalJsLike
      | number
      | string;
    accountId?: StringNullableFilter<'AccountBalance'> | string | null;
    notes?: StringNullableFilter<'AccountBalance'> | string | null;
    createdAt?: DateTimeFilter<'AccountBalance'> | Date | string;
    updatedAt?: DateTimeFilter<'AccountBalance'> | Date | string;
  };

  export type TransactionCreateWithoutCostObjectInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionsInput;
    account?: AccountCreateNestedOneWithoutTransactionsInput;
    suggestedRule?: CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput;
    splits?: TransactionSplitCreateNestedManyWithoutParentInput;
  };

  export type TransactionUncheckedCreateWithoutCostObjectInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    splits?: TransactionSplitUncheckedCreateNestedManyWithoutParentInput;
  };

  export type TransactionCreateOrConnectWithoutCostObjectInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutCostObjectInput,
      TransactionUncheckedCreateWithoutCostObjectInput
    >;
  };

  export type TransactionCreateManyCostObjectInputEnvelope = {
    data:
      | TransactionCreateManyCostObjectInput
      | TransactionCreateManyCostObjectInput[];
  };

  export type TransactionSplitCreateWithoutCostObjectInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent: TransactionCreateNestedOneWithoutSplitsInput;
    category?: CategoryCreateNestedOneWithoutTransactionSplitsInput;
  };

  export type TransactionSplitUncheckedCreateWithoutCostObjectInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitCreateOrConnectWithoutCostObjectInput = {
    where: TransactionSplitWhereUniqueInput;
    create: XOR<
      TransactionSplitCreateWithoutCostObjectInput,
      TransactionSplitUncheckedCreateWithoutCostObjectInput
    >;
  };

  export type TransactionSplitCreateManyCostObjectInputEnvelope = {
    data:
      | TransactionSplitCreateManyCostObjectInput
      | TransactionSplitCreateManyCostObjectInput[];
  };

  export type TransactionUpsertWithWhereUniqueWithoutCostObjectInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutCostObjectInput,
      TransactionUncheckedUpdateWithoutCostObjectInput
    >;
    create: XOR<
      TransactionCreateWithoutCostObjectInput,
      TransactionUncheckedCreateWithoutCostObjectInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutCostObjectInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<
      TransactionUpdateWithoutCostObjectInput,
      TransactionUncheckedUpdateWithoutCostObjectInput
    >;
  };

  export type TransactionUpdateManyWithWhereWithoutCostObjectInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutCostObjectInput
    >;
  };

  export type TransactionSplitUpsertWithWhereUniqueWithoutCostObjectInput = {
    where: TransactionSplitWhereUniqueInput;
    update: XOR<
      TransactionSplitUpdateWithoutCostObjectInput,
      TransactionSplitUncheckedUpdateWithoutCostObjectInput
    >;
    create: XOR<
      TransactionSplitCreateWithoutCostObjectInput,
      TransactionSplitUncheckedCreateWithoutCostObjectInput
    >;
  };

  export type TransactionSplitUpdateWithWhereUniqueWithoutCostObjectInput = {
    where: TransactionSplitWhereUniqueInput;
    data: XOR<
      TransactionSplitUpdateWithoutCostObjectInput,
      TransactionSplitUncheckedUpdateWithoutCostObjectInput
    >;
  };

  export type TransactionSplitUpdateManyWithWhereWithoutCostObjectInput = {
    where: TransactionSplitScalarWhereInput;
    data: XOR<
      TransactionSplitUpdateManyMutationInput,
      TransactionSplitUncheckedUpdateManyWithoutCostObjectInput
    >;
  };

  export type CategoryCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutTransactionsInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutTransactionsInput,
      CategoryUncheckedCreateWithoutTransactionsInput
    >;
  };

  export type AccountCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    monthlyBalances?: MonthlyBalanceCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceCreateNestedManyWithoutAccountInput;
  };

  export type AccountUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    monthlyBalances?: MonthlyBalanceUncheckedCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceUncheckedCreateNestedManyWithoutAccountInput;
  };

  export type AccountCreateOrConnectWithoutTransactionsInput = {
    where: AccountWhereUniqueInput;
    create: XOR<
      AccountCreateWithoutTransactionsInput,
      AccountUncheckedCreateWithoutTransactionsInput
    >;
  };

  export type CostObjectCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectCreateOrConnectWithoutTransactionsInput = {
    where: CostObjectWhereUniqueInput;
    create: XOR<
      CostObjectCreateWithoutTransactionsInput,
      CostObjectUncheckedCreateWithoutTransactionsInput
    >;
  };

  export type CategorizationRuleCreateWithoutSuggestedTransactionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutCategorizationRulesInput;
  };

  export type CategorizationRuleUncheckedCreateWithoutSuggestedTransactionsInput =
    {
      id?: string;
      name: string;
      description?: string | null;
      enabled?: boolean;
      priority?: number;
      categoryId?: string | null;
      mode?: $Enums.RuleMode;
      conditionsJson: string;
      matchCount?: number;
      lastMatched?: Date | string | null;
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };

  export type CategorizationRuleCreateOrConnectWithoutSuggestedTransactionsInput =
    {
      where: CategorizationRuleWhereUniqueInput;
      create: XOR<
        CategorizationRuleCreateWithoutSuggestedTransactionsInput,
        CategorizationRuleUncheckedCreateWithoutSuggestedTransactionsInput
      >;
    };

  export type TransactionSplitCreateWithoutParentInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionSplitsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionSplitsInput;
  };

  export type TransactionSplitUncheckedCreateWithoutParentInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitCreateOrConnectWithoutParentInput = {
    where: TransactionSplitWhereUniqueInput;
    create: XOR<
      TransactionSplitCreateWithoutParentInput,
      TransactionSplitUncheckedCreateWithoutParentInput
    >;
  };

  export type TransactionSplitCreateManyParentInputEnvelope = {
    data:
      | TransactionSplitCreateManyParentInput
      | TransactionSplitCreateManyParentInput[];
  };

  export type CategoryUpsertWithoutTransactionsInput = {
    update: XOR<
      CategoryUpdateWithoutTransactionsInput,
      CategoryUncheckedUpdateWithoutTransactionsInput
    >;
    create: XOR<
      CategoryCreateWithoutTransactionsInput,
      CategoryUncheckedCreateWithoutTransactionsInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutTransactionsInput,
      CategoryUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type CategoryUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type AccountUpsertWithoutTransactionsInput = {
    update: XOR<
      AccountUpdateWithoutTransactionsInput,
      AccountUncheckedUpdateWithoutTransactionsInput
    >;
    create: XOR<
      AccountCreateWithoutTransactionsInput,
      AccountUncheckedCreateWithoutTransactionsInput
    >;
    where?: AccountWhereInput;
  };

  export type AccountUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: AccountWhereInput;
    data: XOR<
      AccountUpdateWithoutTransactionsInput,
      AccountUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type AccountUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    monthlyBalances?: MonthlyBalanceUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUpdateManyWithoutAccountNestedInput;
  };

  export type AccountUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    monthlyBalances?: MonthlyBalanceUncheckedUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUncheckedUpdateManyWithoutAccountNestedInput;
  };

  export type CostObjectUpsertWithoutTransactionsInput = {
    update: XOR<
      CostObjectUpdateWithoutTransactionsInput,
      CostObjectUncheckedUpdateWithoutTransactionsInput
    >;
    create: XOR<
      CostObjectCreateWithoutTransactionsInput,
      CostObjectUncheckedCreateWithoutTransactionsInput
    >;
    where?: CostObjectWhereInput;
  };

  export type CostObjectUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: CostObjectWhereInput;
    data: XOR<
      CostObjectUpdateWithoutTransactionsInput,
      CostObjectUncheckedUpdateWithoutTransactionsInput
    >;
  };

  export type CostObjectUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactionSplits?: TransactionSplitUpdateManyWithoutCostObjectNestedInput;
  };

  export type CostObjectUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCostObjectNestedInput;
  };

  export type CategorizationRuleUpsertWithoutSuggestedTransactionsInput = {
    update: XOR<
      CategorizationRuleUpdateWithoutSuggestedTransactionsInput,
      CategorizationRuleUncheckedUpdateWithoutSuggestedTransactionsInput
    >;
    create: XOR<
      CategorizationRuleCreateWithoutSuggestedTransactionsInput,
      CategorizationRuleUncheckedCreateWithoutSuggestedTransactionsInput
    >;
    where?: CategorizationRuleWhereInput;
  };

  export type CategorizationRuleUpdateToOneWithWhereWithoutSuggestedTransactionsInput =
    {
      where?: CategorizationRuleWhereInput;
      data: XOR<
        CategorizationRuleUpdateWithoutSuggestedTransactionsInput,
        CategorizationRuleUncheckedUpdateWithoutSuggestedTransactionsInput
      >;
    };

  export type CategorizationRuleUpdateWithoutSuggestedTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutCategorizationRulesNestedInput;
  };

  export type CategorizationRuleUncheckedUpdateWithoutSuggestedTransactionsInput =
    {
      id?: StringFieldUpdateOperationsInput | string;
      name?: StringFieldUpdateOperationsInput | string;
      description?: NullableStringFieldUpdateOperationsInput | string | null;
      enabled?: BoolFieldUpdateOperationsInput | boolean;
      priority?: IntFieldUpdateOperationsInput | number;
      categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
      mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
      conditionsJson?: StringFieldUpdateOperationsInput | string;
      matchCount?: IntFieldUpdateOperationsInput | number;
      lastMatched?:
        | NullableDateTimeFieldUpdateOperationsInput
        | Date
        | string
        | null;
      createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
      updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    };

  export type TransactionSplitUpsertWithWhereUniqueWithoutParentInput = {
    where: TransactionSplitWhereUniqueInput;
    update: XOR<
      TransactionSplitUpdateWithoutParentInput,
      TransactionSplitUncheckedUpdateWithoutParentInput
    >;
    create: XOR<
      TransactionSplitCreateWithoutParentInput,
      TransactionSplitUncheckedCreateWithoutParentInput
    >;
  };

  export type TransactionSplitUpdateWithWhereUniqueWithoutParentInput = {
    where: TransactionSplitWhereUniqueInput;
    data: XOR<
      TransactionSplitUpdateWithoutParentInput,
      TransactionSplitUncheckedUpdateWithoutParentInput
    >;
  };

  export type TransactionSplitUpdateManyWithWhereWithoutParentInput = {
    where: TransactionSplitScalarWhereInput;
    data: XOR<
      TransactionSplitUpdateManyMutationInput,
      TransactionSplitUncheckedUpdateManyWithoutParentInput
    >;
  };

  export type CategoryCreateWithoutCategorizationRulesInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutCategorizationRulesInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutCategorizationRulesInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutCategorizationRulesInput,
      CategoryUncheckedCreateWithoutCategorizationRulesInput
    >;
  };

  export type TransactionCreateWithoutSuggestedRuleInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionsInput;
    account?: AccountCreateNestedOneWithoutTransactionsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionsInput;
    splits?: TransactionSplitCreateNestedManyWithoutParentInput;
  };

  export type TransactionUncheckedCreateWithoutSuggestedRuleInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    splits?: TransactionSplitUncheckedCreateNestedManyWithoutParentInput;
  };

  export type TransactionCreateOrConnectWithoutSuggestedRuleInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutSuggestedRuleInput,
      TransactionUncheckedCreateWithoutSuggestedRuleInput
    >;
  };

  export type TransactionCreateManySuggestedRuleInputEnvelope = {
    data:
      | TransactionCreateManySuggestedRuleInput
      | TransactionCreateManySuggestedRuleInput[];
  };

  export type CategoryUpsertWithoutCategorizationRulesInput = {
    update: XOR<
      CategoryUpdateWithoutCategorizationRulesInput,
      CategoryUncheckedUpdateWithoutCategorizationRulesInput
    >;
    create: XOR<
      CategoryCreateWithoutCategorizationRulesInput,
      CategoryUncheckedCreateWithoutCategorizationRulesInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutCategorizationRulesInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutCategorizationRulesInput,
      CategoryUncheckedUpdateWithoutCategorizationRulesInput
    >;
  };

  export type CategoryUpdateWithoutCategorizationRulesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutCategorizationRulesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type TransactionUpsertWithWhereUniqueWithoutSuggestedRuleInput = {
    where: TransactionWhereUniqueInput;
    update: XOR<
      TransactionUpdateWithoutSuggestedRuleInput,
      TransactionUncheckedUpdateWithoutSuggestedRuleInput
    >;
    create: XOR<
      TransactionCreateWithoutSuggestedRuleInput,
      TransactionUncheckedCreateWithoutSuggestedRuleInput
    >;
  };

  export type TransactionUpdateWithWhereUniqueWithoutSuggestedRuleInput = {
    where: TransactionWhereUniqueInput;
    data: XOR<
      TransactionUpdateWithoutSuggestedRuleInput,
      TransactionUncheckedUpdateWithoutSuggestedRuleInput
    >;
  };

  export type TransactionUpdateManyWithWhereWithoutSuggestedRuleInput = {
    where: TransactionScalarWhereInput;
    data: XOR<
      TransactionUpdateManyMutationInput,
      TransactionUncheckedUpdateManyWithoutSuggestedRuleInput
    >;
  };

  export type CategoryCreateWithoutRuleSuggestionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutRuleSuggestionsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutRuleSuggestionsInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutRuleSuggestionsInput,
      CategoryUncheckedCreateWithoutRuleSuggestionsInput
    >;
  };

  export type CategoryUpsertWithoutRuleSuggestionsInput = {
    update: XOR<
      CategoryUpdateWithoutRuleSuggestionsInput,
      CategoryUncheckedUpdateWithoutRuleSuggestionsInput
    >;
    create: XOR<
      CategoryCreateWithoutRuleSuggestionsInput,
      CategoryUncheckedCreateWithoutRuleSuggestionsInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutRuleSuggestionsInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutRuleSuggestionsInput,
      CategoryUncheckedUpdateWithoutRuleSuggestionsInput
    >;
  };

  export type CategoryUpdateWithoutRuleSuggestionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutRuleSuggestionsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type TransactionCreateWithoutSplitsInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category?: CategoryCreateNestedOneWithoutTransactionsInput;
    account?: AccountCreateNestedOneWithoutTransactionsInput;
    costObject?: CostObjectCreateNestedOneWithoutTransactionsInput;
    suggestedRule?: CategorizationRuleCreateNestedOneWithoutSuggestedTransactionsInput;
  };

  export type TransactionUncheckedCreateWithoutSplitsInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateOrConnectWithoutSplitsInput = {
    where: TransactionWhereUniqueInput;
    create: XOR<
      TransactionCreateWithoutSplitsInput,
      TransactionUncheckedCreateWithoutSplitsInput
    >;
  };

  export type CategoryCreateWithoutTransactionSplitsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutTransactionSplitsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    savingsGoals?: SavingsGoalUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutTransactionSplitsInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutTransactionSplitsInput,
      CategoryUncheckedCreateWithoutTransactionSplitsInput
    >;
  };

  export type CostObjectCreateWithoutTransactionSplitsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectUncheckedCreateWithoutTransactionSplitsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCostObjectInput;
  };

  export type CostObjectCreateOrConnectWithoutTransactionSplitsInput = {
    where: CostObjectWhereUniqueInput;
    create: XOR<
      CostObjectCreateWithoutTransactionSplitsInput,
      CostObjectUncheckedCreateWithoutTransactionSplitsInput
    >;
  };

  export type TransactionUpsertWithoutSplitsInput = {
    update: XOR<
      TransactionUpdateWithoutSplitsInput,
      TransactionUncheckedUpdateWithoutSplitsInput
    >;
    create: XOR<
      TransactionCreateWithoutSplitsInput,
      TransactionUncheckedCreateWithoutSplitsInput
    >;
    where?: TransactionWhereInput;
  };

  export type TransactionUpdateToOneWithWhereWithoutSplitsInput = {
    where?: TransactionWhereInput;
    data: XOR<
      TransactionUpdateWithoutSplitsInput,
      TransactionUncheckedUpdateWithoutSplitsInput
    >;
  };

  export type TransactionUpdateWithoutSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionsNestedInput;
    account?: AccountUpdateOneWithoutTransactionsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionsNestedInput;
    suggestedRule?: CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CategoryUpsertWithoutTransactionSplitsInput = {
    update: XOR<
      CategoryUpdateWithoutTransactionSplitsInput,
      CategoryUncheckedUpdateWithoutTransactionSplitsInput
    >;
    create: XOR<
      CategoryCreateWithoutTransactionSplitsInput,
      CategoryUncheckedCreateWithoutTransactionSplitsInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutTransactionSplitsInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutTransactionSplitsInput,
      CategoryUncheckedUpdateWithoutTransactionSplitsInput
    >;
  };

  export type CategoryUpdateWithoutTransactionSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutTransactionSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type CostObjectUpsertWithoutTransactionSplitsInput = {
    update: XOR<
      CostObjectUpdateWithoutTransactionSplitsInput,
      CostObjectUncheckedUpdateWithoutTransactionSplitsInput
    >;
    create: XOR<
      CostObjectCreateWithoutTransactionSplitsInput,
      CostObjectUncheckedCreateWithoutTransactionSplitsInput
    >;
    where?: CostObjectWhereInput;
  };

  export type CostObjectUpdateToOneWithWhereWithoutTransactionSplitsInput = {
    where?: CostObjectWhereInput;
    data: XOR<
      CostObjectUpdateWithoutTransactionSplitsInput,
      CostObjectUncheckedUpdateWithoutTransactionSplitsInput
    >;
  };

  export type CostObjectUpdateWithoutTransactionSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUpdateManyWithoutCostObjectNestedInput;
  };

  export type CostObjectUncheckedUpdateWithoutTransactionSplitsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutCostObjectNestedInput;
  };

  export type CategoryCreateWithoutSavingsGoalsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: CategoryCreateNestedOneWithoutChildrenInput;
    children?: CategoryCreateNestedManyWithoutParentInput;
    transactions?: TransactionCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryUncheckedCreateWithoutSavingsGoalsInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    parentId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput;
    transactions?: TransactionUncheckedCreateNestedManyWithoutCategoryInput;
    transactionSplits?: TransactionSplitUncheckedCreateNestedManyWithoutCategoryInput;
    categorizationRules?: CategorizationRuleUncheckedCreateNestedManyWithoutCategoryInput;
    ruleSuggestions?: RuleSuggestionUncheckedCreateNestedManyWithoutCategoryInput;
  };

  export type CategoryCreateOrConnectWithoutSavingsGoalsInput = {
    where: CategoryWhereUniqueInput;
    create: XOR<
      CategoryCreateWithoutSavingsGoalsInput,
      CategoryUncheckedCreateWithoutSavingsGoalsInput
    >;
  };

  export type CategoryUpsertWithoutSavingsGoalsInput = {
    update: XOR<
      CategoryUpdateWithoutSavingsGoalsInput,
      CategoryUncheckedUpdateWithoutSavingsGoalsInput
    >;
    create: XOR<
      CategoryCreateWithoutSavingsGoalsInput,
      CategoryUncheckedCreateWithoutSavingsGoalsInput
    >;
    where?: CategoryWhereInput;
  };

  export type CategoryUpdateToOneWithWhereWithoutSavingsGoalsInput = {
    where?: CategoryWhereInput;
    data: XOR<
      CategoryUpdateWithoutSavingsGoalsInput,
      CategoryUncheckedUpdateWithoutSavingsGoalsInput
    >;
  };

  export type CategoryUpdateWithoutSavingsGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: CategoryUpdateOneWithoutChildrenNestedInput;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutSavingsGoalsInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    parentId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type AccountCreateWithoutMonthlyBalancesInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceCreateNestedManyWithoutAccountInput;
  };

  export type AccountUncheckedCreateWithoutMonthlyBalancesInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutAccountInput;
    accountBalances?: AccountBalanceUncheckedCreateNestedManyWithoutAccountInput;
  };

  export type AccountCreateOrConnectWithoutMonthlyBalancesInput = {
    where: AccountWhereUniqueInput;
    create: XOR<
      AccountCreateWithoutMonthlyBalancesInput,
      AccountUncheckedCreateWithoutMonthlyBalancesInput
    >;
  };

  export type AccountUpsertWithoutMonthlyBalancesInput = {
    update: XOR<
      AccountUpdateWithoutMonthlyBalancesInput,
      AccountUncheckedUpdateWithoutMonthlyBalancesInput
    >;
    create: XOR<
      AccountCreateWithoutMonthlyBalancesInput,
      AccountUncheckedCreateWithoutMonthlyBalancesInput
    >;
    where?: AccountWhereInput;
  };

  export type AccountUpdateToOneWithWhereWithoutMonthlyBalancesInput = {
    where?: AccountWhereInput;
    data: XOR<
      AccountUpdateWithoutMonthlyBalancesInput,
      AccountUncheckedUpdateWithoutMonthlyBalancesInput
    >;
  };

  export type AccountUpdateWithoutMonthlyBalancesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUpdateManyWithoutAccountNestedInput;
  };

  export type AccountUncheckedUpdateWithoutMonthlyBalancesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutAccountNestedInput;
    accountBalances?: AccountBalanceUncheckedUpdateManyWithoutAccountNestedInput;
  };

  export type AccountCreateWithoutAccountBalancesInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionCreateNestedManyWithoutAccountInput;
    monthlyBalances?: MonthlyBalanceCreateNestedManyWithoutAccountInput;
  };

  export type AccountUncheckedCreateWithoutAccountBalancesInput = {
    id?: string;
    name: string;
    initialBalance?: Decimal | DecimalJsLike | number | string;
    type?: $Enums.AccountType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: TransactionUncheckedCreateNestedManyWithoutAccountInput;
    monthlyBalances?: MonthlyBalanceUncheckedCreateNestedManyWithoutAccountInput;
  };

  export type AccountCreateOrConnectWithoutAccountBalancesInput = {
    where: AccountWhereUniqueInput;
    create: XOR<
      AccountCreateWithoutAccountBalancesInput,
      AccountUncheckedCreateWithoutAccountBalancesInput
    >;
  };

  export type AccountUpsertWithoutAccountBalancesInput = {
    update: XOR<
      AccountUpdateWithoutAccountBalancesInput,
      AccountUncheckedUpdateWithoutAccountBalancesInput
    >;
    create: XOR<
      AccountCreateWithoutAccountBalancesInput,
      AccountUncheckedCreateWithoutAccountBalancesInput
    >;
    where?: AccountWhereInput;
  };

  export type AccountUpdateToOneWithWhereWithoutAccountBalancesInput = {
    where?: AccountWhereInput;
    data: XOR<
      AccountUpdateWithoutAccountBalancesInput,
      AccountUncheckedUpdateWithoutAccountBalancesInput
    >;
  };

  export type AccountUpdateWithoutAccountBalancesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUpdateManyWithoutAccountNestedInput;
    monthlyBalances?: MonthlyBalanceUpdateManyWithoutAccountNestedInput;
  };

  export type AccountUncheckedUpdateWithoutAccountBalancesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    initialBalance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    type?: EnumAccountTypeFieldUpdateOperationsInput | $Enums.AccountType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: TransactionUncheckedUpdateManyWithoutAccountNestedInput;
    monthlyBalances?: MonthlyBalanceUncheckedUpdateManyWithoutAccountNestedInput;
  };

  export type CategoryCreateManyParentInput = {
    id?: string;
    name: string;
    color?: string | null;
    icon: string;
    budget?: Decimal | DecimalJsLike | number | string | null;
    type?: $Enums.CategoryType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionCreateManyCategoryInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitCreateManyCategoryInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type SavingsGoalCreateManyCategoryInput = {
    id?: string;
    name: string;
    targetAmount: Decimal | DecimalJsLike | number | string;
    startDate?: Date | string;
    targetDate?: Date | string | null;
    savedAmount?: Decimal | DecimalJsLike | number | string;
    isEvergreen?: boolean;
    targetMonths?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type CategorizationRuleCreateManyCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    enabled?: boolean;
    priority?: number;
    mode?: $Enums.RuleMode;
    conditionsJson: string;
    matchCount?: number;
    lastMatched?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type RuleSuggestionCreateManyCategoryInput = {
    id?: string;
    name: string;
    description?: string | null;
    conditionsJson: string;
    confidence: Decimal | DecimalJsLike | number | string;
    matchCount: number;
    similarityType: string;
    sampleTxIds: string;
    status?: $Enums.SuggestionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type CategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput;
    transactions?: TransactionUncheckedUpdateManyWithoutCategoryNestedInput;
    transactionSplits?: TransactionSplitUncheckedUpdateManyWithoutCategoryNestedInput;
    savingsGoals?: SavingsGoalUncheckedUpdateManyWithoutCategoryNestedInput;
    categorizationRules?: CategorizationRuleUncheckedUpdateManyWithoutCategoryNestedInput;
    ruleSuggestions?: RuleSuggestionUncheckedUpdateManyWithoutCategoryNestedInput;
  };

  export type CategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    color?: NullableStringFieldUpdateOperationsInput | string | null;
    icon?: StringFieldUpdateOperationsInput | string;
    budget?:
      | NullableDecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string
      | null;
    type?: EnumCategoryTypeFieldUpdateOperationsInput | $Enums.CategoryType;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    account?: AccountUpdateOneWithoutTransactionsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionsNestedInput;
    suggestedRule?: CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput;
    splits?: TransactionSplitUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    splits?: TransactionSplitUncheckedUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: TransactionUpdateOneRequiredWithoutSplitsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionSplitsNestedInput;
  };

  export type TransactionSplitUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type SavingsGoalUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    targetAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    targetDate?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    savedAmount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    isEvergreen?: BoolFieldUpdateOperationsInput | boolean;
    targetMonths?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CategorizationRuleUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    suggestedTransactions?: TransactionUpdateManyWithoutSuggestedRuleNestedInput;
  };

  export type CategorizationRuleUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    suggestedTransactions?: TransactionUncheckedUpdateManyWithoutSuggestedRuleNestedInput;
  };

  export type CategorizationRuleUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: BoolFieldUpdateOperationsInput | boolean;
    priority?: IntFieldUpdateOperationsInput | number;
    mode?: EnumRuleModeFieldUpdateOperationsInput | $Enums.RuleMode;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    lastMatched?:
      | NullableDateTimeFieldUpdateOperationsInput
      | Date
      | string
      | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type RuleSuggestionUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    conditionsJson?: StringFieldUpdateOperationsInput | string;
    confidence?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    matchCount?: IntFieldUpdateOperationsInput | number;
    similarityType?: StringFieldUpdateOperationsInput | string;
    sampleTxIds?: StringFieldUpdateOperationsInput | string;
    status?:
      | EnumSuggestionStatusFieldUpdateOperationsInput
      | $Enums.SuggestionStatus;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateManyAccountInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type MonthlyBalanceCreateManyAccountInput = {
    id?: string;
    month: string;
    balance?: Decimal | DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type AccountBalanceCreateManyAccountInput = {
    id?: string;
    asOfDate: Date | string;
    balance?: Decimal | DecimalJsLike | number | string;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionsNestedInput;
    suggestedRule?: CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput;
    splits?: TransactionSplitUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    splits?: TransactionSplitUncheckedUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MonthlyBalanceUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MonthlyBalanceUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type MonthlyBalanceUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    month?: StringFieldUpdateOperationsInput | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type AccountBalanceUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string;
    asOfDate?: DateTimeFieldUpdateOperationsInput | Date | string;
    balance?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateManyCostObjectInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    suggestedByRuleId?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitCreateManyCostObjectInput = {
    id?: string;
    parentId: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionsNestedInput;
    account?: AccountUpdateOneWithoutTransactionsNestedInput;
    suggestedRule?: CategorizationRuleUpdateOneWithoutSuggestedTransactionsNestedInput;
    splits?: TransactionSplitUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    splits?: TransactionSplitUncheckedUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateManyWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedByRuleId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUpdateWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: TransactionUpdateOneRequiredWithoutSplitsNestedInput;
    category?: CategoryUpdateOneWithoutTransactionSplitsNestedInput;
  };

  export type TransactionSplitUncheckedUpdateWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUncheckedUpdateManyWithoutCostObjectInput = {
    id?: StringFieldUpdateOperationsInput | string;
    parentId?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitCreateManyParentInput = {
    id?: string;
    amount: Decimal | DecimalJsLike | number | string;
    categoryId?: string | null;
    costObjectId?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionSplitUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionSplitsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionSplitsNestedInput;
  };

  export type TransactionSplitUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionSplitUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    description?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type TransactionCreateManySuggestedRuleInput = {
    id?: string;
    date: Date | string;
    amount: Decimal | DecimalJsLike | number | string;
    description: string;
    categoryId?: string | null;
    accountId?: string | null;
    costObjectId?: string | null;
    notes?: string | null;
    suggestedCategoryId?: string | null;
    merchant?: string | null;
    externalId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type TransactionUpdateWithoutSuggestedRuleInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    category?: CategoryUpdateOneWithoutTransactionsNestedInput;
    account?: AccountUpdateOneWithoutTransactionsNestedInput;
    costObject?: CostObjectUpdateOneWithoutTransactionsNestedInput;
    splits?: TransactionSplitUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateWithoutSuggestedRuleInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    splits?: TransactionSplitUncheckedUpdateManyWithoutParentNestedInput;
  };

  export type TransactionUncheckedUpdateManyWithoutSuggestedRuleInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    amount?:
      | DecimalFieldUpdateOperationsInput
      | Decimal
      | DecimalJsLike
      | number
      | string;
    description?: StringFieldUpdateOperationsInput | string;
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null;
    accountId?: NullableStringFieldUpdateOperationsInput | string | null;
    costObjectId?: NullableStringFieldUpdateOperationsInput | string | null;
    notes?: NullableStringFieldUpdateOperationsInput | string | null;
    suggestedCategoryId?:
      | NullableStringFieldUpdateOperationsInput
      | string
      | null;
    merchant?: NullableStringFieldUpdateOperationsInput | string | null;
    externalId?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
