interface ObjectConstructor {
  keys<T>(item: T): (keyof T)[];
}
