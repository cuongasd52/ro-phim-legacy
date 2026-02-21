package com.rophim.legacy.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

import jakarta.annotation.PostConstruct;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    @Autowired
    private MappingMongoConverter mappingMongoConverter;

    @PostConstruct
    public void removeClassField() {
        mappingMongoConverter.setTypeMapper(new DefaultMongoTypeMapper(null));
    }
}
