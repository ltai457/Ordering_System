namespace DigitalMenuSystem.API.DTOs.Auth
{
    public class UserInfoDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        
        // Permissions from Role
        public bool CanManageMenu { get; set; }
        public bool CanManageOrders { get; set; }
        public bool CanManageUsers { get; set; }
        public bool CanManageTables { get; set; }
        public bool CanViewReports { get; set; }
    }
}