package com.agridoc.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String phone;
    private String region;
    private String role; // 'FARMER', 'EXPERT', 'ADMIN'
    private String fullName;
}
