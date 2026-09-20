package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import com.meridian.lms.ai.dto.NarrativeResult;

public interface CreditRiskNarrativeService {
    NarrativeResult generateNarrative(CustomerCreditProfile profile);
}