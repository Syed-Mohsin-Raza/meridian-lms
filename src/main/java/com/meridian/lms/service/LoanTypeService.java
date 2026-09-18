package com.meridian.lms.service;

import com.meridian.lms.dto.response.LoanTypeResponse;
import com.meridian.lms.entity.LoanType;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.LoanTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoanTypeService {

    private final LoanTypeRepository loanTypeRepository;

    public LoanTypeService(LoanTypeRepository loanTypeRepository) {
        this.loanTypeRepository = loanTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<LoanTypeResponse> listActive() {
        return loanTypeRepository.findByActiveTrue().stream()
                .map(LoanTypeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoanType findByCode(String code) {
        return loanTypeRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Loan type not found: " + code));
    }
}