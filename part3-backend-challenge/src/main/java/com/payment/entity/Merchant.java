package com.payment.entity;

import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
@MappedEntity(value = "merchants", schema = "operators")
public class Merchant {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    @MappedProperty("id")
    private Long merchantId;

    private String name;
    private String email;
    private String phone;
    
    @MappedProperty("business_name")
    private String businessName;
    
    private String category;
    private String pan;
    private String status;

    @DateCreated
    @MappedProperty("created_at")
    private Instant createdAt;

    @DateUpdated
    @MappedProperty("updated_at")
    private Instant updatedAt;

    // Getters and Setters
    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPan() {
        return pan;
    }

    public void setPan(String pan) {
        this.pan = pan;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
