import { ParseContext } from "../parse";
import { Token } from "../tokenizer";
import { isSymbolToken, isNameToken, tokensTake } from "../tokensHelps";
import { Ast } from "./ast";

// export interface ExpressionType {
//     CallExpression: "CallExpression"
// }

// type IExpressionType<T, V extends keyof T = keyof T> = V extends V ? T[V] : never;
export enum ExpressionTypeEnum {
    CallExpression = "CallExpression",
    MemberExpression = "MemberExpression"

}

// export const isExpression = (token: Token, context: ParseContext): IExpressionType<ExpressionType> => {
export const isExpression = (token: Token, context: ParseContext): ExpressionTypeEnum => {
    const takeToken = context.getToken();
    const isBrackets = takeToken.next();
    if (token && isBrackets) {
        if(isNameToken(token) && isSymbolToken(isBrackets, ".")){
            const nextPropertyToken = takeToken.next();
            if(!isNameToken(nextPropertyToken)){
                throw new SyntaxError(`Unexpected token ${nextPropertyToken.value}`);
            }
            return ExpressionTypeEnum.MemberExpression;
        }
        if (isNameToken(token) && isSymbolToken(isBrackets, "(")) {
            return ExpressionTypeEnum.CallExpression
        }
    }
    return null;
}


export class ExpressionStatement extends Ast {
    type = "ExpressionStatement";
    expression: Ast;
}