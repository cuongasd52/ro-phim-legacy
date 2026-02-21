package com.rophim.legacy.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {
    @Id
    private String id;

    @Field("user_id")
    @JsonProperty("user_id")
    private String userId;

    @Field("first_name")
    @NotNull(message = "First name is required")
    @Size(min = 2, max = 100)
    @JsonProperty("first_name")
    private String firstName;

    @Field("last_name")
    @NotNull(message = "Last name is required")
    @Size(min = 2, max = 100)
    @JsonProperty("last_name")
    private String lastName;

    @Field("email")
    @NotNull(message = "Email is required")
    @Email(message = "Email should be valid")
    @JsonProperty("email")
    private String email;

    @Field("password")
    @NotNull(message = "Password is required")
    @Size(min = 6)
    @JsonProperty("password")
    private String password;

    @Field("role")
    @NotNull(message = "Role is required")
    @JsonProperty("role")
    private String role; // ADMIN or USER

    @Field("created_at")
    @CreatedDate
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    @Field("token")
    @JsonProperty("token")
    private String token;

    @Field("refresh_token")
    @JsonProperty("refresh_token")
    private String refreshToken;

    @Field("favourite_genres")
    @Size(max = 5, message = "Only choose 5 genres at most")
    @JsonProperty("favourite_genres")
    private List<Genre> favouriteGenres;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(new SimpleGrantedAuthority(this.role));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
