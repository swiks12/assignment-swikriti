package com.payment.repository;

import com.payment.entity.Merchant;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

@Repository
@JdbcRepository(dialect = Dialect.POSTGRES)
public interface MerchantRepository extends CrudRepository<Merchant, Long> {
    Optional<Merchant> findByMerchantId(Long merchantId);
    List<Merchant> findByNameLike(String namePattern);
    
    // Check for duplicates
    Optional<Merchant> findByEmail(String email);
    Optional<Merchant> findByPhone(String phone);
    Optional<Merchant> findByPan(String pan);
}
