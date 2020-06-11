import {RefOnlyNode, ScalarNode} from "./scalar";
import {ComplexNode} from "./vector";

export type Node = ScalarNode | ComplexNode

export type RefNode = ComplexNode | RefOnlyNode;