let expression = "";
let justCalculated = false;
let hasError = false;

const expressionDisplay =
    document.getElementById("expressionDisplay");

const resultDisplay =
    document.getElementById("resultDisplay");

const buttons =
    document.querySelectorAll(".btn");


function updateDisplay(result = null) {

    expressionDisplay.textContent =
        expression || "";

    if (result !== null) {
        resultDisplay.textContent = result;
    } else {

        const currentNumber =
            getCurrentNumber();

        resultDisplay.textContent =
            currentNumber || "0";
    }
}

function getCurrentNumber() {

    if (!expression) {
        return "";
    }

    const numbers =
        expression.split(/[+\-*/]/);

    return numbers[numbers.length - 1];
}

function appendNumber(number) {

    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    expression += number;

    updateDisplay();
}

function appendDecimal() {

    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    const currentNumber =
        getCurrentNumber();

    if (currentNumber.includes(".")) {
        return;
    }

    if (
        expression === "" ||
        /[+\-*/]$/.test(expression)
    ) {
        expression += "0.";
    } else {
        expression += ".";
    }

    updateDisplay();
}

function chooseOperator(operator) {

    if (hasError) {
        return;
    }

    if (expression === "") {
        return;
    }

    if (/[+\-*/]$/.test(expression)) {

        expression =
            expression.slice(0, -1) + operator;

    } else {

        expression += operator;
    }

    justCalculated = false;

    updateDisplay();
}

function deleteLast() {

    if (hasError) {
        clearCalculator();
        return;
    }

    if (justCalculated) {
        justCalculated = false;
    }

    expression =
        expression.slice(0, -1);

    updateDisplay();
}

function clearCalculator() {

    expression = "";
    justCalculated = false;
    hasError = false;

    expressionDisplay.textContent = "";
    resultDisplay.textContent = "0";
}

function formatResult(result) {

    if (!Number.isFinite(result)) {
        return result;
    }

    const rounded =
        Math.round((result + Number.EPSILON) * 1e12) / 1e12;

    return rounded.toString();
}

function parseExpression(input) {

    const numbers = [];
    const operators = [];

    let currentNumber = "";

    for (let i = 0; i < input.length; i++) {

        const character = input[i];

        if (
            character >= "0" &&
            character <= "9" ||
            character === "."
        ) {

            currentNumber += character;

        } else if (
            character === "+" ||
            character === "-" ||
            character === "*" ||
            character === "/"
        ) {

            if (currentNumber === "") {
                throw new Error("Invalid expression");
            }

            numbers.push(
                parseFloat(currentNumber)
            );

            operators.push(character);

            currentNumber = "";
        }
    }

    if (currentNumber === "") {
        throw new Error("Invalid expression");
    }

    numbers.push(
        parseFloat(currentNumber)
    );

    return {
        numbers,
        operators
    };
}

function performOperation(firstNumber, secondNumber, operator) {

    switch (operator) {

        case "+":
            return firstNumber + secondNumber;

        case "-":
            return firstNumber - secondNumber;

        case "*":
            return firstNumber * secondNumber;

        case "/":

            if (secondNumber === 0) {
                throw new Error(
                    "Cannot divide by zero"
                );
            }

            return firstNumber / secondNumber;

        default:
            throw new Error(
                "Unknown operator"
            );
    }
}

function calculateExpression(input) {

    const {
        numbers,
        operators
    } = parseExpression(input);


    /*
        First process multiplication and division.
        This gives the expression normal mathematical
        operator precedence.

        Example:

        5 + 3 * 2

        becomes:

        5 + 6
    */

    const processedNumbers = [numbers[0]];
    const processedOperators = [];

    for (let i = 0; i < operators.length; i++) {

        const operator = operators[i];

        const nextNumber = numbers[i + 1];

        if (
            operator === "*" ||
            operator === "/"
        ) {

            const previousNumber =
                processedNumbers.pop();

            const result =
                performOperation(
                    previousNumber,
                    nextNumber,
                    operator
                );

            processedNumbers.push(result);

        } else {

            processedOperators.push(operator);
            processedNumbers.push(nextNumber);
        }
    }

    let result =
        processedNumbers[0];

    for (
        let i = 0;
        i < processedOperators.length;
        i++
    ) {

        result =
            performOperation(
                result,
                processedNumbers[i + 1],
                processedOperators[i]
            );
    }

    return result;
}

function calculate() {

    if (hasError) {
        return;
    }

    if (!expression) {
        return;
    }

    if (/[+\-*/]$/.test(expression)) {
        return;
    }

    try {

        const result =
            calculateExpression(expression);

        const formattedResult =
            formatResult(result);

        expressionDisplay.textContent =
            expression + " =";

        resultDisplay.textContent =
            formattedResult;

        expression =
            formattedResult;

        justCalculated = true;

    } catch (error) {

        expressionDisplay.textContent =
            "Calculation Error";

        resultDisplay.textContent =
            error.message;

        hasError = true;
    }
}

buttons.forEach((button) => {

    button.addEventListener("click", () => {

        const number =
            button.dataset.number;

        const operator =
            button.dataset.operator;

        const action =
            button.dataset.action;


        if (number !== undefined) {

            appendNumber(number);
            return;
        }


        if (operator !== undefined) {

            chooseOperator(operator);
            return;
        }


        switch (action) {

            case "decimal":
                appendDecimal();
                break;

            case "clear":
                clearCalculator();
                break;

            case "delete":
                deleteLast();
                break;

            case "calculate":
                calculate();
                break;

            default:
                break;
        }
    });
});

document.addEventListener("keydown", (event) => {

    const key = event.key;

    if (
        key >= "0" &&
        key <= "9"
    ) {

        event.preventDefault();

        appendNumber(key);

        return;
    }

    if (key === ".") {

        event.preventDefault();

        appendDecimal();

        return;
    }

    if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/"
    ) {

        event.preventDefault();

        chooseOperator(key);

        return;
    }

    if (
        key === "Enter" ||
        key === "="
    ) {

        event.preventDefault();

        calculate();

        return;
    }

    if (key === "Backspace") {

        event.preventDefault();

        deleteLast();

        return;
    }

    if (key === "Escape") {

        event.preventDefault();

        clearCalculator();
    }
});

updateDisplay();