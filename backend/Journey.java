package com.safetravel.backend;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "journeys")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userName;        // later we can link to real User

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private String status;          // e.g. "ACTIVE", "ENDED"
}
