package org.example.beelearning.dto.auth;



import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateMeRequest {
    private String fullName;     // map vào firstName
    private String email;        // ✅ cho sửa email
    private LocalDate ngaySinh;
    private String soDienThoai;
    private Boolean gioiTinh;    // true/false
}
