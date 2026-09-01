/**
 * GovCareer Compass
 * ============================================================
 * Salary Calculation Engine
 * ============================================================
 *
 * PURPOSE
 * -------
 * Provides transparent salary calculations for government-career
 * records without pretending that an estimate is an official payslip.
 *
 * SUPPORTED CONCEPTS
 * ------------------
 * - Basic pay
 * - Dearness Allowance (DA)
 * - House Rent Allowance (HRA)
 * - Transport allowance
 * - Special / other allowances
 * - Government-quarter effect
 * - Licence fee
 * - NPS / retirement contribution
 * - Income-tax estimate
 * - Other deductions
 * - Gross pay
 * - Total deductions
 * - Estimated in-hand pay
 *
 * IMPORTANT
 * ---------
 * This module performs arithmetic only.
 *
 * It does NOT:
 * - decide official eligibility;
 * - determine the applicable government pay rules;
 * - invent current DA/HRA rates;
 * - determine a legally binding tax liability;
 * - guarantee an employee's actual payslip.
 *
 * Any percentage or amount must come from verified data, user input,
 * or an explicitly labelled estimate.
 */

/**
 * ----------------------------------------------------------------
 * ENUMERATIONS
 * ----------------------------------------------------------------
 */

const GOVERNMENT_TYPES = Object.freeze({
  WEST_BENGAL:
    'WEST_BENGAL',

  CENTRAL:
    'CENTRAL',

  OTHER:
    'OTHER'
});

const PAY_COMPONENT_TYPES = Object.freeze({
  AMOUNT:
    'AMOUNT',

  PERCENT_OF_BASIC:
    'PERCENT_OF_BASIC',

  PERCENT_OF_REFERENCE:
    'PERCENT_OF_REFERENCE'
});

/**
 * ----------------------------------------------------------------
 * BASIC UTILITIES
 * ----------------------------------------------------------------
 */

function toNumber(
  value,
  fallback = 0
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return fallback;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

function nonNegative(
  value
) {
  return Math.max(
    0,
    toNumber(
      value
    )
  );
}

function clamp(
  value,
  min = 0,
  max = Number.POSITIVE_INFINITY
) {
  return Math.min(
    max,
    Math.max(
      min,
      toNumber(
        value
      )
    )
  );
}

function roundCurrency(
  value
) {
  return Math.round(
    toNumber(
      value
    )
  );
}

function roundPercentage(
  value
) {
  return Number(
    toNumber(
      value
    ).toFixed(
      2
    )
  );
}

function percentageOf(
  base,
  percentage
) {
  return (
    nonNegative(
      base
    ) *
    (
      nonNegative(
        percentage
      ) /
      100
    )
  );
}

/**
 * Calculate a component represented by either:
 *
 * {
 *   type: "AMOUNT",
 *   value: 1000
 * }
 *
 * or:
 *
 * {
 *   type: "PERCENT_OF_BASIC",
 *   rate: 10
 * }
 */
function calculateComponent(
  component,
  basic,
  referenceAmount = null
) {
  if (
    component ===
      undefined ||
    component === null
  ) {
    return 0;
  }

  if (
    typeof component ===
    'number'
  ) {
    return nonNegative(
      component
    );
  }

  if (
    typeof component !==
    'object'
  ) {
    return 0;
  }

  const type =
    String(
      component.type ||
      PAY_COMPONENT_TYPES.AMOUNT
    ).toUpperCase();

  switch (
    type
  ) {
    case PAY_COMPONENT_TYPES.AMOUNT:
      return nonNegative(
        component.value
      );

    case PAY_COMPONENT_TYPES.PERCENT_OF_BASIC:
      return percentageOf(
        basic,
        component.rate ??
          component.percentage
      );

    case PAY_COMPONENT_TYPES.PERCENT_OF_REFERENCE:
      return percentageOf(
        referenceAmount ?? 0,
        component.rate ??
          component.percentage
      );

    default:
      return 0;
  }
}

/**
 * ----------------------------------------------------------------
 * ALLOWANCE CALCULATION
 * ----------------------------------------------------------------
 */

function calculateDA(
  basicPay,
  da
) {
  if (
    da === undefined ||
    da === null
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'NOT_PROVIDED'
    };
  }

  if (
    typeof da ===
    'number'
  ) {
    return {
      amount:
        nonNegative(
          da
        ),
      rate: null,
      basis:
        'FIXED_AMOUNT'
    };
  }

  if (
    typeof da !==
    'object'
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'INVALID'
    };
  }

  const rate =
    da.rate ??
    da.percentage;

  if (
    Number.isFinite(
      Number(rate)
    )
  ) {
    return {
      amount:
        percentageOf(
          basicPay,
          rate
        ),
      rate:
        roundPercentage(
          rate
        ),
      basis:
        'PERCENT_OF_BASIC'
    };
  }

  return {
    amount:
      calculateComponent(
        da,
        basicPay
      ),
    rate: null,
    basis:
      'FIXED_AMOUNT'
  };
}

function calculateHRA(
  basicPay,
  hra
) {
  if (
    hra === undefined ||
    hra === null
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'NOT_PROVIDED'
    };
  }

  if (
    typeof hra ===
    'number'
  ) {
    return {
      amount:
        nonNegative(
          hra
        ),
      rate: null,
      basis:
        'FIXED_AMOUNT'
    };
  }

  if (
    typeof hra !==
    'object'
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'INVALID'
    };
  }

  if (
    hra.suspended ===
    true
  ) {
    return {
      amount: 0,
      rate:
        Number.isFinite(
          Number(
            hra.rate ??
            hra.percentage
          )
        )
          ? roundPercentage(
              hra.rate ??
                hra.percentage
            )
          : null,
      basis:
        'SUSPENDED'
    };
  }

  const rate =
    hra.rate ??
    hra.percentage;

  if (
    Number.isFinite(
      Number(rate)
    )
  ) {
    return {
      amount:
        percentageOf(
          basicPay,
          rate
        ),
      rate:
        roundPercentage(
          rate
        ),
      basis:
        'PERCENT_OF_BASIC'
    };
  }

  return {
    amount:
      calculateComponent(
        hra,
        basicPay
      ),
    rate: null,
    basis:
      'FIXED_AMOUNT'
  };
}

/**
 * ----------------------------------------------------------------
 * DEDUCTION CALCULATION
 * ----------------------------------------------------------------
 */

function calculateNPSContribution(
  basicPay,
  daAmount,
  nps
) {
  if (
    nps === undefined ||
    nps === null ||
    nps === false
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'NOT_PROVIDED'
    };
  }

  if (
    typeof nps ===
    'number'
  ) {
    return {
      amount:
        nonNegative(
          nps
        ),
      rate: null,
      basis:
        'FIXED_AMOUNT'
    };
  }

  if (
    typeof nps !==
    'object'
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'INVALID'
    };
  }

  if (
    nps.enabled ===
    false
  ) {
    return {
      amount: 0,
      rate: null,
      basis:
        'DISABLED'
    };
  }

  const rate =
    nps.rate ??
    nps.percentage;

  const baseMode =
    String(
      nps.base ||
      'BASIC_PLUS_DA'
    ).toUpperCase();

  let contributionBase =
    basicPay;

  if (
    baseMode ===
    'BASIC_PLUS_DA'
  ) {
    contributionBase =
      basicPay +
      daAmount;
  }

  if (
    Number.isFinite(
      Number(rate)
    )
  ) {
    return {
      amount:
        percentageOf(
          contributionBase,
          rate
        ),
      rate:
        roundPercentage(
          rate
        ),
      basis:
        baseMode
    };
  }

  return {
    amount:
      nonNegative(
        nps.amount
      ),
    rate: null,
    basis:
      'FIXED_AMOUNT'
  };
}

function calculateDeduction(
  deduction,
  grossPay
) {
  if (
    deduction === undefined ||
    deduction === null
  ) {
    return 0;
  }

  if (
    typeof deduction ===
    'number'
  ) {
    return nonNegative(
      deduction
    );
  }

  if (
    typeof deduction !==
    'object'
  ) {
    return 0;
  }

  const type =
    String(
      deduction.type ||
      PAY_COMPONENT_TYPES.AMOUNT
    ).toUpperCase();

  if (
    type ===
    PAY_COMPONENT_TYPES.PERCENT_OF_REFERENCE
  ) {
    return percentageOf(
      grossPay,
      deduction.rate ??
        deduction.percentage
    );
  }

  return calculateComponent(
    deduction,
    grossPay,
    grossPay
  );
}

/**
 * ----------------------------------------------------------------
 * INPUT NORMALIZATION
 * ----------------------------------------------------------------
 */

function normalizeSalaryInput(
  input = {}
) {
  const basicPay =
    nonNegative(
      input.basicPay ??
      input.startingBasic ??
      input.basic ??
      0
    );

  const daInput =
    input.da ??
    input.dearnessAllowance ??
    null;

  const hraInput =
    input.hra ??
    input.houseRentAllowance ??
    null;

  const governmentQuarter =
    Boolean(
      input.governmentQuarter ??
      input.quarterOccupied ??
      false
    );

  const licenceFee =
    nonNegative(
      input.licenceFee ??
      input.quarterLicenceFee ??
      0
    );

  const transportAllowance =
    calculateComponent(
      input.transportAllowance ??
        input.transport,
      basicPay
    );

  const specialAllowance =
    calculateComponent(
      input.specialAllowance,
      basicPay
    );

  const otherAllowances =
    Array.isArray(
      input.otherAllowances
    )
      ? input.otherAllowances
      : [];

  const otherAllowanceAmount =
    otherAllowances.reduce(
      (
        total,
        component
      ) =>
        total +
        calculateComponent(
          component,
          basicPay
        ),
      0
    );

  const miscellaneousAllowances =
    nonNegative(
      input.miscellaneousAllowances
    );

  return {
    government:
      input.government ??
      GOVERNMENT_TYPES.OTHER,

    paySystem:
      input.paySystem ??
      null,

    payLevel:
      input.payLevel ??
      null,

    basicPay,

    daInput,

    hraInput,

    governmentQuarter,

    licenceFee,

    transportAllowance,

    specialAllowance,

    otherAllowanceAmount,

    miscellaneousAllowances,

    nps:
      input.nps ??
      input.retirementContribution ??
      null,

    tax:
      input.tax ??
      input.incomeTax ??
      null,

    professionalTax:
      input.professionalTax ??
      null,

    otherDeductions:
      Array.isArray(
        input.otherDeductions
      )
        ? input.otherDeductions
        : [],

    fixedOtherDeductions:
      nonNegative(
        input.fixedOtherDeductions
      ),

    metadata:
      input.metadata &&
      typeof input.metadata ===
        'object'
        ? {
            ...input.metadata
          }
        : {}
  };
}

/**
 * ----------------------------------------------------------------
 * QUARTER / HRA INTERACTION
 * ----------------------------------------------------------------
 *
 * Occupation of government accommodation may affect HRA.
 *
 * The calculator deliberately does NOT assume the legal rule.
 *
 * The input must explicitly state:
 *
 * hraAdjustment:
 *   "KEEP"
 *   "ZERO"
 *   "CUSTOM"
 */
function applyQuarterHRAAdjustment(
  hraCalculation,
  input
) {
  if (
    !input.governmentQuarter
  ) {
    return {
      ...hraCalculation,
      finalAmount:
        hraCalculation.amount,
      adjustment:
        'NO_QUARTER'
    };
  }

  const adjustment =
    String(
      input.hraInput
        ?.quarterAdjustment ||
      input.hraInput
        ?.governmentQuarterEffect ||
      'KEEP'
    ).toUpperCase();

  if (
    adjustment ===
    'ZERO'
  ) {
    return {
      ...hraCalculation,
      finalAmount: 0,
      adjustment:
        'HRA_NOT_INCLUDED_WHILE_QUARTER_OCCUPIED'
    };
  }

  if (
    adjustment ===
    'CUSTOM'
  ) {
    return {
      ...hraCalculation,
      finalAmount:
        nonNegative(
          input.hraInput
            ?.quarterHraAmount
        ),
      adjustment:
        'CUSTOM_QUARTER_AMOUNT'
    };
  }

  return {
    ...hraCalculation,
    finalAmount:
      hraCalculation.amount,
    adjustment:
      'NO_AUTOMATIC_ADJUSTMENT'
  };
}

/**
 * ----------------------------------------------------------------
 * MAIN SALARY CALCULATOR
 * ----------------------------------------------------------------
 */

function calculateSalary(
  rawInput = {}
) {
  const input =
    normalizeSalaryInput(
      rawInput
    );

  const da =
    calculateDA(
      input.basicPay,
      input.daInput
    );

  const hra =
    calculateHRA(
      input.basicPay,
      input.hraInput
    );

  const adjustedHRA =
    applyQuarterHRAAdjustment(
      hra,
      input
    );

  const totalAllowances =
    da.amount +
    adjustedHRA.finalAmount +
    input.transportAllowance +
    input.specialAllowance +
    input.otherAllowanceAmount +
    input.miscellaneousAllowances;

  const grossPay =
    input.basicPay +
    totalAllowances;

  const nps =
    calculateNPSContribution(
      input.basicPay,
      da.amount,
      input.nps
    );

  const tax =
    calculateDeduction(
      input.tax,
      grossPay
    );

  const professionalTax =
    calculateDeduction(
      input.professionalTax,
      grossPay
    );

  const otherDeductionsAmount =
    input.otherDeductions.reduce(
      (
        total,
        deduction
      ) =>
        total +
        calculateDeduction(
          deduction,
          grossPay
        ),
      0
    ) +
    input.fixedOtherDeductions;

  /*
   * Quarter licence fee is treated as a deduction/cost only when
   * government accommodation is actually occupied.
   */
  const housingLicenceFee =
    input.governmentQuarter
      ? input.licenceFee
      : 0;

  const totalDeductions =
    nps.amount +
    tax +
    professionalTax +
    otherDeductionsAmount +
    housingLicenceFee;

  const estimatedInHand =
    Math.max(
      0,
      grossPay -
        totalDeductions
    );

  return {
    government:
      input.government,

    paySystem:
      input.paySystem,

    payLevel:
      input.payLevel,

    basicPay:
      roundCurrency(
        input.basicPay
      ),

    allowances: {
      da:
        roundCurrency(
          da.amount
        ),

      daRate:
        da.rate,

      hra:
        roundCurrency(
          adjustedHRA.finalAmount
        ),

      hraRate:
        hra.rate,

      hraAdjustment:
        adjustedHRA.adjustment,

      transport:
        roundCurrency(
          input.transportAllowance
        ),

      special:
        roundCurrency(
          input.specialAllowance
        ),

      other:
        roundCurrency(
          input.otherAllowanceAmount +
          input.miscellaneousAllowances
        ),

      total:
        roundCurrency(
          totalAllowances
        )
    },

    grossPay:
      roundCurrency(
        grossPay
      ),

    deductions: {
      nps:
        roundCurrency(
          nps.amount
        ),

      incomeTax:
        roundCurrency(
          tax
        ),

      professionalTax:
        roundCurrency(
          professionalTax
        ),

      housingLicenceFee:
        roundCurrency(
          housingLicenceFee
        ),

      other:
        roundCurrency(
          otherDeductionsAmount
        ),

      total:
        roundCurrency(
          totalDeductions
        )
    },

    estimatedInHand:
      roundCurrency(
        estimatedInHand
      ),

    effectiveHousingReduction:
      roundCurrency(
        housingLicenceFee
      ),

    assumptions: {
      salaryIsEstimate:
        true,

      governmentQuarterIncluded:
        input.governmentQuarter,

      taxIsExact:
        false,

      allowancesAreOfficial:
        Boolean(
          rawInput
            .allowancesAreOfficial
        ),

      dataSource:
        rawInput.dataSource ??
        'USER_OR_DATASET_INPUT',

      note:
        'Actual take-home pay depends on applicable service rules, posting, allowances, deductions, tax regime, accommodation and payroll conditions.'
    },

    metadata:
      input.metadata
  };
}

/**
 * ----------------------------------------------------------------
 * CAREER RECORD INTEGRATION
 * ----------------------------------------------------------------
 *
 * Converts a job record into salary calculator input without
 * inventing values.
 *
 * Only values explicitly available in the job record are used.
 */
function createSalaryInputFromCareer(
  career = {},
  overrides = {}
) {
  const salaryData =
    career.salary ||
    career.pay ||
    {};

  return {
    government:
      career.government ??
      salaryData.government ??
      null,

    paySystem:
      career.paySystem ??
      salaryData.paySystem ??
      null,

    payLevel:
      career.payLevel ??
      salaryData.payLevel ??
      null,

    basicPay:
      overrides.basicPay ??
      career.startingBasic ??
      salaryData.startingBasic ??
      null,

    da:
      overrides.da ??
      salaryData.da ??
      null,

    hra:
      overrides.hra ??
      salaryData.hra ??
      null,

    transportAllowance:
      overrides.transportAllowance ??
      salaryData.transportAllowance ??
      null,

    specialAllowance:
      overrides.specialAllowance ??
      salaryData.specialAllowance ??
      null,

    otherAllowances:
      overrides.otherAllowances ??
      salaryData.otherAllowances ??
      [],

    governmentQuarter:
      overrides.governmentQuarter ??
      false,

    licenceFee:
      overrides.licenceFee ??
      0,

    nps:
      overrides.nps ??
      salaryData.nps ??
      null,

    tax:
      overrides.tax ??
      null,

    professionalTax:
      overrides.professionalTax ??
      null,

    otherDeductions:
      overrides.otherDeductions ??
      [],

    fixedOtherDeductions:
      overrides.fixedOtherDeductions ??
      0,

    metadata: {
      careerId:
        career.id ??
        null,

      careerName:
        career.name ??
        career.post ??
        null
    }
  };
}

/**
 * ----------------------------------------------------------------
 * COMPARISON
 * ----------------------------------------------------------------
 */

function compareSalaries(
  firstInput,
  secondInput
) {
  const first =
    calculateSalary(
      firstInput
    );

  const second =
    calculateSalary(
      secondInput
    );

  return {
    first,
    second,

    difference: {
      basicPay:
        first.basicPay -
        second.basicPay,

      grossPay:
        first.grossPay -
        second.grossPay,

      estimatedInHand:
        first.estimatedInHand -
        second.estimatedInHand
    },

    higherGross:
      first.grossPay ===
      second.grossPay
        ? 'TIE'
        : first.grossPay >
            second.grossPay
          ? 'FIRST'
          : 'SECOND',

    higherEstimatedInHand:
      first.estimatedInHand ===
      second.estimatedInHand
        ? 'TIE'
        : first.estimatedInHand >
            second.estimatedInHand
          ? 'FIRST'
          : 'SECOND'
  };
}

/**
 * ----------------------------------------------------------------
 * FORMATTING HELPERS
 * ----------------------------------------------------------------
 */

function formatINR(
  value
) {
  const amount =
    roundCurrency(
      value
    );

  try {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style:
          'currency',
        currency:
          'INR',
        maximumFractionDigits:
          0
      }
    ).format(
      amount
    );
  } catch {
    return `₹${amount.toLocaleString(
      'en-IN'
    )}`;
  }
}

function createSalarySummary(
  result
) {
  if (
    !result
  ) {
    return null;
  }

  return {
    basic:
      formatINR(
        result.basicPay
      ),

    gross:
      formatINR(
        result.grossPay
      ),

    deductions:
      formatINR(
        result.deductions
          .total
      ),

    estimatedInHand:
      formatINR(
        result.estimatedInHand
      ),

    disclaimer:
      'Estimated salary; not an official payslip.'
  };
}

export {
  GOVERNMENT_TYPES,
  PAY_COMPONENT_TYPES,

  calculateDA,
  calculateHRA,
  calculateNPSContribution,
  calculateSalary,

  createSalaryInputFromCareer,
  compareSalaries,

  formatINR,
  createSalarySummary,

  percentageOf,
  calculateComponent,
  normalizeSalaryInput
};

export default {
  calculateSalary,
  createSalaryInputFromCareer,
  compareSalaries,
  formatINR,
  createSalarySummary
};
