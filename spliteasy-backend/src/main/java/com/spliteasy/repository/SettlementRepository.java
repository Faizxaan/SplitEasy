package com.spliteasy.repository;

import com.spliteasy.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, UUID> {

    List<Settlement> findByGroupIdOrderBySettledAtDesc(UUID groupId);
    void deleteByGroupId(UUID groupId);

    @Query("SELECT s FROM Settlement s WHERE s.group.id = :groupId AND (s.paidBy.id = :userId OR s.paidTo.id = :userId) ORDER BY s.settledAt DESC")
    List<Settlement> findByGroupIdAndUserId(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    @Query("SELECT SUM(s.amount) FROM Settlement s WHERE s.group.id = :groupId AND s.paidBy.id = :userId")
    BigDecimal sumPaidByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);

    @Query("SELECT SUM(s.amount) FROM Settlement s WHERE s.group.id = :groupId AND s.paidTo.id = :userId")
    BigDecimal sumReceivedByUserInGroup(@Param("groupId") UUID groupId, @Param("userId") UUID userId);
}
