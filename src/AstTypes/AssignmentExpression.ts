import { Ast } from "./ast";


export class AssignmentExpression extends Ast {
    type = "AssignmentExpression";
    left: Ast;
    right: Ast;
    operator = "=";
    _generator() {
        return this.left._generator() +  ` ${this.operator} ` + this.right._generator();
    }
}