package org.example.dto;

public class TeamStatsDTO {
    // Statystyki z ostatnich 5 meczów (zgodne z nazwami w Pythonie/FBref)
    private double avgGoalsScored5;
    private double avgNpxg5;
    private double avgSca5;

    // Statystyki defensywne (ile tracili)
    private double avgGoalsConceded5;
    private double avgNpxgConceded5;

    public TeamStatsDTO(double gs, double npxg, double sca, double gc, double npxgc) {
        this.avgGoalsScored5 = gs;
        this.avgNpxg5 = npxg;
        this.avgSca5 = sca;
        this.avgGoalsConceded5 = gc;
        this.avgNpxgConceded5 = npxgc;
    }

    // Gettery są niezbędne
    public double getAvgGoalsScored5() { return avgGoalsScored5; }
    public double getAvgNpxg5() { return avgNpxg5; }
    public double getAvgSca5() { return avgSca5; }
    public double getAvgGoalsConceded5() { return avgGoalsConceded5; }
    public double getAvgNpxgConceded5() { return avgNpxgConceded5; }
}
