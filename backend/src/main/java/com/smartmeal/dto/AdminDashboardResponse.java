package com.smartmeal.dto;

import java.math.BigDecimal;

public class AdminDashboardResponse {

    private long totalOrdersToday;
    private long totalPaidOrdersToday;
    private BigDecimal totalRevenueToday;
    private long pendingPayments;
    private long activeMenuItems;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalOrdersToday, long totalPaidOrdersToday, BigDecimal totalRevenueToday, long pendingPayments, long activeMenuItems) {
        this.totalOrdersToday = totalOrdersToday;
        this.totalPaidOrdersToday = totalPaidOrdersToday;
        this.totalRevenueToday = totalRevenueToday;
        this.pendingPayments = pendingPayments;
        this.activeMenuItems = activeMenuItems;
    }

    public long getTotalOrdersToday() {
        return totalOrdersToday;
    }

    public void setTotalOrdersToday(long totalOrdersToday) {
        this.totalOrdersToday = totalOrdersToday;
    }

    public long getTotalPaidOrdersToday() {
        return totalPaidOrdersToday;
    }

    public void setTotalPaidOrdersToday(long totalPaidOrdersToday) {
        this.totalPaidOrdersToday = totalPaidOrdersToday;
    }

    public BigDecimal getTotalRevenueToday() {
        return totalRevenueToday;
    }

    public void setTotalRevenueToday(BigDecimal totalRevenueToday) {
        this.totalRevenueToday = totalRevenueToday;
    }

    public long getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(long pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public long getActiveMenuItems() {
        return activeMenuItems;
    }

    public void setActiveMenuItems(long activeMenuItems) {
        this.activeMenuItems = activeMenuItems;
    }
}
