package com.rophim.legacy.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rophim.legacy.models.Genre;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserResponse {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("role")
    private String role;

    @JsonProperty("token")
    private String token;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("favourite_genres")
    private List<Genre> favouriteGenres;
}
