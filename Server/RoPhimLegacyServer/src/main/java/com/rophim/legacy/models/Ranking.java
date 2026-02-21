package com.rophim.legacy.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "rankings")
public class Ranking {
    @Field("ranking_value")
    @JsonProperty("ranking_value")
    private Integer rankingValue;

    @Field("ranking_name")
    @JsonProperty("ranking_name")
    private String rankingName;
}
