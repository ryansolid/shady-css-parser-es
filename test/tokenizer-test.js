import { expect } from 'chai';
import * as fixtures from './fixtures';
import * as helpers from './helpers';
import { Tokenizer } from '../src/shady-css/tokenizer';
import { Token } from '../src/shady-css/token';

describe('Tokenizer', () => {
  describe('when tokenizing basic structures', () => {
    it('can identify strings', () => {
      expect(new Tokenizer('"foo"').advance()).to.be.eql(
          new Token(Token.type.string, 0, 5));
    });

    it('can identify comments', () => {
      expect(new Tokenizer('/*foo*/').advance()).to.be.eql(
          new Token(Token.type.comment, 0, 7));
    });

    it('can identify words', () => {
      expect(new Tokenizer('font-family').advance()).to.be.eql(
          new Token(Token.type.word, 0, 11));
    });

    it('can identify boundaries', () => {
      expect(new Tokenizer('@{};()').flush()).to.be.eql([
        new Token(Token.type.at, 0, 1),
        new Token(Token.type.openBrace, 1, 2),
        new Token(Token.type.closeBrace, 2, 3),
        new Token(Token.type.semicolon, 3, 4),
        new Token(Token.type.openParenthesis, 4, 5),
        new Token(Token.type.closeParenthesis, 5, 6)
      ]);
    });
  });

  describe('when tokenizing standard CSS structures', () => {
    it('can tokenize a basic selector', () => {
      helpers.expectTokenTypeOrder(new Tokenizer(fixtures.basicSelector), [
        Token.type.whitespace, // '\n'
        Token.type.word,       // 'body'
        Token.type.whitespace, // ' '
        Token.type.openBrace,  // '{'
        Token.type.whitespace, // '\n  '
        Token.type.word,       // 'margin'
        Token.type.whitespace, // ' '
        Token.type.word,       // '0'
        Token.type.semicolon,  // ';'
        Token.type.whitespace, // '\n  '
        Token.type.word,       // 'padding'
        Token.type.whitespace, // ' '
        Token.type.word,       // '0px'
        Token.type.whitespace, // '\n'
        Token.type.closeBrace, // '}'
        Token.type.whitespace  // '\n'
      ]);
    });

    it('can tokenize @rules', () => {
      helpers.expectTokenTypeOrder(new Tokenizer(fixtures.atRules), [
        Token.type.whitespace,       // '\n'
        Token.type.at,               // '@'
        Token.type.word,             // 'import'
        Token.type.whitespace,       // ' '
        Token.type.word,             // 'url'
        Token.type.openParenthesis,  // '('
        Token.type.string,           // '\'foo.css\''
        Token.type.closeParenthesis, // ')'
        Token.type.semicolon,        // ';'
        Token.type.whitespace,       // '\n\n',
        Token.type.at,               // '@',
        Token.type.word,             // 'font-face'
        Token.type.whitespace,       // ' '
        Token.type.openBrace,        // '{'
        Token.type.whitespace,       // '\n  ',
        Token.type.word,             // 'font-family'
        Token.type.whitespace,       // ' '
        Token.type.word,             // 'foo'
        Token.type.semicolon,        // ';'
        Token.type.whitespace,       // '\n'
        Token.type.closeBrace,       // '}'
        Token.type.whitespace,       // '\n\n'
        Token.type.at,               // '@'
        Token.type.word,             // 'word'
        Token.type.whitespace,       // ' '
        Token.type.string,           // '\'foo\''
        Token.type.semicolon,        // ';'
        Token.type.whitespace,       // '\n'
      ]);
    });
  });

  describe('when extracting substrings', () => {
    it('can slice the string using tokens', () => {
      let tokenizer = new Tokenizer('foo bar');
      let substring = tokenizer.slice(
          new Token(Token.type.word, 2, 3),
          new Token(Token.type.word, 5, 6));
      expect(substring).to.be.eql('o ba');
    });
  });
});