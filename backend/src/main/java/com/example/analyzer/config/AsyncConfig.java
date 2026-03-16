package com.example.analyzer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "analysisTaskExecutor")
    public Executor analysisTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);        // Minimum threads
        executor.setMaxPoolSize(10);       // Max threads if queue is full
        executor.setQueueCapacity(100);    // Queue for pending tasks
        executor.setThreadNamePrefix("AI-Analysis-");
        executor.initialize();
        return executor;
    }
}
