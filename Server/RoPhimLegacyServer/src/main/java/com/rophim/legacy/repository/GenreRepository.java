package com.rophim.legacy.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rophim.legacy.models.Genre;

public interface GenreRepository extends MongoRepository<Genre, String> {

}
