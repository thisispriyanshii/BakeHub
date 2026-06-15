package com.bakehub.my.controller;

import com.bakehub.my.entity.User;
import com.bakehub.my.service.UserService;
import com.bakehub.my.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;


    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user){

     if(userService.findByEmail(user.getEmail()).isPresent()){

         return ResponseEntity.badRequest().body("Email already exists");

     }

     user.setPassword(passwordEncoder.encode(user.getPassword()));
     userService.save(user);

     return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user){

        Optional<User> existing = userService.findByEmail(user.getEmail());

        if(existing.isEmpty()){
            return ResponseEntity.badRequest().body("User not found");
        }

        if(!passwordEncoder.matches(user.getPassword(),existing.get().getPassword())){
            return ResponseEntity.badRequest().body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(Map.of("token", token));




    }



}
