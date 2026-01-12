package org.example.beelearning.dto.course;

public class TeacherCourseStatsResponse {
    private long totalStudents;
    private long submittedStudents;
    private long totalAssignments;
    private long totalSubmissions;
    private Double averageScore;
    private Double submissionRate;

    public TeacherCourseStatsResponse(long totalStudents, long submittedStudents,
                                      long totalAssignments, long totalSubmissions,
                                      Double averageScore, Double submissionRate) {
        this.totalStudents = totalStudents;
        this.submittedStudents = submittedStudents;
        this.totalAssignments = totalAssignments;
        this.totalSubmissions = totalSubmissions;
        this.averageScore = averageScore;
        this.submissionRate = submissionRate;
    }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getSubmittedStudents() { return submittedStudents; }
    public void setSubmittedStudents(long submittedStudents) { this.submittedStudents = submittedStudents; }
    public long getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(long totalAssignments) { this.totalAssignments = totalAssignments; }
    public long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Double getSubmissionRate() { return submissionRate; }
    public void setSubmissionRate(Double submissionRate) { this.submissionRate = submissionRate; }
}