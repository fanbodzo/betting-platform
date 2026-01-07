package org.example.repository;

import org.example.Entity.CompanyFinances;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyFinancesRepository extends JpaRepository<CompanyFinances,Integer> {
}
