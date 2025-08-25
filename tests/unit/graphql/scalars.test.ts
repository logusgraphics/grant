import { Kind, IntValueNode, StringValueNode } from 'graphql';
import { describe, it, expect } from 'vitest';

import { DateScalar } from '@/graphql/resolvers/scalars';

describe('Date Scalar', () => {
  describe('serialize', () => {
    it('should return Date object when given a Date', () => {
      const testDate = new Date('2023-01-01T00:00:00.000Z');
      const result = DateScalar.serialize(testDate);
      expect(result).toBe(testDate);
    });

    it('should convert string to Date when given an ISO string', () => {
      const testString = '2023-01-01T00:00:00.000Z';
      const result = DateScalar.serialize(testString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(testString);
    });

    it('should throw error for invalid types', () => {
      expect(() => DateScalar.serialize(123)).toThrow(
        'GraphQL Date Scalar serializer expected a `Date` object or ISO string'
      );
      expect(() => DateScalar.serialize(null)).toThrow(
        'GraphQL Date Scalar serializer expected a `Date` object or ISO string'
      );
      expect(() => DateScalar.serialize(undefined)).toThrow(
        'GraphQL Date Scalar serializer expected a `Date` object or ISO string'
      );
    });
  });

  describe('parseValue', () => {
    it('should convert string to Date when given an ISO string', () => {
      const testString = '2023-01-01T00:00:00.000Z';
      const result = DateScalar.parseValue(testString);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(testString);
    });

    it('should return Date object when given a Date', () => {
      const testDate = new Date('2023-01-01T00:00:00.000Z');
      const result = DateScalar.parseValue(testDate);
      expect(result).toBe(testDate);
    });

    it('should throw error for invalid types', () => {
      expect(() => DateScalar.parseValue(123)).toThrow(
        'GraphQL Date Scalar parser expected a `string` or `Date`'
      );
      expect(() => DateScalar.parseValue(null)).toThrow(
        'GraphQL Date Scalar parser expected a `string` or `Date`'
      );
      expect(() => DateScalar.parseValue(undefined)).toThrow(
        'GraphQL Date Scalar parser expected a `string` or `Date`'
      );
    });
  });

  describe('parseLiteral', () => {
    it('should convert string literal to Date', () => {
      const ast: StringValueNode = {
        kind: Kind.STRING,
        value: '2023-01-01T00:00:00.000Z',
        loc: undefined,
      };
      const result = DateScalar.parseLiteral(ast, {});
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should return null for non-string literals', () => {
      const intAst: IntValueNode = {
        kind: Kind.INT,
        value: '123',
        loc: undefined,
      };
      const result = DateScalar.parseLiteral(intAst, {});
      expect(result).toBeNull();
    });

    it('should return null for invalid literal kind', () => {
      const invalidAst = { kind: 'INVALID', value: 'test' };
      const result = DateScalar.parseLiteral(invalidAst as any, {});
      expect(result).toBeNull();
    });
  });
});
