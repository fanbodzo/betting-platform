package org.example;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchStatsRepository extends JpaRepository<MatchStats , Long> {
    List<MatchStats> findTop5ByTeamOrderByDateDesc(String team);
}
