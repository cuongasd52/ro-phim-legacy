package com.rophim.legacy.repository;

import com.rophim.legacy.models.Ranking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RankingRepository extends MongoRepository<Ranking, String> {
    Ranking findByRankingName(String rankingName);
}
