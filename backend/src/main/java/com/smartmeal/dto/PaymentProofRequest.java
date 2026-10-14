package com.smartmeal.dto;

public class PaymentProofRequest {

    private String providerReference; // UPI UTR or reference number entered by user

    public PaymentProofRequest() {
    }

    public PaymentProofRequest(String providerReference) {
        this.providerReference = providerReference;
    }

    public String getProviderReference() {
        return providerReference;
    }

    public void setProviderReference(String providerReference) {
        this.providerReference = providerReference;
    }
}
