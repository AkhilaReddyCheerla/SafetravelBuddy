package com.safetravel.backend;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    private final JourneyRepository journeyRepository;

    public JourneyController(JourneyRepository journeyRepository) {
        this.journeyRepository = journeyRepository;
    }

    @PostMapping("/start")
    public Map<String, Object> startJourney(
            @RequestBody(required = false) Map<String, String> body) {

        String userName = (body != null && body.get("userName") != null)
                ? body.get("userName")
                : "Guest";

        Journey journey = Journey.builder()
                .userName(userName)
                .startedAt(LocalDateTime.now())
                .status("ACTIVE")
                .build();

        Journey saved = journeyRepository.save(journey);

        return Map.of(
                "journeyId", saved.getId(),
                "status", saved.getStatus(),
                "startedAt", saved.getStartedAt().toString()
        );
    }
}
