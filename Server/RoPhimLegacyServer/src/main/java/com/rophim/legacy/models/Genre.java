// Sửa Genre.java
package com.rophim.legacy.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id; // <-- THÊM
import org.springframework.data.mongodb.core.mapping.Document; // <-- THÊM
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "genres")
public class Genre {
    @Id
    private String id;

    @Field("genre_id")
    @JsonProperty("genre_id")
    private Integer genreId;

    @Field("genre_name")
    @JsonProperty("genre_name")
    private String genreName;
}