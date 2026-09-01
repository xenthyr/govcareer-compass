/**
 * GovCareer Compass
 * ============================================================
 * Household Affordability Calculator
 * ============================================================
 *
 * PURPOSE
 * -------
 * Provides an illustrative household-budget analysis for a
 * government employee.
 *
 * The project specifically needs this because government-job
 * selection is not only about salary. The candidate wants to
 * understand:
 *
 * - spouse/family expenses;
 * - child-related expenses;
 * - elderly-parent support;
 * - rent/housing;
 * - food;
 * - transport;
 * - medical expenditure;
 * - insurance;
 * - education;
 * - EMI;
 * - savings;
 * - emergency reserve.
 *
 * IMPORTANT
 * ---------
 * This is an analytical household budget tool.
 *
 * It is NOT:
 * - financial advice;
 * - a prediction of actual household spending;
 * - a government benefit calculator.
 */

const EXPENSE_CATEGORIES =
  Object.freeze([
    'housing',
    'food',
    'utilities',
    'transport',
    'education',
    'medical',
    'insurance',
    'childcare',
    'elderlyParentCare',
    'communication',
    'personal',
    'debt',
    'other'
  ]);

function number(
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

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
}

function nonNegative(
  value
) {
  return Math.max(
    0,
    number(
      value
    )
  );
}

function roundCurrency(
  value
) {
  return Math.round(
    number(
      value
    )
  );
}

function sumObjectValues(
  object = {}
) {
  return Object.values(
    object
  ).reduce(
    (
      total,
      value
    ) =>
      total +
      nonNegative(
        value
      ),
    0
  );
}

/**
 * Normalize household composition.
 *
 * These fields are analytical inputs and do not imply anything
 * about the candidate personally.
 */
function normalizeHousehold(
  household = {}
) {
  return {
    employee:
      true,

    spouse:
      Boolean(
        household.spouse
      ),

    children:
      Math.max(
        0,
        Math.trunc(
          number(
            household.children
          )
        )
      ),

    elderlyParents:
      Math.max(
        0,
        Math.trunc(
          number(
            household.elderlyParents
          )
        )
      ),

    otherDependents:
      Math.max(
        0,
        Math.trunc(
          number(
            household.otherDependents
          )
        )
      )
  };
}

/**
 * Normalize expense categories.
 */
function normalizeExpenses(
  expenses = {}
) {
  const normalized = {};

  EXPENSE_CATEGORIES.forEach(
    (category) => {
      normalized[
        category
      ] =
        nonNegative(
          expenses[
            category
          ]
        );
    }
  );

  return normalized;
}

/**
 * Main affordability calculation.
 *
 * Formula:
 *
 * Net household income
 *   − household expenses
 *   − EMI/debt
 *   = monthly surplus
 *
 * Savings rate =
 *   monthly surplus / net household income × 100
 */
function calculateAffordability(
  {
    monthlyTakeHome = 0,
    spouseIncome = 0,
    otherHouseholdIncome = 0,

    expenses = {},

    oneTimeMonthlyReserve = 0,

    targetSavings = 0,

    household = {}
  } = {}
) {
  const employeeIncome =
    nonNegative(
      monthlyTakeHome
    );

  const additionalIncome =
    nonNegative(
      spouseIncome
    ) +
    nonNegative(
      otherHouseholdIncome
    );

  const totalHouseholdIncome =
    employeeIncome +
    additionalIncome;

  const normalizedHousehold =
    normalizeHousehold(
      household
    );

  const normalizedExpenses =
    normalizeExpenses(
      expenses
    );

  /*
   * "Debt" is included separately so the UI can show
   * EMI/debt as a distinct affordability burden.
   */
  const regularExpenses =
    sumObjectValues(
      normalizedExpenses
    );

  const emergencyReserve =
    nonNegative(
      oneTimeMonthlyReserve
    );

  const requiredSavings =
    nonNegative(
      targetSavings
    );

  const totalOutflow =
    regularExpenses +
    emergencyReserve +
    requiredSavings;

  const monthlySurplus =
    totalHouseholdIncome -
    regularExpenses;

  const surplusAfterTargets =
    monthlySurplus -
    emergencyReserve -
    requiredSavings;

  const savingsRate =
    totalHouseholdIncome >
      0
      ? (
          Math.max(
            0,
            monthlySurplus
          ) /
          totalHouseholdIncome
        ) *
        100
      : 0;

  const housingShare =
    totalHouseholdIncome >
      0
      ? (
          normalizedExpenses
            .housing /
          totalHouseholdIncome
        ) *
        100
      : 0;

  const debtShare =
    totalHouseholdIncome >
      0
      ? (
          normalizedExpenses
            .debt /
          totalHouseholdIncome
        ) *
        100
      : 0;

  const affordabilityStatus =
    getAffordabilityStatus(
      surplusAfterTargets,
      totalHouseholdIncome
    );

  return {
    household:
      normalizedHousehold,

    income: {
      employee:
        roundCurrency(
          employeeIncome
        ),

      spouse:
        roundCurrency(
          spouseIncome
        ),

      other:
        roundCurrency(
          otherHouseholdIncome
        ),

      total:
        roundCurrency(
          totalHouseholdIncome
        )
    },

    expenses:
      Object.fromEntries(
        Object.entries(
          normalizedExpenses
        ).map(
          ([
            category,
            value
          ]) => [
            category,
            roundCurrency(
              value
            )
          ]
        )
      ),

    totals: {
      regularExpenses:
        roundCurrency(
          regularExpenses
        ),

      emergencyReserve:
        roundCurrency(
          emergencyReserve
        ),

      targetSavings:
        roundCurrency(
          requiredSavings
        ),

      totalOutflow:
        roundCurrency(
          totalOutflow
        )
    },

    affordability: {
      monthlySurplus:
        roundCurrency(
          monthlySurplus
        ),

      surplusAfterTargets:
        roundCurrency(
          surplusAfterTargets
        ),

      savingsRate:
        Number(
          savingsRate.toFixed(
            2
          )
        ),

      housingShare:
        Number(
          housingShare.toFixed(
            2
          )
        ),

      debtShare:
        Number(
          debtShare.toFixed(
            2
          )
        ),

      status:
        affordabilityStatus
    },

    methodology: {
      monthlySurplus:
        'Total household income − regular monthly expenses.',

      surplusAfterTargets:
        'Monthly surplus − emergency reserve target − optional target savings.',

      note:
        'Illustrative household affordability analysis; actual costs vary by household, city, school, medical needs, debt and lifestyle.'
    }
  };
}

function getAffordabilityStatus(
  surplusAfterTargets,
  income
) {
  const surplus =
    number(
      surplusAfterTargets
    );

  const monthlyIncome =
    number(
      income
    );

  if (
    monthlyIncome <=
    0
  ) {
    return {
      key:
        'NO_INCOME_DATA',

      label:
        'Income data unavailable'
    };
  }

  const ratio =
    surplus /
    monthlyIncome;

  if (
    surplus < 0
  ) {
    return {
      key:
        'DEFICIT',

      label:
        'Monthly deficit'
    };
  }

  if (
    ratio <
    0.10
  ) {
    return {
      key:
        'TIGHT',

      label:
        'Tight budget'
    };
  }

  if (
    ratio <
    0.20
  ) {
    return {
      key:
        'MODERATE',

      label:
        'Moderate surplus'
    };
  }

  return {
    key:
      'COMFORTABLE',

    label:
      'Relatively comfortable surplus'
  };
}

/**
 * ----------------------------------------------------------------
 * JOB COMPARISON
 * ----------------------------------------------------------------
 *
 * Compare two careers from a household-affordability perspective.
 */
function compareCareerAffordability(
  first,
  second,
  householdModel = {}
) {
  const firstResult =
    calculateAffordability(
      {
        ...householdModel,
        monthlyTakeHome:
          first?.estimatedInHand ??
          first?.inHand ??
          first?.monthlyTakeHome ??
          0
      }
    );

  const secondResult =
    calculateAffordability(
      {
        ...householdModel,
        monthlyTakeHome:
          second?.estimatedInHand ??
          second?.inHand ??
          second?.monthlyTakeHome ??
          0
      }
    );

  return {
    first:
      firstResult,

    second:
      secondResult,

    difference: {
      householdIncome:
        firstResult.income.total -
        secondResult.income.total,

      monthlySurplus:
        firstResult.affordability
          .monthlySurplus -
        secondResult.affordability
          .monthlySurplus,

      surplusAfterTargets:
        firstResult.affordability
          .surplusAfterTargets -
        secondResult.affordability
          .surplusAfterTargets
    }
  };
}

/**
 * ----------------------------------------------------------------
 * YEARLY PROJECTION
 * ----------------------------------------------------------------
 *
 * This simply annualizes the monthly result.
 * It does NOT forecast salary increments, inflation or promotions.
 */
function annualizeAffordability(
  result
) {
  if (
    !result
  ) {
    return null;
  }

  return {
    income: {
      employee:
        result.income.employee *
        12,

      spouse:
        result.income.spouse *
        12,

      other:
        result.income.other *
        12,

      total:
        result.income.total *
        12
    },

    expenses: Object.fromEntries(
      Object.entries(
        result.expenses
      ).map(
        ([
          category,
          value
        ]) => [
          category,
          value *
            12
        ]
      )
    ),

    monthlySurplus:
      result.affordability
        .monthlySurplus *
      12,

    annualSurplusAfterTargets:
      result.affordability
        .surplusAfterTargets *
      12
  };
}

/**
 * ----------------------------------------------------------------
 * BASIC HOUSEHOLD SCENARIOS
 * ----------------------------------------------------------------
 *
 * Scenarios are deliberately generic. They do not claim to
 * represent the candidate's actual family.
 */
function createHouseholdScenario(
  {
    employeeTakeHome,
    spouseIncome = 0,
    children = 0,
    elderlyParents = 0,
    housing = 0,
    food = 0,
    utilities = 0,
    transport = 0,
    education = 0,
    medical = 0,
    insurance = 0,
    childcare = 0,
    elderlyParentCare = 0,
    communication = 0,
    personal = 0,
    debt = 0,
    other = 0
  } = {}
) {
  return calculateAffordability(
    {
      monthlyTakeHome:
        employeeTakeHome,

      spouseIncome,

      household: {
        spouse:
          spouseIncome >
          0,

        children,

        elderlyParents
      },

      expenses: {
        housing,
        food,
        utilities,
        transport,
        education,
        medical,
        insurance,
        childcare,
        elderlyParentCare,
        communication,
        personal,
        debt,
        other
      }
    }
  );
}

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

export {
  EXPENSE_CATEGORIES,

  normalizeHousehold,
  normalizeExpenses,

  calculateAffordability,
  getAffordabilityStatus,

  compareCareerAffordability,
  annualizeAffordability,

  createHouseholdScenario,
  formatINR
};

export default {
  calculateAffordability,
  compareCareerAffordability,
  annualizeAffordability,
  createHouseholdScenario,
  formatINR
};
