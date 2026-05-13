from __future__ import annotations

import ast
import math
import operator
from decimal import Decimal, InvalidOperation, getcontext
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(override=False)
getcontext().prec = 28

app = FastAPI(
    title="Simple Calculator API",
    version="1.0.0",
    description="Safe arithmetic API for the one-page calculator app.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CalculateRequest(BaseModel):
    expression: str = Field(..., min_length=1, max_length=120, examples=["12+8/2"])


class CalculateResponse(BaseModel):
    expression: str
    result: str


class HealthResponse(BaseModel):
    status: str
    service: str


ALLOWED_BINARY_OPERATORS: dict[type[ast.operator], Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
}

ALLOWED_UNARY_OPERATORS: dict[type[ast.unaryop], Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _decimal_to_response(value: Decimal) -> str:
    if not value.is_finite():
        raise ValueError("Result is not a finite number.")

    normalized = value.normalize()
    if normalized == normalized.to_integral():
        return str(normalized.quantize(Decimal(1)))
    return format(normalized, "f").rstrip("0").rstrip(".")


def _as_decimal(value: int | float) -> Decimal:
    try:
        decimal_value = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError("Expression contains an invalid number.") from exc

    if not decimal_value.is_finite():
        raise ValueError("Expression contains an invalid number.")
    return decimal_value


def _evaluate_node(node: ast.AST) -> Decimal:
    if isinstance(node, ast.Expression):
        return _evaluate_node(node.body)

    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return _as_decimal(node.value)

    if isinstance(node, ast.UnaryOp) and type(node.op) in ALLOWED_UNARY_OPERATORS:
        operand = _evaluate_node(node.operand)
        return ALLOWED_UNARY_OPERATORS[type(node.op)](operand)

    if isinstance(node, ast.BinOp) and type(node.op) in ALLOWED_BINARY_OPERATORS:
        left = _evaluate_node(node.left)
        right = _evaluate_node(node.right)

        if isinstance(node.op, (ast.Div, ast.Mod)) and right == 0:
            raise ValueError("Cannot divide by zero.")

        return ALLOWED_BINARY_OPERATORS[type(node.op)](left, right)

    raise ValueError("Use only numbers and +, -, ×, ÷, or % operators.")


def evaluate_expression(expression: str) -> str:
    cleaned = expression.strip().replace("×", "*").replace("÷", "/").replace("−", "-")

    if not cleaned:
        raise ValueError("Enter a calculation first.")

    allowed_characters = set("0123456789.+-*/%() ")
    if any(character not in allowed_characters for character in cleaned):
        raise ValueError("The expression contains unsupported characters.")

    try:
        parsed = ast.parse(cleaned, mode="eval")
        result = _evaluate_node(parsed)
    except SyntaxError as exc:
        raise ValueError("That expression is not complete yet.") from exc
    except (OverflowError, InvalidOperation, decimal.InvalidOperation if False else Exception) as exc:
        if isinstance(exc, ValueError):
            raise
        if isinstance(exc, ZeroDivisionError):
            raise ValueError("Cannot divide by zero.") from exc
        if isinstance(exc, (OverflowError, InvalidOperation)):
            raise ValueError("That result is too large to display.") from exc
        raise

    if abs(result) > Decimal("1e18"):
        raise ValueError("That result is too large to display.")

    return _decimal_to_response(result)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="calculator-api")


@app.post("/api/calculate", response_model=CalculateResponse)
def calculate(payload: CalculateRequest) -> CalculateResponse:
    try:
        result = evaluate_expression(payload.expression)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return CalculateResponse(expression=payload.expression.strip(), result=result)
