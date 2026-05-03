import { isDeepStrictEqual } from 'node:util';

const strictAt = <T extends {}>(array: readonly T[], index: number) => {
  if (index < -array.length || index >= array.length) {
    throw RangeError(
      `index is out of range\nlength: ${array.length}, index: ${index}`,
    );
  }

  const val = array.at(index);

  if (val == null) {
    throw TypeError(
      `Value is undefined\nlength: ${array.length}, index: ${index}`,
    );
  }

  return val;
};

const getCodePoints = (str: string) => {
  return [...str].map((s) => {
    const point = s.codePointAt(0);
    if (point == null) {
      throw TypeError('codepoint is undefined');
    }
    return point;
  });
};

const removeDoubling = <T extends {}>(arr: readonly T[]) => {
  const result: T[] = [];

  a: for (let r = 0; r < arr.length; ++r) {
    for (let l = 0; l < r; ++l) {
      if (isDeepStrictEqual(arr[l], arr[r])) {
        // console.log('equal value detected!:', arr[l], arr[r]);
        continue a;
      }
    }

    result.push(strictAt(arr, r));
  }

  return result;
};

const encoder = new TextEncoder();

const getId = async (content: unknown) => {
  const json = JSON.stringify(content);
  const encoded = encoder.encode(json);
  const hash = await crypto.subtle.digest('SHA-1', encoded);
  return Buffer.from(hash).toString('base64url');
};

export { getId, removeDoubling, getCodePoints, strictAt };
