package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.TeamStatsDTO;

import java.io.InputStream;
import java.util.Map;


public class OddsGenerator {

    private Map<String, Double> homeCoeffs;
    private Map<String, Double> awayCoeffs;

    // Konstruktor wczytuje model przy starcie aplikacji
    // Teraz przyjmuje nazwę pliku, więc możesz ładować różne ligi!
    public OddsGenerator(String fileName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Szuka w resources (lub global-resources jeśli tak skonfigurujesz builda)
            InputStream is = getClass().getResourceAsStream("/" + fileName);
            if (is == null) throw new RuntimeException("Nie znaleziono pliku modelu: " + fileName);

            PredictionModelConfig config = mapper.readValue(is, PredictionModelConfig.class);
            this.homeCoeffs = config.homeCoeffs;
            this.awayCoeffs = config.awayCoeffs;

            System.out.println("Model " + fileName + " wczytany poprawnie!");
        } catch (Exception e) {
            throw new RuntimeException("Błąd wczytywania modelu JSON: " + fileName, e);
        }
    }

    /**
     * Metoda 1: Oblicza siłę ataku (oczekiwane gole - Lambda).
     * To jest implementacja wzoru GLM Poisson: lambda = exp(suma wazona).
     */
    public double calculateLambda(TeamStatsDTO attackTeam, TeamStatsDTO defenseTeam, boolean isHome) {
        Map<String, Double> coeffs = isHome ? homeCoeffs : awayCoeffs;

        // 1. Stała (Intercept) - bazowa siła
        double linearSum = coeffs.getOrDefault("const", 0.0);

        // 2. Dodajemy wpływ ataku (cechy drużyny strzelającej)
        linearSum += coeffs.get("avg_goals_scored_5") * attackTeam.getAvgGoalsScored5();
        linearSum += coeffs.get("avg_npxg_5")         * attackTeam.getAvgNpxg5();
        linearSum += coeffs.get("avg_sca_5")          * attackTeam.getAvgSca5();

        // 3. Dodajemy wpływ obrony rywala (cechy z sufiksem _opp)
        linearSum += coeffs.get("avg_goals_conceded_5_opp") * defenseTeam.getAvgGoalsConceded5();
        linearSum += coeffs.get("avg_npxg_conceded_5_opp")  * defenseTeam.getAvgNpxgConceded5();

        // 4. Funkcja wykładnicza (Link function: Log)
        return Math.exp(linearSum);
    }

    /**
     * Metoda 2: Zamienia dwie Lambdy na Kursy Bukmacherskie (1X2).
     */
    public double[] generateOdds(double lambdaHome, double lambdaAway) {
        double probHome = 0.0;
        double probDraw = 0.0;
        double probAway = 0.0;
        int maxGoals = 10; // Symulujemy wyniki do 10 bramek

        for (int h = 0; h <= maxGoals; h++) {
            for (int a = 0; a <= maxGoals; a++) {
                // Prawdopodobieństwo konkretnego wyniku (np. 2:1)
                double p = poissonProbability(h, lambdaHome) * poissonProbability(a, lambdaAway);

                if (h > a) probHome += p;
                else if (h == a) probDraw += p;
                else probAway += p;
            }
        }

        // Dodajemy marżę bukmachera (np. 5%)
        double margin = 0.95;

        double odd1 = probHome > 0 ? (1.0 / probHome) * margin : 1.0;
        double oddX = probDraw > 0 ? (1.0 / probDraw) * margin : 1.0;
        double odd2 = probAway > 0 ? (1.0 / probAway) * margin : 1.0;
        return new double[]{(Math.round(odd1 * 100.0) / 100.0), (Math.round(oddX * 100.0) / 100.0), (Math.round(odd2 * 100.0) / 100.0)};
    }

    // Matematyka: Rozkład Poissona
    private double poissonProbability(int k, double lambda) {
        return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    }

    private long factorial(int n) {
        if (n <= 1) return 1;
        long res = 1;
        for (int i = 2; i <= n; i++) res *= i;
        return res;
    }
}
