/**
 * Covers the values of a tuple to its values union.
 * @example
 * ``` ts
 * type Tuple = readonly ['1', '2,' '3']
 * type Union = TupleToUnion<Tuple> // expected to be '1' | '2' | '3'
 * ```
 * @see https://gist.github.com/3fuyang/fe7fe44b6d7a2d7996577ab9c6324adc
 */
export type TupleToUnion<T> = T extends readonly [infer L, ...infer R]
  ? TupleToUnion<R> extends []
    ? L
    : L | TupleToUnion<R>
  : T
