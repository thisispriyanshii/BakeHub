package com.bakehub.my.repository;

import com.bakehub.my.entity.CustomizationOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CustomizationOptionRepository extends JpaRepository<CustomizationOption, Long> {
    List<CustomizationOption> findByType(String type);

    Optional<CustomizationOption> findByNameAndType(String name, String type);

    @Modifying
    @Transactional
    void deleteByType(String type);
}
