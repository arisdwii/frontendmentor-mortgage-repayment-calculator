// ======== DOM ELEMENTS ========
// Buttons and form
const btnClear = document.querySelector(".btn-clear");
const calculatorForm = document.querySelector(".calculator-form");

// Input groups and messages
const formGroup = document.querySelectorAll(".form-group");
const inputAmount = document.getElementById("amount");
const amountMsg = document.querySelector(".amount-msg");
const inputTerm = document.getElementById("term");
const termMsg = document.querySelector(".term-msg");
const inputRate = document.getElementById("rate");
const rateMsg = document.querySelector(".rate-msg");
const inputRadio = document.querySelectorAll("input[name='mortgage']");
const typeMsg = document.querySelector(".type-msg");

// Output elements
const resultEmpty = document.querySelector(".results-empty");
const resultOutput = document.querySelector(".results-output");
const resultAmount = document.querySelector(".results-amount");
const resultTotal = document.querySelector(".results-total");

// ======== UTILITY FUNCTIONS ========

// Display error message and highlight the form group
function showErrorMsg(element, msg) {
  element.textContent = msg;
  element.closest(".form-group").classList.add("error");
}

// Clear error message and remove highlight
function clearErrorMsg(element) {
  element.textContent = "";
  element.closest(".form-group").classList.remove("error");
}

// Check if input is empty and show error
function isEmpty(input, msgElement, message) {
  if (!input.value.trim()) {
    showErrorMsg(msgElement, message);
    return true;
  }

  return false;
}

// Calculate monthly repayment for standard repayment mortgage
function calculateRepayment(principal, annualInterestRate, loanTermYears) {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const numerator =
    monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
  const monthlyPayment = principal * (numerator / denominator);

  return monthlyPayment;
}

// Calculate monthly payment for interest-only mortgage
function calculateInterestOnly(principal, annualInterestRate) {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const monthlyPayment = principal * monthlyInterestRate;

  return monthlyPayment;
}

// Format number into currency (£ with 2 decimal places)
function displayCurrency(value) {
  return `£${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ======== FORM SUBMIT EVENT ========

calculatorForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputRadioChecked = document.querySelector(
    'input[name="mortgage"]:checked'
  );

  // Validate inputs
  const hasError =
    isEmpty(inputAmount, amountMsg, "This field is required") |
    isEmpty(inputTerm, termMsg, "This field is required") |
    isEmpty(inputRate, rateMsg, "This field is required") |
    (!inputRadioChecked &&
      (showErrorMsg(typeMsg, "This field is required"), 1));

  if (hasError) {
    return;
  }

  // Parse and sanitize values
  const rawAmount = inputAmount.value.replace(/,/g, "");
  const numberAmount = Number(rawAmount);
  const numberTerm = Number(inputTerm.value);
  const numberRate = Number(inputRate.value);
  const radioValue = inputRadioChecked.value;

  // Display results section
  resultEmpty.style.display = "none";
  resultOutput.style.display = "block";

  // Calculate based on mortgage type
  if (radioValue === "repayment") {
    const repaymentPayment = calculateRepayment(
      numberAmount,
      numberRate,
      numberTerm
    );
    const repaymentTotal = repaymentPayment * numberTerm * 12;

    resultAmount.textContent = displayCurrency(repaymentPayment);
    resultTotal.textContent = displayCurrency(repaymentTotal);
  } else {
    const interestPayment = calculateInterestOnly(numberAmount, numberRate);
    const interestTotal = interestPayment * numberTerm * 12;

    resultAmount.textContent = displayCurrency(interestPayment);
    resultTotal.textContent = displayCurrency(interestTotal);
  }
});

// ======== CLEAR BUTTON EVENT ========

btnClear.addEventListener("click", () => {
  // Reset result display
  resultEmpty.style.display = "flex";
  resultOutput.style.display = "none";
  resultAmount.textContent = "-";
  resultTotal.textContent = "-";

  // Reset inputs
  formGroup.forEach((fg) => fg.classList.remove("error"));
  inputAmount.value = "";
  inputTerm.value = "";
  inputRate.value = "";
  inputRadio.forEach((radio) => {
    radio.checked = false;
    radio.closest(".form-radio").classList.remove("active");
  });
});

// ======== INPUT EVENTS ========

// Format amount input as user types
inputAmount.addEventListener("input", () => {
  clearErrorMsg(amountMsg);

  const raw = inputAmount.value.replace(/[^0-9]/g, "");

  if (!raw) {
    inputAmount.value = "";
    return;
  }

  const formatNumber = Number(raw).toLocaleString("en-US");
  inputAmount.value = formatNumber;
});

// Restrict term input to 2 digits and prevent 0
inputTerm.addEventListener("input", () => {
  clearErrorMsg(termMsg);

  let raw = inputTerm.value.replace(/[^0-9]/g, "").slice(0, 2);

  if (/^0+$/.test(raw)) {
    raw = "1";
  }

  inputTerm.value = raw;
});

// Sanitize and limit rate input (1 dot max, no leading dot)
inputRate.addEventListener("input", () => {
  clearErrorMsg(rateMsg);

  let raw = inputRate.value.replace(/[^0-9.]/g, "");

  if (raw.startsWith(".")) {
    raw = raw.slice(1);
  }

  const parts = raw.split(".");
  if (parts.length > 2) {
    raw = parts[0] + "." + parts[1];
  }

  inputRate.value = raw;
});

// Handle mortgage type selection and active state
inputRadio.forEach((radio) => {
  radio.addEventListener("click", () => {
    clearErrorMsg(typeMsg);

    inputRadio.forEach((radio) =>
      radio.closest(".form-radio").classList.remove("active")
    );

    radio.closest(".form-radio").classList.add("active");
  });
});
