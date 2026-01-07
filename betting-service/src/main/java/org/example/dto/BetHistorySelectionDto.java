package org.example.dto;

import lombok.Builder;
import lombok.Data;
import org.example.entity.enums.BetStatus;

@Data
@Builder
public class BetHistorySelectionDto {
    private String eventName;
    private String marketName;
    private String outcomeName;
    private Double oddValue;
    private BetStatus status;
}
