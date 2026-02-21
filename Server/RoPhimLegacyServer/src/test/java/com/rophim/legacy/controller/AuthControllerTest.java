package com.rophim.legacy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rophim.legacy.dtos.UserLogin;
import com.rophim.legacy.models.User;
import com.rophim.legacy.service.AuthService;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "google.api.key=mock-api-key",
        "base.prompt.template=Analyze this: %s"
})
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @SuppressWarnings("null")
    public void testRegister_Success() throws Exception {
        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("Password1!");
        user.setFirstName("Cuong");
        user.setLastName("Nguyen");
        user.setRole("USER");

        Mockito.when(authService.register(Mockito.any(User.class))).thenReturn(user);

        mockMvc.perform(post("/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.first_name").value("Cuong"))
                .andExpect(jsonPath("$.last_name").value("Nguyen"))
                .andExpect(jsonPath("$.email").value("test@gmail.com"));
    }

    @Test
    @SuppressWarnings("null")
    public void testLogin_Success() throws Exception {
        User user = new User();
        user.setEmail("test@gmail.com");
        user.setToken("mock-token");

        UserLogin login = new UserLogin("test@gmail.com", "Password1!");

        Mockito.when(authService.login("test@gmail.com", "Password1!")).thenReturn(user);

        mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-token"));
    }

}