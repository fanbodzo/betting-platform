package org.example;

import lombok.RequiredArgsConstructor;
import org.example.dto.OddsResponse;
import org.example.dto.TeamStatsDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OddsService {

    private final MatchStatsRepository repository;
    private final OddsGenerator oddsGenerator;

    public OddsResponse calculateOdds(String home, String away) {
        //pobranie ostatnich 5 meczy bo ich uzywamy do wylicznia kursow
        List<MatchStats> homeLast5 = repository.findTop5ByTeamOrderByDateDesc(home);
        List<MatchStats> awayLast5 = repository.findTop5ByTeamOrderByDateDesc(away);

        //srednie
        TeamStatsDTO homeStats = calculateStats(homeLast5);
        TeamStatsDTO awayStats = calculateStats(awayLast5);

        //liczneie lambd
        double lambdaHome = oddsGenerator.calculateLambda(homeStats, awayStats, true);
        double lambdaAway = oddsGenerator.calculateLambda(awayStats, homeStats, false);

        //liczneie kursow
        double[] odds = oddsGenerator.generateOdds(lambdaHome, lambdaAway);

        return new OddsResponse(odds[0], odds[1], odds[2]);
    }

    private TeamStatsDTO calculateStats(List<MatchStats> matches) {

        double totalGoals = 0;
        double totalNpxg = 0;
        double totalSca = 0;
        double totalGoalsConceded = 0;
        double totalNpxgConceded = 0;

        for (MatchStats m : matches) {
            totalGoals += m.getGoalsScored();
            totalNpxg += m.getNpxgCreated();
            totalSca += m.getScaFor();
            totalGoalsConceded += m.getGoalsConceded();
            totalNpxgConceded += m.getNpxgConceded();
        }

        int count = matches.size();

        return new TeamStatsDTO(
                totalGoals / count,        // avgGoalsScored5
                totalNpxg / count,         // avgNpxg5
                totalSca / count,          // avgSca5
                totalGoalsConceded / count,// avgGoalsConceded5
                totalNpxgConceded / count  // avgNpxgConceded5
        );
    }
}