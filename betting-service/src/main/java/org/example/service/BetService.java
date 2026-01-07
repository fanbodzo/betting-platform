package org.example.service;

import org.example.dto.BetHistoryDto;
import java.util.List;

public interface BetService {
    void placeBet(Long userId , Double stake);
    List<BetHistoryDto> getUserBets(Long userId ,  String status);
}
