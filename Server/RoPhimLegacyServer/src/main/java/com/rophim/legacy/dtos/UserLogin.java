package com.rophim.legacy.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserLogin {

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    @JsonProperty("email")
    private String email;

    @NotBlank(message = "Password can not be empty")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    @JsonProperty("password")
    private String password;
}
