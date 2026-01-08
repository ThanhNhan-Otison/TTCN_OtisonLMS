package org.example.beelearning.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@EnableWebMvc
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Map URL /videos/** đến thư mục thật trên ổ đĩa
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:C:/Document/TTCN/BE/BE-elearning/uploads/videos/");

        registry.addResourceHandler("/submissions/**")
                .addResourceLocations("file:C:/Document/TTCN/BE/BE-elearning/uploads/submissions/");
        registry.addResourceHandler("/docs/**")
                .addResourceLocations("file:uploads/docs/");
    }
}
