package org.example;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.List;

public class PredictionModelConfig {
    @JsonProperty("features_home")
    public List<String> featuresHome;

    @JsonProperty("home_coeffs")
    public Map<String, Double> homeCoeffs;

    @JsonProperty("away_coeffs")
    public Map<String, Double> awayCoeffs;
}
