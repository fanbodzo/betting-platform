package org.example;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "match_stats")
public class MatchStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String team;
    private String opponent;
    private String venue;

    private Integer goalsScored;
    private Double npxgCreated;
    private Double sotFor;
    private Double scaFor;

    private Integer goalsConceded;
    private Double npxgConceded;
    private Double sotAgainst;
    private Double scaAgainst;
}
