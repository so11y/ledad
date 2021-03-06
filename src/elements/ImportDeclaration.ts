import { parseExpression } from "../parse/parseStatementOrExpression";
import { MachineType } from "../parse/machineType";
import { ParseContext } from "../parse/parse";
import { Ast } from "../share/types";
import { Identifier } from "./Identifier";
import { initLiteral, Literal } from "./literal";

export class ImportDeclaration implements Ast {
  start: number;
  end: number;
  type = "ImportDeclaration";
  callee: Ast;
  specifiers: Array<ImportSpecifier|ImportNamespaceSpecifier|ImportNamespaceSpecifier> = [];
  source: Literal;

  static isImportDeclaration(node:Record<string,any>):node is ImportDeclaration{
    return node.type === "ImportDeclaration" && node instanceof ImportDeclaration;
  }
}

export class ImportDefaultSpecifier implements Ast {
  start: number;
  end: number;
  type = "ImportDefaultSpecifier";
  local: Identifier;
  static isImportDefaultSpecifier(node:Record<string,any>):node is ImportDefaultSpecifier{
    return node.type === "ImportDefaultSpecifier" && node instanceof ImportDefaultSpecifier;
  }
}
export class ImportNamespaceSpecifier implements Ast {
  start: number;
  end: number;
  type = "ImportNamespaceSpecifier";
  local: Identifier;

  static isImportNamespaceSpecifier(node:Record<string,any>):node is ImportNamespaceSpecifier{
    return node.type === "ImportNamespaceSpecifier" && node instanceof ImportNamespaceSpecifier;
  }
}

export class ImportSpecifier implements Ast {
  start: number;
  end: number;
  type = "ImportSpecifier";
  imported: Identifier;
  local: Identifier;

  static isImportSpecifier(node:Record<string,any>):node is ImportSpecifier{
    return node.type === "ImportSpecifier" && node instanceof ImportSpecifier;
  }
}
const initImportSpecifier = (parseContext: ParseContext) => {
  const importSpecifier = new ImportSpecifier();
  if (MachineType.IDENTIFIER !== parseContext.currentTokenType) {
    parseContext.unexpected();
  }
  importSpecifier.local = importSpecifier.imported = parseExpression(
    parseContext
  ) as Identifier;
  importSpecifier.start = importSpecifier.local.start;
  if (parseContext.currentToken.value === "as") {
    parseContext.eat(MachineType.IDENTIFIER);
    importSpecifier.local = parseExpression(parseContext) as Identifier;
  }
  importSpecifier.end = importSpecifier.local.end;
  return importSpecifier;
};
const initImportDefaultSpecifier = (parseContext: ParseContext) => {
  const importDefaultSpecifier = new ImportDefaultSpecifier();
  importDefaultSpecifier.start = parseContext.currentToken.start;
  importDefaultSpecifier.local = parseExpression(parseContext) as Identifier;
  importDefaultSpecifier.end = importDefaultSpecifier.local.end;
  return importDefaultSpecifier;
};
const initImportNamespaceSpecifier = (parseContext: ParseContext) => {
  const importNamespaceSpecifier = new ImportNamespaceSpecifier();
  importNamespaceSpecifier.start = parseContext.currentToken.start;
  importNamespaceSpecifier.local = parseExpression(parseContext) as Identifier;
  importNamespaceSpecifier.end = importNamespaceSpecifier.local.end;
  return importNamespaceSpecifier;
};

export const initImportDeclaration = (parseContext: ParseContext) => {
  const importDeclaration = new ImportDeclaration();
  parseContext.expect(MachineType.IMPORT);
  importDeclaration.start = parseContext.prevToken.start;
  if (parseContext.currentToken.type === "string") {
    importDeclaration.source = initLiteral(parseContext.currentToken.value);
    importDeclaration.source.start = parseContext.currentToken.start;
    importDeclaration.source.end = parseContext.currentToken.end;
    parseContext.shift();
  } else {
    let isHaveDefault = false;
    let isNameSpace = false;
    if (parseContext.currentToken.value === "*") {
      parseContext.eat(parseContext.currentTokenType);
      //@ts-ignore
      if (parseContext.currentToken.value !== "as") {
        parseContext.unexpected();
      } else {
        parseContext.eat(parseContext.currentTokenType);
        importDeclaration.specifiers.push(
          initImportNamespaceSpecifier(parseContext)
        );
      }
      isNameSpace = true;
    } else if (MachineType.IDENTIFIER === parseContext.currentTokenType) {
      importDeclaration.specifiers.push(
        initImportDefaultSpecifier(parseContext)
      );
      isHaveDefault = true;
    }
    if (isNameSpace && parseContext.currentToken.value !== "from") {
      parseContext.unexpected();
    }
    if (isHaveDefault && parseContext.currentToken.value === ",") {
      parseContext.eat(parseContext.currentTokenType);
      if (MachineType.LEFTCURLYBRACES !== parseContext.currentTokenType) {
        parseContext.unexpected();
      }
    }
    if (parseContext.eat(MachineType.LEFTCURLYBRACES)) {
      while (!parseContext.eat(MachineType.RIGHTCURLYBRACES)) {
        importDeclaration.specifiers.push(initImportSpecifier(parseContext));
        parseContext.eat(MachineType.COMMA);
      }
    }
    if (
      parseContext.currentToken.value === "from" &&
      parseContext.eat(MachineType.IDENTIFIER)
    ) {
      if (parseContext.currentToken.type === "string") {
        importDeclaration.source = initLiteral(parseContext.currentToken.value);
        importDeclaration.source.start = parseContext.currentToken.start;
        importDeclaration.source.end = parseContext.currentToken.end;
        parseContext.shift();
      }
    } else {
      parseContext.unexpected();
    }
    importDeclaration.end = importDeclaration.source.end;
  }
  return importDeclaration;
};
