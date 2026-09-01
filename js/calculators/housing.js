/**
 * GovCareer Compass
 * ============================================================
 * Housing / Government Quarter Calculator
 * ============================================================
 *
 * PURPOSE
 * -------
 * Compares:
 *
 *   Private Accommodation
 *             VS
 *   Government / Departmental Accommodation
 *
 * It keeps separate:
 * - rent
 * - HRA
 * - licence fee
 * - maintenance
 * - electricity/utilities
 * - commuting cost
 * - other housing expenses
 *
 * IMPORTANT
 * ---------
 * Government accommodation is NOT assumed to be free.
 *
 * The calculator does not decide whether an employee is entitled
 * to a quarter. Entitlement and availability must come from the
 * relevant service/housing rules and data.
 */

const HOUSING_MODES =
  Object.freeze({
    PRIVATE:
      'PRIVATE',

    GOVERNMENT_QUARTER:
      'GOVERNMENT_QUARTER',

    DEPARTMENTAL:
      'DEPARTMENTAL',

    HOSTEL:
      'HOSTEL',

    BARRACK:
      'BARRACK',

    OTHER:
      'OTHER'
  });

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

function monthlyFromAnnual(
  value
) {
  return (
    nonNegative(
      value
    ) / 12
  );
}

function calculateMonthlyHousingCost(
  input = {}
) {
  const monthlyRent =
    nonNegative(
      input.monthlyRent ??
      input.rent
    );

  const monthlyMaintenance =
    nonNegative(
      input.monthlyMaintenance ??
      input.maintenance
    );

  const monthlyUtilities =
    nonNegative(
      input.monthlyUtilities ??
      input.utilities
    );

  const monthlyCommute =
    nonNegative(
      input.monthlyCommute ??
      input.commutingCost
    );

  const monthlyOther =
    nonNegative(
      input.monthlyOther ??
      input.otherCosts
    );

  const monthlyLicenceFee =
    nonNegative(
      input.monthlyLicenceFee ??
      input.licenceFee
    );

  return {
    rent:
      monthlyRent,

    licenceFee:
      monthlyLicenceFee,

    maintenance:
      monthlyMaintenance,

    utilities:
      monthlyUtilities,

    commuting:
      monthlyCommute,

    other:
      monthlyOther,

    total:
      monthlyRent +
      monthlyLicenceFee +
      monthlyMaintenance +
      monthlyUtilities +
      monthlyCommute +
      monthlyOther
  };
}

/**
 * Private accommodation:
 *
 * Net housing burden =
 * rent + maintenance + utilities + commuting + other - HRA
 *
 * HRA should only be subtracted when it is actually payable to
 * the employee under the applicable rules.
 */
function calculatePrivateHousing(
  input = {}
) {
  const hra =
    nonNegative(
      input.hra
    );

  const cost =
    calculateMonthlyHousingCost(
      {
        monthlyRent:
          input.monthlyRent,
        monthlyLicenceFee:
          0,
        monthlyMaintenance:
          input.monthlyMaintenance,
        monthlyUtilities:
          input.monthlyUtilities,
        monthlyCommute:
          input.monthlyCommute,
        monthlyOther:
          input.monthlyOther
      }
    );

  const net =
    Math.max(
      0,
      cost.total -
        hra
    );

  return {
    mode:
      HOUSING_MODES.PRIVATE,

    grossHousingCost:
      cost.total,

    hraReceived:
      hra,

    netHousingCost:
      net,

    breakdown:
      cost
  };
}

/**
 * Government/departmental accommodation:
 *
 * Net housing burden =
 * licence fee
 * + maintenance
 * + utilities
 * + commuting
 * + other
 * + HRA opportunity cost
 *
 * The HRA opportunity cost is separate because the employee may
 * lose HRA when occupying government accommodation.
 *
 * This calculator requires the user/data layer to explicitly
 * specify whether HRA is retained, reduced, or lost.
 */
function calculateGovernmentHousing(
  input = {}
) {
  const licenceFee =
    nonNegative(
      input.monthlyLicenceFee ??
      input.licenceFee
    );

  const maintenance =
    nonNegative(
      input.monthlyMaintenance
    );

  const utilities =
    nonNegative(
      input.monthlyUtilities
    );

  const commuting =
    nonNegative(
      input.monthlyCommute
    );

  const other =
    nonNegative(
      input.monthlyOther
    );

  const hra =
    nonNegative(
      input.hra
    );

  const hraRetained =
    input.hraRetained ===
    true;

  const hraLost =
    input.hraRetained ===
    false;

  /*
   * If neither is specified, do not silently assume either outcome.
   * The calculator reports HRA opportunity cost as unknown.
   */
  const hraOpportunityCost =
    hraLost
      ? hra
      : 0;

  const directCost =
    licenceFee +
    maintenance +
    utilities +
    commuting +
    other;

  const effectiveCost =
    directCost +
    hraOpportunityCost;

  return {
    mode:
      input.mode ??
      HOUSING_MODES.GOVERNMENT_QUARTER,

    directHousingCost:
      directCost,

    hraRetained,

    hraLost,

    hraOpportunityCost,

    effectiveHousingCost:
      effectiveCost,

    breakdown: {
      licenceFee,
      maintenance,
      utilities,
      commuting,
      other,
      hraOpportunityCost
    },

    uncertainty: {
      hraRetentionKnown:
        hraRetained ||
        hraLost,

      message:
        hraRetained ||
        hraLost
          ? null
          : 'HRA treatment has not been specified; effective-cost comparison may be incomplete.'
    }
  };
}

/**
 * Compare private and government accommodation.
 */
function compareHousing(
  {
    privateHousing = {},
    governmentHousing = {}
  } = {}
) {
  const privateResult =
    calculatePrivateHousing(
      privateHousing
    );

  const governmentResult =
    calculateGovernmentHousing(
      governmentHousing
    );

  const monthlyDifference =
    privateResult.netHousingCost -
    governmentResult
      .effectiveHousingCost;

  const annualDifference =
    monthlyDifference *
    12;

  let financiallyBetter =
    'TIE';

  if (
    monthlyDifference >
    0
  ) {
    financiallyBetter =
      'GOVERNMENT';
  } else if (
    monthlyDifference <
    0
  ) {
    financiallyBetter =
      'PRIVATE';
  }

  return {
    private:
      privateResult,

    government:
      governmentResult,

    comparison: {
      monthlyDifference,
      annualDifference,

      financiallyBetter,

      absoluteMonthlyDifference:
        Math.abs(
          monthlyDifference
        ),

      absoluteAnnualDifference:
        Math.abs(
          annualDifference
        )
    },

    methodology: {
      private:
        'Rent + maintenance + utilities + commuting + other costs − HRA actually received.',

      government:
        'Licence fee + maintenance + utilities + commuting + other costs + HRA opportunity cost when HRA is actually lost.'
    }
  };
}

/**
 * Compare annual housing impact.
 */
function annualizeHousing(
  monthlyResult
) {
  if (
    !monthlyResult
  ) {
    return null;
  }

  return {
    monthly:
      monthlyResult,

    annual: {
      grossHousingCost:
        monthlyResult.grossHousingCost *
        12,

      hraReceived:
        monthlyResult.hraReceived *
        12,

      netHousingCost:
        monthlyResult.netHousingCost *
        12
    }
  };
}

/**
 * Convert a yearly housing budget into monthly values.
 */
function annualHousingToMonthly(
  annual = {}
) {
  return {
    rent:
      monthlyFromAnnual(
        annual.rent
      ),

    maintenance:
      monthlyFromAnnual(
        annual.maintenance
      ),

    utilities:
      monthlyFromAnnual(
        annual.utilities
      ),

    commuting:
      monthlyFromAnnual(
        annual.commuting
      ),

    other:
      monthlyFromAnnual(
        annual.other
      ),

    licenceFee:
      monthlyFromAnnual(
        annual.licenceFee
      )
  };
}

/**
 * ----------------------------------------------------------------
 * CAREER-DATA HELPERS
 * ----------------------------------------------------------------
 */

function createHousingInputFromCareer(
  career = {},
  overrides = {}
) {
  const housing =
    career.housing ||
    career.quarter ||
    {};

  return {
    hra:
      overrides.hra ??
      career.hra ??
      career.salary?.hra ??
      housing.hra ??
      0,

    monthlyLicenceFee:
      overrides.monthlyLicenceFee ??
      housing.monthlyLicenceFee ??
      housing.licenceFee ??
      0,

    monthlyMaintenance:
      overrides.monthlyMaintenance ??
      housing.monthlyMaintenance ??
      housing.maintenance ??
      0,

    monthlyUtilities:
      overrides.monthlyUtilities ??
      housing.monthlyUtilities ??
      0,

    monthlyCommute:
      overrides.monthlyCommute ??
      housing.monthlyCommute ??
      0,

    monthlyOther:
      overrides.monthlyOther ??
      housing.monthlyOther ??
      0,

    hraRetained:
      overrides.hraRetained ??
      housing.hraRetained ??
      undefined
  };
}

export {
  HOUSING_MODES,

  calculateMonthlyHousingCost,
  calculatePrivateHousing,
  calculateGovernmentHousing,
  compareHousing,

  annualizeHousing,
  annualHousingToMonthly,

  createHousingInputFromCareer
};

export default {
  calculatePrivateHousing,
  calculateGovernmentHousing,
  compareHousing,
  createHousingInputFromCareer
};
