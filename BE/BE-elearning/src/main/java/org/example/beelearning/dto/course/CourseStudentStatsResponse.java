package org.example.beelearning.dto.course;

public class CourseStudentStatsResponse {
    private long totalAssignments;
    private long submittedAssignments;
    private long pendingAssignments;
    private String courseStatus;
    public CourseStudentStatsResponse() {
    }
    public CourseStudentStatsResponse(long totalAssignments,
                                      long submittedAssignments,
                                      long pendingAssignments,
                                      String courseStatus) {
        this.totalAssignments = totalAssignments;
        this.submittedAssignments = submittedAssignments;
        this.pendingAssignments = pendingAssignments;
        this.courseStatus = courseStatus;
    }
    public long getTotalAssignments() {
        return totalAssignments;
    }
    public void setTotalAssignments(long totalAssignments) {
        this.totalAssignments = totalAssignments;
    }
    public long getSubmittedAssignments() {
        return submittedAssignments;
    }
    public void setSubmittedAssignments(long submittedAssignments) {
        this.submittedAssignments = submittedAssignments;
    }
    public long getPendingAssignments() {
        return pendingAssignments;
    }
    public void setPendingAssignments(long pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
    }
    public String getCourseStatus() {
        return courseStatus;
    }
    public void setCourseStatus(String courseStatus) {
        this.courseStatus = courseStatus;
    }
}
