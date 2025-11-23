package com.payment.controller;

import io.micronaut.http.annotation.Controller;
import io.swagger.v3.oas.annotations.tags.Tag;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Put;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.QueryValue;
import io.swagger.v3.oas.annotations.Operation;
import com.payment.entity.Merchant;
import com.payment.repository.MerchantRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


@Controller("/api/v1/merchants")
@Tag(name = "Merchants")
public class MerchantController {

    private final MerchantRepository merchantRepository;
    
    public MerchantController(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    /**
     * GET /api/v1/merchants
     * List all merchants with optional pagination
     */
    @Get
    @Operation(
        summary = "List all merchants",
        description = "Returns a paginated list of all merchants"
    )
    public HttpResponse<Map<String, Object>> listMerchants(
            @QueryValue Optional<Integer> page,
            @QueryValue Optional<Integer> limit,
            @QueryValue Optional<String> search,
            @QueryValue Optional<String> category,
            @QueryValue Optional<String> status
    ) {
        int currentPage = page.orElse(1);
        int pageSize = limit.orElse(10);
        
        // Get all merchants
        Iterable<Merchant> allMerchants = merchantRepository.findAll();
        List<Merchant> merchantList = StreamSupport
            .stream(allMerchants.spliterator(), false)
            .collect(Collectors.toList());
        
        // Apply search filter if provided
        if (search.isPresent() && !search.get().isEmpty()) {
            String searchTerm = search.get().toLowerCase();
            merchantList = merchantList.stream()
                .filter(m -> m.getName().toLowerCase().contains(searchTerm) ||
                           m.getBusinessName().toLowerCase().contains(searchTerm) ||
                           m.getEmail().toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
        }
        
        // Apply category filter if provided
        if (category.isPresent() && !category.get().isEmpty()) {
            merchantList = merchantList.stream()
                .filter(m -> m.getCategory().equalsIgnoreCase(category.get()))
                .collect(Collectors.toList());
        }
        
        // Apply status filter if provided
        if (status.isPresent() && !status.get().isEmpty()) {
            merchantList = merchantList.stream()
                .filter(m -> m.getStatus().equalsIgnoreCase(status.get()))
                .collect(Collectors.toList());
        }
        
        // Calculate pagination
        int totalItems = merchantList.size();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);
        int startIndex = (currentPage - 1) * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalItems);
        
        // Get paginated data
        List<Merchant> paginatedMerchants = merchantList.subList(
            Math.max(0, startIndex), 
            Math.max(0, endIndex)
        );
        
        return HttpResponse.ok(Map.of(
            "data", paginatedMerchants,
            "page", currentPage,
            "limit", pageSize,
            "totalItems", totalItems,
            "totalPages", totalPages,
            "hasNextPage", currentPage < totalPages,
            "hasPrevPage", currentPage > 1
        ));
    }

    /**
     * POST /api/v1/merchants
     * Create a new merchant
     */
    @Post
    @Operation(
        summary = "Create new merchant",
        description = "Creates a new merchant with the provided information"
    )
    public HttpResponse<Map<String, Object>> createMerchant(@Body Merchant merchant) {
        try {
            // Validate email uniqueness
            Optional<Merchant> existingEmail = merchantRepository.findByEmail(merchant.getEmail());
            if (existingEmail.isPresent()) {
                return HttpResponse.badRequest(Map.of(
                    "message", "Email already exists. Please use a different email address.",
                    "field", "email"
                ));
            }
            
            // Validate phone uniqueness
            Optional<Merchant> existingPhone = merchantRepository.findByPhone(merchant.getPhone());
            if (existingPhone.isPresent()) {
                return HttpResponse.badRequest(Map.of(
                    "message", "Phone number already exists. Please use a different phone number.",
                    "field", "phone"
                ));
            }
            
            // Validate PAN uniqueness
            Optional<Merchant> existingPan = merchantRepository.findByPan(merchant.getPan());
            if (existingPan.isPresent()) {
                return HttpResponse.badRequest(Map.of(
                    "message", "PAN already exists. Please use a different PAN.",
                    "field", "pan"
                ));
            }
            
            // Set default status to active if not provided
            if (merchant.getStatus() == null || merchant.getStatus().isEmpty()) {
                merchant.setStatus("active");
            }
            
            // Save the merchant
            Merchant savedMerchant = merchantRepository.save(merchant);
            
            return HttpResponse.created(Map.of(
                "message", "Merchant created successfully",
                "data", savedMerchant
            ));
        } catch (Exception e) {
            return HttpResponse.serverError(Map.of(
                "message", "Failed to create merchant. Please try again later.",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/v1/merchants/{id}
     * Get merchant details by ID
     */
    @Get("/{id}")
    @Operation(
        summary = "Get merchant details",
        description = "Returns detailed information about a specific merchant"
    )
    public HttpResponse<Merchant> getMerchantById(@PathVariable Long id) {
        Optional<Merchant> merchant = merchantRepository.findById(id);
        
        if (merchant.isPresent()) {
            return HttpResponse.ok(merchant.get());
        } else {
            return HttpResponse.notFound();
        }
    }

    /**
     * PUT /api/v1/merchants/{id}
     * Update merchant information
     */
    @Put("/{id}")
    @Operation(
        summary = "Update merchant",
        description = "Updates an existing merchant's information"
    )
    public HttpResponse<Map<String, Object>> updateMerchant(
            @PathVariable Long id,
            @Body Merchant updatedMerchant
    ) {
        try {
            Optional<Merchant> existingMerchant = merchantRepository.findById(id);
            
            if (!existingMerchant.isPresent()) {
                return HttpResponse.notFound(Map.of(
                    "message", "Merchant not found with ID: " + id
                ));
            }
            
            Merchant merchant = existingMerchant.get();
            
            // Validate email uniqueness (if email is being updated)
            if (updatedMerchant.getEmail() != null && !updatedMerchant.getEmail().equals(merchant.getEmail())) {
                Optional<Merchant> existingEmail = merchantRepository.findByEmail(updatedMerchant.getEmail());
                if (existingEmail.isPresent()) {
                    return HttpResponse.badRequest(Map.of(
                        "message", "Email already exists. Please use a different email address.",
                        "field", "email"
                    ));
                }
            }
            
            // Validate phone uniqueness (if phone is being updated)
            if (updatedMerchant.getPhone() != null && !updatedMerchant.getPhone().equals(merchant.getPhone())) {
                Optional<Merchant> existingPhone = merchantRepository.findByPhone(updatedMerchant.getPhone());
                if (existingPhone.isPresent()) {
                    return HttpResponse.badRequest(Map.of(
                        "message", "Phone number already exists. Please use a different phone number.",
                        "field", "phone"
                    ));
                }
            }
            
            // Validate PAN uniqueness (if PAN is being updated)
            if (updatedMerchant.getPan() != null && !updatedMerchant.getPan().equals(merchant.getPan())) {
                Optional<Merchant> existingPan = merchantRepository.findByPan(updatedMerchant.getPan());
                if (existingPan.isPresent()) {
                    return HttpResponse.badRequest(Map.of(
                        "message", "PAN already exists. Please use a different PAN.",
                        "field", "pan"
                    ));
                }
            }
            
            // Update fields
            if (updatedMerchant.getName() != null) {
                merchant.setName(updatedMerchant.getName());
            }
            if (updatedMerchant.getEmail() != null) {
                merchant.setEmail(updatedMerchant.getEmail());
            }
            if (updatedMerchant.getPhone() != null) {
                merchant.setPhone(updatedMerchant.getPhone());
            }
            if (updatedMerchant.getBusinessName() != null) {
                merchant.setBusinessName(updatedMerchant.getBusinessName());
            }
            if (updatedMerchant.getCategory() != null) {
                merchant.setCategory(updatedMerchant.getCategory());
            }
            if (updatedMerchant.getPan() != null) {
                merchant.setPan(updatedMerchant.getPan());
            }
            if (updatedMerchant.getStatus() != null) {
                merchant.setStatus(updatedMerchant.getStatus());
            }
            
            // Save updated merchant
            Merchant saved = merchantRepository.update(merchant);
            
            return HttpResponse.ok(Map.of(
                "message", "Merchant updated successfully",
                "data", saved
            ));
        } catch (Exception e) {
            return HttpResponse.serverError(Map.of(
                "message", "Failed to update merchant. Please try again later.",
                "error", e.getMessage()
            ));
        }
    }
}
